import { Injectable } from '@angular/core';
import * as forge from 'node-forge';

@Injectable({
  providedIn: 'root',
})
export class GotchaService {
  // Variable Declaration
  constructor() {}

  // Hashing password [Client]
  uKeyPrep(password: string): string {
    const md = forge.md.sha256.create();
    md.update(password, 'utf8'); // calculate the SHA256 hash of the file content
    const uKey = md.digest().toHex();
    return uKey;
  }

  // Encrypting verifierHash [Server]
  /**
   * Image Verifier Hash Encryptor.
   * This code generates a random salt, derives a key from the ePwd using PBKDF2, 
   * generates a random IV, creates a new AES-CBC cipher, encrypts the vHash, encodes 
   * the salt, IV, and encrypted bytes as Base64, concatenates them with colons, 
   * and returns the result.
   * @param vHash
   * @param ePwd 
   * @returns 
   */
  vHashEncrypt(vHash: string, ePwd: string): string {
    const salt = forge.random.getBytesSync(16); // Generate a random salt
    const key = forge.pkcs5.pbkdf2(ePwd, salt, 10000, 32); // Derive a key from the password
    const iv = forge.random.getBytesSync(16); // Generate a random IV
    // Create a new AES-CBC cipher
    const cipher = forge.cipher.createCipher('AES-CBC', key); 
    cipher.start({ iv: iv });
    cipher.update(forge.util.createBuffer(vHash));
    cipher.finish();
    const encrypted = cipher.output.getBytes();               // Get the encrypted bytes
    const encodedSalt = forge.util.encode64(salt);            // Encode the salt as Base64
    const encodedIv = forge.util.encode64(iv);                // Encode the IV as Base64
    const encodedEncrypted = forge.util.encode64(encrypted);  // Encode the encrypted bytes as Base64
    // Concatenate the encoded salt, IV, and encrypted bytes
    const result = encodedSalt + ':' + encodedIv + ':' + encodedEncrypted; 
    return result;
  }
}
