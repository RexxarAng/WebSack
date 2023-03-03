const crypto = require('crypto');
const elliptic = require('elliptic');
const serverOprfKey = crypto.randomBytes(32);

// Define the elliptic curve to use (in this example, we use curve P-256)
const curve = elliptic.curves['p256'];

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
    // Derive a user-specific key from the server's master OPRF key and the username
    const userOPRFKey = crypto.createHmac('sha256', serverOPRFKey).update(username).digest();
    // Convert the user-specific key to a elliptic curve scalar using SHA-256 as the hash function
    const scalar = new elliptic.utils.BigInt(userOPRFKey.toString('hex'), 16).mod(curve.n);
    return scalar;
}