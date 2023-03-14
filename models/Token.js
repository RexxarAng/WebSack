const mongoose = require('mongoose')

const TokenSchema = new mongoose.Schema({
    value: {
        type: String,
        unique: true,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now,
        expires: 86400
    }
})

const Token = module.exports = mongoose.model('Token', TokenSchema)

module.exports.addToken = function(token, callback) {
    token.save(callback);
}