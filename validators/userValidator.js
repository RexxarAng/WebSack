const fs = require('fs');

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function validatePassword(password) {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+~\-={}\[\]|\\:;"'<>,.?\/]).{8,}$/;
    return re.test(password);
}

function validateDataUrl(dataUrl) {
    const re = /^data:image\/([\w+]+);base64,([\s\S]+)/;
    return re.test(dataUrl);
}

function validateExistingUser(object) {
    if (!object) {
        return false;
    }
    if (object && (object.encryptedEnvelope == null || object.encryptedEnvelope == undefined) && (object.authTag == null || object.authTag == undefined)) {
        return false;
    }
    return true;
}

module.exports = { validateEmail, validatePassword, validateDataUrl, validateExistingUser };