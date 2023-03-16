const mongoose = require('mongoose')
const User = require('../models/User')
const Key = require('../models/Key')
const Token = require('../models/Token')
const userValidator = require('../validators/userValidator')
const bcrypt = require('bcrypt')
const fs = require('fs')
const rimraf = require('rimraf')
const config = require('../config/database')
const jwt = require('jsonwebtoken');
const Opaque = require('../opaque/opaque');

let model = null;

function saveSignature(dataUrl, username) {
    return new Promise((resolve, reject) => {
      // Extract the image type and base64-encoded data from the data URL
      const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  
      // Get the image type (e.g. 'image/png')
      const imageType = matches[1].split('/')[1];
  
      // Decode the base64-encoded data into a Buffer
      const imageData = Buffer.from(matches[2], 'base64');
  
      const signaturePath = `./uploads/users/${username}/signatures`;
  
      fs.mkdirSync(signaturePath, { recursive: true });
  
      // Write the Buffer to a file with a unique name
      const filename = `${username}-signature-${Date.now()}.${imageType}`;
  
      fs.writeFile(`${signaturePath}/${filename}`, imageData, (err) => {
        if (err) {
          reject(err);
        }
        console.log(`Saved image to ${filename}`);
        resolve(filename);
      });
    });
  }

exports.startSignup = async (req, res, next) => {
    const user = await User.findOne(req.body);
    if (userValidator.validateExistingUser(user)) {
        console.log("already exists");
        return res.json({
            success: false,
            msg: 'User already exists'
        })
    }
    var keyPair = await Opaque.generateServerKey();

    // In event of registration error, this allow us to update the user's oprfKey and serverPublicKey
    const userFilter = { username: req.body.username, email: req.body.email };
    const oprfKey = Opaque.generateOPRFKey(req.body.username)
    const userUpdate = { oprfKey: oprfKey, serverPublicKey: keyPair.publicKey, salt: Opaque.genSalt() };
    const newUser = await User.findOneAndUpdate(userFilter, userUpdate, { upsert: true, new: true });

    // In event of registration error, this allow us to update the server keypair unique to the user
    const keyFilter = { username: req.body.username };
    const keyUpdate = { privateKey: keyPair.privateKey, publicKey: keyPair.publicKey};
    const options = { upsert: true, new: true };
    const key = await Key.findOneAndUpdate(keyFilter, keyUpdate, options);
    return res.json({ 
        success: true,
        oprfKey: oprfKey,
        serverPublicKey: key.publicKey,
        salt: newUser.salt
    });
}

exports.completeSignup = async (req, res, next) => {
    var { username, email, encryptedEnvelope, authTag, clientPublicKey, dataUrl, imgVerifier, oprfKey } = req.body;
    console.log(req.body);
    if (!userValidator.validateEmail(email)) {
        return res.json({
            success: false,
            msg: "Invalid Email"
        });
    }

    // if (!userValidator.validateDataUrl(dataUrl)) {
    //     return res.json({
    //         success: false,
    //         msg: "Invalid data url"
    //     })
    // }
    
    const existingEmail = await User.findOne({ email: email });
    if (userValidator.validateExistingUser(existingEmail)) {
        return res.json({
            success: false,
            msg: 'Email already in use'
        })
    }

    const existingUsername = await User.findOne({ username: username })

    if (userValidator.validateExistingUser(existingUsername)) {
        return res.json({
            success: false,
            msg: 'Username already in use'
        })
    }

    // const filename = await saveSignature(dataUrl, username);

    // let newUser = new User({
    //     username: username,
    //     email: email,
    //     encryptedEnvelope: encryptedEnvelope,
    //     authTag: authTag,
    //     clientPublicKey: clientPublicKey,
    //     oprfKey: oprfKey,
    //     imgName: filename,
    //     imgVerifier: imgVerifier
    // });
    
    // const dirPath = `./uploads/users/${username}`;

    const filter = { username: username, email: email };
    const userUpdate = { encryptedEnvelope: encryptedEnvelope, authTag: authTag, clientPublicKey: clientPublicKey };
    try {
        const newUser = await User.findOneAndUpdate(filter, userUpdate, { upsert: false, new: false });
        return res.json({
            success: true,
            msg: "User created successfully!"
        })   
      } catch (err) {
        //Handle error
        return res.json({
            success: false,
            msg: err
        });    
    }
    // User.create(newUser, (err, user) => {
    //     if (err) {
    //         // rimraf(dirPath, { rm: '-rf' }, (err) => {
    //         //     if (err) console.error('Error occurred during directory deletion:', err);
    //         //     else console.log(`Directory ${dirPath} deleted successfully`);
    //         // });
    //         return res.json({
    //             success: false,
    //             msg: err
    //         });
    //     } else {
    //         return res.json({
    //             success: true,
    //             msg: "User created successfully!"
    //         })
    //     }

    // });
};

