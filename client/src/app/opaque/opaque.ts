import { Buffer } from 'buffer';
import { createHash, createCipher, createDecipher, createSign, publicEncrypt, constants, pbkdf2Sync } from 'crypto-browserify';
import { eddsa, utils, ec } from 'elliptic';
import { BN } from 'bn.js';
import * as ecies from 'eciesjs';
import * as forge from 'node-forge';

global.Buffer = Buffer;

// create a new elliptic curve object with the desired curve name
const curve = new ec('ed25519');

/* 
During sign up process to generate client keypair, encrypt envelope containing server's 
public key and client's private key using password and oprf key.
Finally returns the encrypted envelope, authTag used to encrypt the envelope and the client's public key
*/
export function generateEncryptedEnvelopeAndKeyPair(password: string, oprfKey: string, serverPublicKey: string, salt: any) {
    const rwdKey = oprfOutput(password, oprfKey, salt);
    const keyPair = generateKeyPair();
    const envelope = {
      clientPrivateKey: keyPair.privateKey,
      serverPublicKey: serverPublicKey,
    }
    const encryptedOutput = encryptEnvelope(envelope, rwdKey);
    console.log(`encryptedEnvelope: ${encryptedOutput.encryptedEnvelope}`);
    console.log(`rwdKey: ${rwdKey}`);
    return { "encryptedEnvelope": encryptedOutput.encryptedEnvelope, "authTag": encryptedOutput.authTag, "clientPublicKey": keyPair.publicKey };
}

/* 
During login process to generate the same key used to encrypt the envelope 
with password and oprfKey and decrypt the envelope to get the client's 
private key and server's public key. Then generate a timestamp to sign it 
with the client's private key before encrypting it with the server's public key.
Finally returns the encrypted data (also known as the authentication message)
*/
export async function handleAuthentication(password: string, oprfKey: string, encryptedEnvelope: string, authTag: string, salt: any) {
    const rwdKey = oprfOutput(password, oprfKey, salt)
    console.log(`rwdKey: ${rwdKey}`)
    console.log(`EncryptedEnvelope: ${encryptedEnvelope}`);
    const envelope = decryptEnvelope(encryptedEnvelope, authTag, rwdKey);
    console.log(`Envelope: ${envelope.serverPublicKey}`);
    const currentTime = new Date().toISOString();
    console.log(currentTime);
    const signedTimeObject = await signData(currentTime, envelope.clientPrivateKey);
    console.log(signedTimeObject);
    const encryptedData = await encryptData(JSON.stringify(signedTimeObject), envelope.serverPublicKey);
    console.log(`rwdKey: ${rwdKey}`);
    console.log(`encryptedData: ${encryptedData}`);
    return encryptedData;
}

// Compute rwd key
function oprfOutput(password: any, oprfKey: any, salt: any) {
    const curve = new eddsa('ed25519');
    const hashedPassword = createHash('sha256').update(password).digest();
    const hashedPasswordBuffer = Buffer.from(hashedPassword);
    const oprfKeyBuffer = Buffer.from(oprfKey, 'hex');
    const passwordPoint = curve.curve.pointFromX(hashedPasswordBuffer, true);
    const scalar = new BN(oprfKeyBuffer);
    const rwdKey = passwordPoint.mul(scalar).encode('hex', false);
    const derivedKey = hIterFunction(rwdKey, salt);
    return derivedKey; 
}

function hIterFunction(rwdKey: any, salt: any) {
    const iterations = 10000; // choose the number of iterations
    const keyLen = 32; // choose the desired key length
    const passwordBuffer = Buffer.from(rwdKey);
    const derivedKey = pbkdf2Sync(passwordBuffer, salt, iterations, keyLen, 'sha256');
    return derivedKey;
}


// Generate private-public keypair
function generateKeyPair() {

    // generate a new keypair
    const keypair = curve.genKeyPair();

    // get the private key in a buffer format
    const privateKeyString = keypair.getPrivate('hex');

    // get the public key in a buffer format
    const publicKeyString = keypair.getPublic('hex');

    return { "privateKey": privateKeyString, "publicKey": publicKeyString }
}

// Function to encrypt using RWD key
function encryptEnvelope(envelope: any, rwdKey: string) {
    const envelopeString = JSON.stringify(envelope);
    const inputBuffer = Buffer.from(envelopeString, 'utf8');
    const cipher = createCipher('aes-256-gcm', rwdKey);
    let encrypted = cipher.update(inputBuffer, null, 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return { "encryptedEnvelope": encrypted, "authTag": authTag};
}

function decryptEnvelope(encryptedData: string, authTag: string, rwdKey: string) {
    const decipher = createDecipher('aes-256-gcm', rwdKey);
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
    let decrypted = decipher.update(encryptedData, 'hex');
    decrypted = Buffer.concat([decrypted, decipher.final()]);
  
    const decryptedString = decrypted.toString('utf8');
    return JSON.parse(decryptedString);
}


function pemToArrayBuffer(key: string) {
    const buf = new ArrayBuffer(key.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, keyLen = key.length; i < keyLen; i++) {
      bufView[i] = key.charCodeAt(i);
    }
    return buf;
}


async function encryptData(data: any, key: string) {
    const encrypted = forge.pki.publicKeyFromPem(key).encrypt(forge.util.encodeUtf8(data));
    return forge.util.encode64(encrypted);
}

async function signData(data: any, key: string) {
    const privateKeyBuffer = Buffer.from(key, 'hex');
    const signature = await curve.sign(data, privateKeyBuffer);
    return { data: data, signature: Buffer.from(signature.toDER()).toString('hex') };
}


