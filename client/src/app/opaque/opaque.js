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
exports.handleAuthentication = exports.generateEncryptedEnvelopeAndKeyPair = void 0;
var buffer_1 = require("buffer");
var crypto_browserify_1 = require("crypto-browserify");
var elliptic_1 = require("elliptic");
var bn_js_1 = require("bn.js");
var forge = require("node-forge");
global.Buffer = buffer_1.Buffer;
// create a new elliptic curve object with the desired curve name
var curve = new elliptic_1.ec('ed25519');
/*
During sign up process to generate client keypair, encrypt envelope containing server's
public key and client's private key using password and oprf key.
Finally returns the encrypted envelope, authTag used to encrypt the envelope and the client's public key
*/
function generateEncryptedEnvelopeAndKeyPair(password, oprfKey, serverPublicKey, salt) {
    var rwdKey = oprfOutput(password, oprfKey, salt);
    var keyPair = generateKeyPair();
    var envelope = {
        clientPrivateKey: keyPair.privateKey,
        serverPublicKey: serverPublicKey
    };
    var encryptedOutput = encryptEnvelope(envelope, rwdKey);
    console.log("encryptedEnvelope: ".concat(encryptedOutput.encryptedEnvelope));
    console.log("rwdKey: ".concat(rwdKey));
    return { "encryptedEnvelope": encryptedOutput.encryptedEnvelope, "authTag": encryptedOutput.authTag, "clientPublicKey": keyPair.publicKey };
}
exports.generateEncryptedEnvelopeAndKeyPair = generateEncryptedEnvelopeAndKeyPair;
/*
During login process to generate the same key used to encrypt the envelope
with password and oprfKey and decrypt the envelope to get the client's
private key and server's public key. Then generate a timestamp to sign it
with the client's private key before encrypting it with the server's public key.
Finally returns the encrypted data (also known as the authentication message)
*/
function handleAuthentication(password, oprfKey, encryptedEnvelope, authTag, salt) {
    return __awaiter(this, void 0, void 0, function () {
        var rwdKey, envelope, currentTime, signedTimeObject, encryptedData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rwdKey = oprfOutput(password, oprfKey, salt);
                    console.log("rwdKey: ".concat(rwdKey));
                    console.log("EncryptedEnvelope: ".concat(encryptedEnvelope));
                    envelope = decryptEnvelope(encryptedEnvelope, authTag, rwdKey);
                    console.log("Envelope: ".concat(envelope.serverPublicKey));
                    currentTime = new Date().toISOString();
                    console.log(currentTime);
                    return [4 /*yield*/, signData(currentTime, envelope.clientPrivateKey)];
                case 1:
                    signedTimeObject = _a.sent();
                    console.log(signedTimeObject);
                    return [4 /*yield*/, encryptData(JSON.stringify(signedTimeObject), envelope.serverPublicKey)];
                case 2:
                    encryptedData = _a.sent();
                    console.log("rwdKey: ".concat(rwdKey));
                    console.log("encryptedData: ".concat(encryptedData));
                    return [2 /*return*/, encryptedData];
            }
        });
    });
}
exports.handleAuthentication = handleAuthentication;
/**
 * Compute rwd key from user password, unique OPRFkey, salt from image hash. Achieved
 * by using EDDSA-ED25519, and SHA256 hashing on the password to compute the key.
 * Resultant rwd key then hashed using KDF - PBKDF2, for n iterations to strengthen
 * resistance to dictionary attacks. Force H^n(F(pwd,oprfkey,salt)) number of
 * computations for each user if brute-forced.
*/
function oprfOutput(password, oprfKey, salt) {
    // Create new digital signature curve object with ED25519 algo as choice
    var curve = new elliptic_1.eddsa('ed25519');
    var hashedPassword = (0, crypto_browserify_1.createHash)('sha256').update(password).digest(); // Password is hashed
    var hashedPasswordBuffer = buffer_1.Buffer.from(hashedPassword);
    var oprfKeyBuffer = buffer_1.Buffer.from(oprfKey, 'hex');
    // Establish point of reference for verification on curve for given password hash                
    var passwordPoint = curve.curve.pointFromX(hashedPasswordBuffer, true);
    var scalar = new bn_js_1.BN(oprfKeyBuffer);
    // Digital signature key derived and encoded into hex
    var rwdKey = passwordPoint.mul(scalar).encode('hex', false);
    var derivedKey = hIterFunction(rwdKey, salt);
    return derivedKey;
}
/**
 * Proposed in "OPAQUE: An Asymmetric PAKE Protocol Secure Against Pre-Computation Attacks",
 * to perform H^n() iterated hashing of resultant rwd key for improving resistance (HKDF). Where
 * hash algorithm is replaced with KDF - PBKDF2, for (n) >= 100 number of iterations. Algorithm
 * consists of computing a pseudo random number of iterations based on a given halting condition.
 *
 * @param rwdKey
 * @param salt
 * @returns
 */
