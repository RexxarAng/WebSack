const mongoose = require('mongoose')

const KeySchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    privateKey: {
        type: String,
        required: true
    },
    publicKey: {
        type: String,
        required: true
    }
})

const Key = module.exports = mongoose.model('Key', KeySchema)

