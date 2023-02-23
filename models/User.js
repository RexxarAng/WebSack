const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    // gotchaImages: [{
    //     type: String,
    //     required: true
    // }],
    // gotchaPasscode: {
    //     type: String,
    //     required: true
    // }
})

const User = mongoose.model('User', UserSchema)

module.exports = User