exports.startAuthenticate = async (req, res, next) => {
    const { username, dataUrl, imgVerifier } = req.body;
    User.findOne({username: username}, async (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({
                success: false,
                msg: "Wrong username or password"
            });
        } 
        // if (user.imgVerifier != imgVerifier) {
        //     return res.json({
        //         success: false,
        //         msg: "Wrong username or password or image and passcode"
        //     });
        // }
        return res.json({
            success: true,
            oprfKey: user.oprfKey,
            salt: user.salt,
            encryptedEnvelope: user.encryptedEnvelope,
            authTag: user.authTag
        });
    });
}

// Gotcha
exports.vImgIdentify = async (req, res, next) => {
    const { username } = req.body;
    User.findOne({username: username}, async (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({
                success: false,
                msg: "Wrong username or password or image and passcode"
            });
        } 
        return res.json({
            success: true,
            vImgVerifier: user.imgVerifier
        });
    });
}

exports.authenticate = async (req, res, next) => {
    const { username, answer, dataUrl, imgVerifier } = req.body;
    console.log(req.body);
    User.getUserByUsername(username, async (err, user) => {
        if (err) throw err;

        if (!user) {
            return res.json({
                success: false,
                msg: "Wrong username and password"
            });
        }

        Key.findOne({ username: username }, async (err, key) => {
            if (err) throw err;

            if (!key) {
                return res.json({
                    success: false,
                    msg: "Something has happened! Please reset your password"
                });  
            }

            try {
                // Decrypt the data and verify its signature before checking timestamp is within 15 seconds
                let isVerified = await Opaque.decryptAndVerify(req.body.answer, key.privateKey, user.clientPublicKey);

                if (!isVerified) {
                    return res.json({
                        success: false,
                        msg: "Something has happened! Please reset your password"
                    });
                }
    
                const payload = {
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
                const token = jwt.sign(payload, config.secret, {
                    expiresIn: 86400 // 24 hours
                });
                res.json({
                    success: true,
                    token: `JWT ${token}`,
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email
                    }
                })
            } catch(error) {
                console.log(`unable to decrypt: ${error}`);
                return res.json({
                    success: false,
                    msg: "Wrong username and password"
                });
            }
        });
    });
};


exports.blackListToken = async (req, res, next) => {
    let token = new Token({
        value: req.headers.authorization
    });
    Token.create(token, (err2, token) => {
        if(err2)
            return res.json({success: false, msg: "Token already blacklisted"});
        if(token)
            return res.json({success: true, msg:"Token blacklisted"});
    });
};

exports.isNotBlackListedToken = async(req, res, next) => {
    console.log(req.headers.authorization);
    Token.findOne({'value': req.headers.authorization}, (err, token) => {
        if(token){
            console.log(token);
            res.status(401).json({success: false, unauthenticated: true, msg: "Blacklisted token!"})
        } else {
            next();
        }
    });
};

exports.getProfile = async (req, res, next) => {
    res.json({user: req.user});
};