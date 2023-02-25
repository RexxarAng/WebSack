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

module.exports = { validateEmail, validatePassword, validateDataUrl };