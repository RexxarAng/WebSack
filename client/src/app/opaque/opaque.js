"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
module.exports = {
  oprfOutput,
  generateKeyPair,
  encryptWithRWDKey,
  decryptEnvelope,
  encryptData,
  signData,
};
exports.signData = exports.encryptData = exports.decryptEnvelope = exports.encryptWithRWDKey = exports.generateKeyPair = exports.oprfOutput = void 0;
var buffer_1 = require("buffer");
var crypto_browserify_1 = require("crypto-browserify");
var elliptic_1 = require("elliptic");
var bn_js_1 = require("bn.js");
var forge = require("node-forge");
global.Buffer = buffer_1.Buffer;
// create a new elliptic curve object with the desired curve name
var curve = new elliptic_1.ec('ed25519');
// Compute rwd key
function oprfOutput(password, oprfKey) {
    var curve = new elliptic_1.eddsa('ed25519');
    var hashedPassword = (0, crypto_browserify_1.createHash)('sha256').update(password).digest();
    var hashedPasswordBuffer = buffer_1.Buffer.from(hashedPassword);
    var oprfKeyBuffer = buffer_1.Buffer.from(oprfKey, 'hex');
    var passwordPoint = curve.curve.pointFromX(hashedPasswordBuffer, true);
    var scalar = new bn_js_1.BN(oprfKeyBuffer);
    var rwdKey = passwordPoint.mul(scalar).encode('hex', false);
    return rwdKey;
}
exports.oprfOutput = oprfOutput;
// Generate private-public keypair
function generateKeyPair() {
    // generate a new keypair
    var keypair = curve.genKeyPair();
    // get the private key in a buffer format
    var privateKeyString = keypair.getPrivate('hex');
    // get the public key in a buffer format
    var publicKeyString = keypair.getPublic('hex');
    return { "privateKey": privateKeyString, "publicKey": publicKeyString };
}
exports.generateKeyPair = generateKeyPair;
// Function to encrypt using RWD key
function encryptWithRWDKey(envelope, rwdKey) {
    var envelopeString = JSON.stringify(envelope);
    var inputBuffer = buffer_1.Buffer.from(envelopeString, 'utf8');
    var cipher = (0, crypto_browserify_1.createCipher)('aes-256-gcm', rwdKey);
    var encrypted = cipher.update(inputBuffer, null, 'hex');
    encrypted += cipher.final('hex');
    var authTag = cipher.getAuthTag().toString('hex');
    return { "encryptedEnvelope": encrypted, "authTag": authTag };
}
exports.encryptWithRWDKey = encryptWithRWDKey;
function decryptEnvelope(encryptedData, authTag, rwdKey) {
    var decipher = (0, crypto_browserify_1.createDecipher)('aes-256-gcm', rwdKey);
    decipher.setAuthTag(buffer_1.Buffer.from(authTag, 'hex'));
    var decrypted = decipher.update(encryptedData, 'hex');
    decrypted = buffer_1.Buffer.concat([decrypted, decipher.final()]);
    var decryptedString = decrypted.toString('utf8');
    return JSON.parse(decryptedString);
}
exports.decryptEnvelope = decryptEnvelope;
function pemToArrayBuffer(key) {
    var buf = new ArrayBuffer(key.length);
    var bufView = new Uint8Array(buf);
    for (var i = 0, keyLen = key.length; i < keyLen; i++) {
        bufView[i] = key.charCodeAt(i);
    }
    return buf;
}
// export async function encryptData(data: any, key: string) {
//     const encryptedBuffer = Buffer.from(data);
//     const encryptedData = publicEncrypt({
//       key: key,
//       padding: constants.RSA_PKCS1_OAEP_PADDING,
//       oaepHash: 'sha256',
//     }, encryptedBuffer);
//     const encryptedDataHex = encryptedData.toString('hex');
//     return encryptedDataHex;
// }
function encryptData(data, key) {
    return __awaiter(this, void 0, void 0, function () {
        var encrypted;
        return __generator(this, function (_a) {
            encrypted = forge.pki.publicKeyFromPem(key).encrypt(forge.util.encodeUtf8(data));
            return [2 /*return*/, forge.util.encode64(encrypted)];
        });
    });
}
exports.encryptData = encryptData;
function signData(data, key) {
    return __awaiter(this, void 0, void 0, function () {
        var privateKeyBuffer, signature;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    privateKeyBuffer = buffer_1.Buffer.from(key, 'hex');
                    return [4 /*yield*/, curve.sign(data, privateKeyBuffer)];
                case 1:
                    signature = _a.sent();
                    return [2 /*return*/, { data: data, signature: buffer_1.Buffer.from(signature.toDER()).toString('hex') }];
            }
        });
    });
}
exports.signData = signData;
