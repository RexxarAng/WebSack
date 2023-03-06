import { Buffer } from 'buffer';
import { createHash, createCipher, createDecipher, createSign, publicEncrypt, constants } from 'crypto-browserify';
import { eddsa, utils, ec } from 'elliptic';
import { BN } from 'bn.js';
import * as ecies from 'eciesjs';
import * as forge from 'node-forge';


global.Buffer = Buffer;
// create a new elliptic curve object with the desired curve name
const curve = new ec('ed25519');

// Compute rwd key
export function oprfOutput(password: any, oprfKey: any) {
    const curve = new eddsa('ed25519');
    const hashedPassword = createHash('sha256').update(password).digest();
    const hashedPasswordBuffer = Buffer.from(hashedPassword);
    const oprfKeyBuffer = Buffer.from(oprfKey, 'hex');
    const passwordPoint = curve.curve.pointFromX(hashedPasswordBuffer, true);
    const scalar = new BN(oprfKeyBuffer);
    const rwdKey = passwordPoint.mul(scalar).encode('hex', false);
    return rwdKey
}

// Generate private-public keypair
export function generateKeyPair() {

    // generate a new keypair
    const keypair = curve.genKeyPair();

    // get the private key in a buffer format
    const privateKeyString = keypair.getPrivate('hex');

    // get the public key in a buffer format
    const publicKeyString = keypair.getPublic('hex');

    return { "privateKey": privateKeyString, "publicKey": publicKeyString }
}

// Function to encrypt using RWD key
export function encryptWithRWDKey(envelope: any, rwdKey: string) {
    const envelopeString = JSON.stringify(envelope);
    const inputBuffer = Buffer.from(envelopeString, 'utf8');
    const cipher = createCipher('aes-256-gcm', rwdKey);
    let encrypted = cipher.update(inputBuffer, null, 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return { "encryptedEnvelope": encrypted, "authTag": authTag};
}

export function decryptEnvelope(encryptedData: string, authTag: string, rwdKey: string) {
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

// export async function encryptData(data: any, key: string) {
//     const encryptedBuffer = Buffer.from(data);
//     const encryptedData = publicEncrypt({
//       key: key,
//       padding: constants.RSA_PKCS1_OAEP_PADDING,
//       oaepHash: 'sha256',
//     }, encryptedBuffer);
//     const encryptedDataHex = encryptedData.toString('hex');
//     return encryptedDataHex;
// }

export async function encryptData(data: any, key: string) {
    const encrypted = forge.pki.publicKeyFromPem(key).encrypt(forge.util.encodeUtf8(data));
    return forge.util.encode64(encrypted);
}

export async function signData(data: any, key: string) {
    const privateKeyBuffer = Buffer.from(key, 'hex');
    const signature = await curve.sign(data, privateKeyBuffer);
    return { data: data, signature: Buffer.from(signature.toDER()).toString('hex') };
}

