const crypto = require('crypto');

const serverOprfKey = crypto.randomBytes(32);

module.exports = {
    serverOprfKey: serverOprfKey;
}

module.exports.generateOPRFKey = function(username: string) => {
    // Generate a server-owned OPRF key specific to user
    const salt = crypto.randomBytes(32);
    const oprfKey = crypto.pbkdf2Sync(username, salt, 100000, 32, 'sha256');
    
    const r = crypto.randomBytes(32);
    const blindedKey = crypto.createHash('sha256').update(r).update(oprfKey).digest();
    return { salt: salt, oprfKey: blindedKey };
}