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
    const dKey = oprfOutput(password, oprfKey, salt);
    const keyPair = generateKeyPair();
    const envelope = {
      clientPrivateKey: keyPair.privateKey,
      serverPublicKey: serverPublicKey,
    }
    const encryptedOutput = encryptEnvelope(envelope, dKey);
    console.log(`encryptedEnvelope: ${encryptedOutput.encryptedEnvelope}`);
    console.log(`dKey: ${dKey}`);
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
    const dKey = oprfOutput(password, oprfKey, salt)
    console.log(`dKey: ${dKey}`)
    console.log(`EncryptedEnvelope: ${encryptedEnvelope}`);
    const envelope = decryptEnvelope(encryptedEnvelope, authTag, dKey);
    console.log(`Envelope: ${envelope.serverPublicKey}`);
    const currentTime = new Date().toISOString();
    console.log(currentTime);
    const signedTimeObject = await signData(currentTime, envelope.clientPrivateKey);
    console.log(signedTimeObject);
    const encryptedData = await encryptData(JSON.stringify(signedTimeObject), envelope.serverPublicKey);
    console.log(`dKey: ${dKey}`);
    console.log(`encryptedData: ${encryptedData}`);
    return encryptedData;
}

/** 
 * Compute rwd key from user password, unique OPRFkey, salt from image hash. Achieved
 * by using EDDSA-ED25519, and SHA256 hashing on the password to compute the key. 
 * Resultant rwd key then hashed using KDF - PBKDF2, for n iterations to strengthen
 * resistance to dictionary attacks. Force H^n(F(pwd,oprfkey,salt)) number of
 * computations for each user if brute-forced.
*/
function oprfOutput(password: any, oprfKey: any, salt: any) {
    // Create new digital signature curve object with ED25519 algo as choice
    const curve = new eddsa('ed25519');
    const hashedPassword = createHash('sha256').update(password).digest();      // Password is hashed
    const hashedPasswordBuffer = Buffer.from(hashedPassword);                  
    const oprfKeyBuffer = Buffer.from(oprfKey, 'hex');          
    console.log(`Password Buffer Length: ${hashedPasswordBuffer.length}}`)
    // Establish point of reference for verification on curve for given password hash                
    const passwordPoint = curve.curve.pointFromX(hashedPasswordBuffer, true); 
    const scalar = new BN(oprfKeyBuffer);
    // Digital signature key derived and encoded into hex
    const rwdKey = passwordPoint.mul(scalar).encode('hex', false);
    const derivedKey = hIterFunction(rwdKey, salt);
    return derivedKey; 
}


/**
 * Proposed in "OPAQUE: An Asymmetric PAKE Protocol Secure Against Pre-Computation Attacks",
 * to perform H^n() iterated hashing of resultant rwd key for improving resistance (HKDF). Where
 * hash algorithm is replaced with KDF - PBKDF2, for (n) >= 100 number of iterations. Algorithm
 * consists of computing a pseudo random number of iterations based on a given halting condition.
 * 
 * @param rwdKey 
 * @param salt 
 * @returns 
 */
function hIterFunction(rwdKey: any, salt: any) {
    let iterations = 1000;
    const keyLen = 32; // choose the desired key length
    let derivedKey = Buffer.alloc(keyLen);
    let prevDerivedKey = Buffer.alloc(keyLen);

    const passwordBuffer = Buffer.from(rwdKey);
    
    // Hash the initial key using salt as the IV
    derivedKey = pbkdf2Sync(passwordBuffer, salt, iterations, keyLen, 'sha512');
  
    // Iterate the hash function until a halting condition is met
    while (true) {
      // Compute the hash of the previous derived key concatenated with the salt
      prevDerivedKey = derivedKey;
      derivedKey = pbkdf2Sync(prevDerivedKey, salt, iterations, keyLen, 'sha512');
  
      // Check if the derived key has reached a halting condition, and at least 210k iterations from standards.
      if (isHaltingConditionMet(derivedKey) && iterations > 1219) {
        break;
      }
      
      // Increment the iteration count
      iterations++;
      console.log("Iterations:" + iterations);
    }
    console.log("Iterations:" + iterations);
    console.log("Derived Key:" + derivedKey.toString());
  
    // Return the final derived key and iteration count as a tuple
    return derivedKey.toString();
  }
  
/**
 * Halting condition for iterating HKDF function of rwd key.
 * @param key 
 * @returns 
 */
function isHaltingConditionMet(key: Buffer) {
    // Check if the most significant bit of the first byte is set
    // console.log(key);
    // return (key[0] & 0x80) === 0x80;

    // Count the number of leading zero bits in the first byte
    let byte = key[0];
    let numLeadingZeros = 0;
    while ((byte & 0x80) === 0) {
        byte <<= 1;
        numLeadingZeros++;
    }

    // Require a minimum number of leading zero bits
    const minLeadingZeros = 5;
    return numLeadingZeros >= minLeadingZeros;
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

/**
 * Function to encrypt using RWD key. Uses AES-GCM256 bit. Key based on HKDF.
 * Key is diff for each user, can't be exploited and reused for other envelopes. 
 * */ 
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


