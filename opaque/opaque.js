const crypto = require('crypto');
const elliptic = require('elliptic');
const serverOprfKey = crypto.randomBytes(32);
const bigInt = require('big-integer');

// Define the elliptic curve to use (in this example, we use curve ed25519)
const curve = elliptic.curves['ed25519'];

// Define a secret value and a random salt
const secret = 'my-secret-password';
const salt = crypto.randomBytes(16);

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
