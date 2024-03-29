const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    // passwordVerifier: {
    //     type: String,
    //     requireD: true
    // },
    encryptedEnvelope: {
        type: String,
    },
    authTag: {
        type: String,
        required: true
    },
    clientPublicKey:{
        type: String
    },
    imgName: {
        type: String,
    },
    imgVerifier: {
        type: String,
    },
    oprfKey: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    }
    // gotchaImages: [{
    //     type: String,
    //     required: true
    // }],
    // gotchaPasscode: {
    //     type: String,
    //     required: true
    // }
})

const User = module.exports = mongoose.model('User', UserSchema)

module.exports.getUserById = function(id, callback) {
    User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback) {
    const query = {username: username};
    User.findOne(query, callback);
}

module.exports.addUser = function(newUser, callback) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if (err) throw err;
        callback(null, isMatch);
    });
}
