declare module 'app/opaque/opaque.js' {
  // Export any types or interfaces that opaque.js defines here
  export function oprfOutput(password: any, oprfKey: any): string;
  export function generateKeyPair(): { privateKey: string; publicKey: string };
  export function encryptWithRWDKey(data: any, rwdKey: string): any;
  export function decryptEnvelope(encryptedData: string, authTag: string, rwdKey: string): any;
  export function encryptData(data: any, publicKey: string): any;
  export function signData(data: any, privateKey: string): any;
}