function hIterFunction(rwdKey, salt) {
    var iterations = 1000;
    var keyLen = 32; // choose the desired key length
    var derivedKey = buffer_1.Buffer.alloc(keyLen);
    var prevDerivedKey = buffer_1.Buffer.alloc(keyLen);
    var passwordBuffer = buffer_1.Buffer.from(rwdKey);
    // Hash the initial key using salt as the IV
    derivedKey = (0, crypto_browserify_1.pbkdf2Sync)(passwordBuffer, salt, iterations, keyLen, 'sha256');
    // Iterate the hash function until a halting condition is met
    while (true) {
        // Compute the hash of the previous derived key concatenated with the salt
        prevDerivedKey = derivedKey;
        derivedKey = (0, crypto_browserify_1.pbkdf2Sync)(prevDerivedKey, salt, iterations, keyLen, 'sha256');
        // Check if the derived key has reached a halting condition
        if (isHaltingConditionMet(derivedKey)) {
            break;
        }
        // Increment the iteration count
        iterations++;
    }
    console.log("Iterations:" + iterations);
    console.log("Derived Key:" + derivedKey.toString());
    // Return the final derived key and iteration count as a tuple
    return derivedKey.toString();
}
/**
 * Halting condition for iterating HKDF function of rwd key.
 * @param key
 * @returns
 */
function isHaltingConditionMet(key) {
    // Check if the most significant bit of the first byte is set
    // console.log(key);
    // return (key[0] & 0x80) === 0x80;
    // Count the number of leading zero bits in the first byte
    var byte = key[0];
    var numLeadingZeros = 0;
    while ((byte & 0x80) === 0) {
        byte <<= 1;
        numLeadingZeros++;
    }
    // Require a minimum number of leading zero bits
    var minLeadingZeros = 5;
    return numLeadingZeros >= minLeadingZeros;
}
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
/**
 * Function to encrypt using RWD key. Uses AES-GCM256 bit. Key based on HKDF.
 * Key is diff for each user, can't be exploited and reused for other envelopes.
 * */
function encryptEnvelope(envelope, rwdKey) {
    var envelopeString = JSON.stringify(envelope);
    var inputBuffer = buffer_1.Buffer.from(envelopeString, 'utf8');
    var cipher = (0, crypto_browserify_1.createCipher)('aes-256-gcm', rwdKey);
    var encrypted = cipher.update(inputBuffer, null, 'hex');
    encrypted += cipher.final('hex');
    var authTag = cipher.getAuthTag().toString('hex');
    return { "encryptedEnvelope": encrypted, "authTag": authTag };
}
function decryptEnvelope(encryptedData, authTag, rwdKey) {
    var decipher = (0, crypto_browserify_1.createDecipher)('aes-256-gcm', rwdKey);
    decipher.setAuthTag(buffer_1.Buffer.from(authTag, 'hex'));
    var decrypted = decipher.update(encryptedData, 'hex');
    decrypted = buffer_1.Buffer.concat([decrypted, decipher.final()]);
    var decryptedString = decrypted.toString('utf8');
    return JSON.parse(decryptedString);
}
function pemToArrayBuffer(key) {
    var buf = new ArrayBuffer(key.length);
    var bufView = new Uint8Array(buf);
    for (var i = 0, keyLen = key.length; i < keyLen; i++) {
        bufView[i] = key.charCodeAt(i);
    }
    return buf;
}
function encryptData(data, key) {
    return __awaiter(this, void 0, void 0, function () {
        var encrypted;
        return __generator(this, function (_a) {
            encrypted = forge.pki.publicKeyFromPem(key).encrypt(forge.util.encodeUtf8(data));
            return [2 /*return*/, forge.util.encode64(encrypted)];
        });
    });
}
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
