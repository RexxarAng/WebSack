const crypto = require('crypto');
const elliptic = require('elliptic');
const serverOprfKey = crypto.randomBytes(32);
const bigInt = require('big-integer');
const forge = require('node-forge');
const fs = require('fs');

// Define the elliptic curve to use (in this example, we use curve ed25519)
const curve = elliptic.ec('ed25519');

const file = './secrets.json';
let secret, salt;

// Check if the file exists
if (fs.existsSync(file)) {
    // Read the secret and salt from the file
    const data = JSON.parse(fs.readFileSync(file));
    secret = data.secret;
    salt = Buffer.from(data.salt, 'hex');
  } else {
    // Generate a new secret and salt
    secret = 'h@ckerman@websack';
    salt = crypto.randomBytes(16);
    // Write the secret and salt to the file
    fs.writeFileSync(file, JSON.stringify({ secret, salt: salt.toString('hex') }));
}
console.log(`salt: ${salt.toString('hex')}`);

// Derive the master OPRF key from the secret and salt using a KDF
const serverOPRFKey = crypto.pbkdf2Sync(secret, salt, 100000, 32, 'sha256');

console.log(serverOPRFKey.toString('hex'));

module.exports = {
    "serverOprfKey": serverOprfKey
}

module.exports.generateOPRFKey = function(username) {
    console.log(username);
    // Derive a user-specific key from the server's master OPRF key and the username
    const userOPRFKey = crypto.createHmac('sha256', serverOPRFKey).update(username).digest();
    // Convert the user-specific key to a BigInt
    const scalar = BigInt(`0x${userOPRFKey.toString('hex')}`);
    // Ensure the scalar is in the range [1, n-1]
    const scalarMod = scalar % BigInt(curve.n);
    return scalarMod.toString(16);
}


module.exports.generateServerKey = function() {
    // Generate RSA key pair
    const keyPair = forge.pki.rsa.generateKeyPair({bits: 4096});

    // Convert public key to PEM format
    const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);

    // Convert private key to PEM format
    const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);

    return { "privateKey": privateKeyPem, "publicKey": publicKeyPem}

}

module.exports.decryptAndVerify = async function(answer, serverPrivateKey, clientPublicKey) { 
    let dataObject = await decryptData(answer, serverPrivateKey);
    console.log(`Date Given: ${dataObject}`);
    dataObject = JSON.parse(dataObject);
    let isVerified = await verifySignature(dataObject.data, dataObject.signature, clientPublicKey);

    if (!isVerified) return false;

    // Convert the date string to a Date object
    const date = new Date(dataObject.data);

    // Get the current time in milliseconds
    const now = Date.now();

    const diff = now - date.getTime();

    // Check if the difference is less than or equal to 15 seconds
    // if (diff <= 15000) {
    //     console.log('The date is within the last 15 seconds');
    //     return true;
    // } else {
    //     console.log('The date is not within the last 15 seconds');
    //     return false;
    // }
    isVerified = (diff <= 15000) ? true : false;
    return isVerified;

}

module.exports.genSalt = function() {
    const saltLength = 16; // Salt Length in bytes
    return crypto.randomBytes(saltLength).toString('hex');
}

decryptData = async function(data, key) {
    data = forge.util.decode64(data);
    const decrypted = await forge.pki.privateKeyFromPem(key).decrypt(data);
    return decrypted;
}

verifySignature = async function(data, signature, key) {
    const signatureBuffer = Buffer.from(signature, 'hex');
    isValid = curve.keyFromPublic(key, 'hex').verify(data, signatureBuffer);
    return isValid;
}