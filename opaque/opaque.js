const crypto = require('crypto');
const elliptic = require('elliptic');
const serverOprfKey = crypto.randomBytes(32);
const bigInt = require('big-integer');
const forge = require('node-forge');
const fs = require('fs');

// Define the elliptic curve to use (in this example, we use curve ed25519)
const curve = elliptic.curves['ed25519'];

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

// module.exports.generateServerKey = function() {
//        // create a new elliptic curve object with the desired curve name
//        const curve = new elliptic.ec('ed25519');

//        // generate a new keypair
//        const keypair = curve.genKeyPair();
   
//        // get the private key in a buffer format
//        const privateKeyString = keypair.getPrivate('hex');
   
//        // get the public key in a buffer format
//        const publicKeyString = keypair.getPublic('hex');
   
//        return { "privateKey": privateKeyString, "publicKey": publicKeyString }
// }


// module.exports.generateServerKey = function() {
//     // Generate RSA key pair
//     const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
//         modulusLength: 4096,
//         publicKeyEncoding: {
//             type: 'spki',
//             format: 'pem',
//         },
//         privateKeyEncoding: {
//             type: 'pkcs8',
//             format: 'pem',
//             cipher: 'aes-256-cbc',
//             passphrase: 'hackerman',
//         }
//     });

// //     const data = 'Hello World!';
// //     const encryptedData = crypto.publicEncrypt({
// //         key: publicKey,
// //         padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
// //         oaepHash: 'sha256',
// //     }, Buffer.from(data));

// //     // Decrypt data
// //     const decryptedData = crypto.privateDecrypt({
// //         key: privateKey,
// //         padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
// //         oaepHash: 'sha256',
// //         passphrase: 'hackerman'
// //     }, encryptedData);
  
// //   console.log(decryptedData.toString()); // Output: Hello World!
//     return { "privateKey": privateKey, "publicKey": publicKey}
// }


module.exports.generateServerKey = function() {
    // Generate RSA key pair
    const keyPair = forge.pki.rsa.generateKeyPair({bits: 2048});

    // Convert public key to PEM format
    const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);

    // Convert private key to PEM format
    const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);

    return { "privateKey": privateKeyPem, "publicKey": publicKeyPem}

}


// module.exports.decryptData = function(data, key) {
//     const encryptedBuffer = Buffer.from(data, 'hex');

//     const decryptedData = crypto.privateDecrypt({
//         key: key,
//         passphrase: 'hackerman',
//         padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
//         oaepHash: 'sha256'
//     }, encryptedBuffer);

//     console.log(decryptedData.toString());
//     return decryptedData;
// }

module.exports.decryptData = async function(data, key) {
    data = forge.util.decode64(data);
    const decrypted = await forge.pki.privateKeyFromPem(key).decrypt(data);
    return decrypted;
}
