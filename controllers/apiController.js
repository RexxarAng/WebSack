const mongoose = require('mongoose')
const User = require('../models/User')
const Key = require('../models/Key')
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
    const userExists = await User.findOne(req.body);
    if (userExists) {
        console.log("already exists");
        return res.json({
            success: false,
            msg: 'User already exists'
        })
    }
    var keyPair = await Opaque.generateServerKey();
    const filter = { username: req.body.username };
    const update = { privateKey: keyPair.privateKey, publicKey: keyPair.publicKey};
    const options = { upsert: true, new: true };
    const key = await Key.findOneAndUpdate(filter, update, options);
    return res.json({ 
        success: true,
        oprfKey: Opaque.generateOPRFKey(req.body.username),
        serverPublicKey: key.publicKey
    });
}

exports.signup = async (req, res, next) => {
    var { username, email, password, dataUrl, imgVerifier, uKey } = req.body;
    if (!userValidator.validateEmail(email)) {
        return res.json({
            success: false,
            msg: "Invalid Email"
        });
    }

    if (!userValidator.validatePassword(password)) {
        return res.json({
            success: false,
            msg: "Invalid Password"
        });
    }

    if (!userValidator.validateDataUrl(dataUrl)) {
        return res.json({
            success: false,
            msg: "Invalid data url"
        })
    }
    
    const emailExists = await User.findOne({ email: email });
    if (emailExists) {
        return res.json({
            success: false,
            msg: 'Email already in use'
        })
    }

    const usernameExists = await User.findOne({ username: username })

    if (usernameExists) {
        return res.json({
            success: false,
            msg: 'Username already in use'
        })
    }

    const filename = await saveSignature(dataUrl, username);
    
    let newUser = new User({
        username: username,
        email: email,
        password: password,
        imgName: filename,
        imgVerifier: imgVerifier
    });

    User.addUser(newUser, (err, user) => {
        if (err) {
            rimraf(`./uploads/users/${username}`, (err) => {
                if (err) console.error('Error occurred during directory deletion:', err);
                else console.log(`Directory ${dirPath} deleted successfully`);
            });
            return res.json({
                success: false,
                msg: err
            });
        } else {
            return res.json({
                success: true,
                msg: "User created successfully!"
            })
        }

    });
};


// exports.completeSignup = async (req, res, next) => {
//     var { username, email, oprfOutput, dataUrl, imgVerifier, oprfKey } = req.body;
//     console.log(req.body);
//     if (!userValidator.validateEmail(email)) {
//         return res.json({
//             success: false,
//             msg: "Invalid Email"
//         });
//     }

//     if (!userValidator.validateDataUrl(dataUrl)) {
//         return res.json({
//             success: false,
//             msg: "Invalid data url"
//         })
//     }
    
//     const emailExists = await User.findOne({ email: email });
//     if (emailExists) {
//         return res.json({
//             success: false,
//             msg: 'Email already in use'
//         })
//     }

//     const usernameExists = await User.findOne({ username: username })

//     if (usernameExists) {
//         return res.json({
//             success: false,
//             msg: 'Username already in use'
//         })
//     }

//     const filename = await saveSignature(dataUrl, username);

//     // Generate a random salt
//     const salt = await bcrypt.genSalt(10);
//     const passwordVerifierHash = await bcrypt.hash(oprfOutput, salt);

//     let newUser = new User({
//         username: username,
//         email: email,
//         passwordVerifier: passwordVerifierHash,
//         oprfKey: oprfKey,
//         imgName: filename,
//         imgVerifier: imgVerifier
//     });

//     User.create(newUser, (err, user) => {
//         if (err) {
//             rimraf(`./uploads/users/${username}`, (err) => {
//                 if (err) console.error('Error occurred during directory deletion:', err);
//                 else console.log(`Directory ${dirPath} deleted successfully`);
//             });
//             return res.json({
//                 success: false,
//                 msg: err
//             });
//         } else {
//             return res.json({
//                 success: true,
//                 msg: "User created successfully!"
//             })
//         }

//     });
// };

exports.completeSignup = async (req, res, next) => {
    var { username, email, encryptedEnvelope, authTag, clientPublicKey, dataUrl, imgVerifier, oprfKey } = req.body;
    console.log(req.body);
    if (!userValidator.validateEmail(email)) {
        return res.json({
            success: false,
            msg: "Invalid Email"
        });
    }

    if (!userValidator.validateDataUrl(dataUrl)) {
        return res.json({
            success: false,
            msg: "Invalid data url"
        })
    }
    
    const emailExists = await User.findOne({ email: email });
    if (emailExists) {
        return res.json({
            success: false,
            msg: 'Email already in use'
        })
    }

    const usernameExists = await User.findOne({ username: username })

    if (usernameExists) {
        return res.json({
            success: false,
            msg: 'Username already in use'
        })
    }

    const filename = await saveSignature(dataUrl, username);

    // Generate a random salt
    // const salt = await bcrypt.genSalt(10);
    // const passwordVerifierHash = await bcrypt.hash(oprfOutput, salt);

    let newUser = new User({
        username: username,
        email: email,
        encryptedEnvelope: encryptedEnvelope,
        authTag: authTag,
        clientPublicKey: clientPublicKey,
        oprfKey: oprfKey,
        imgName: filename,
        imgVerifier: imgVerifier
    });
    
    const dirPath = `./uploads/users/${username}`;

    User.create(newUser, (err, user) => {
        if (err) {
            rimraf(dirPath, { rm: '-rf' }, (err) => {
                if (err) console.error('Error occurred during directory deletion:', err);
                else console.log(`Directory ${dirPath} deleted successfully`);
            });
            return res.json({
                success: false,
                msg: err
            });
        } else {
            return res.json({
                success: true,
                msg: "User created successfully!"
            })
        }

    });
};

exports.startAuthenticate = async (req, res, next) => {
    const { username, dataUrl, imgVerifier } = req.body;
    User.findOne({username: username}, async (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({
                success: false,
                msg: "Wrong username or password or image and passcode"
            });
        } 
        if (user.imgVerifier != imgVerifier) {
            return res.json({
                success: false,
                msg: "Wrong username or password or image and passcode"
            });
        }
        return res.json({
            success: true,
            oprfKey: user.oprfKey,
            encryptedEnvelope: user.encryptedEnvelope,
            authTag: user.authTag
        });
    });
}

// exports.authenticate = async (req, res, next) => {
//     const { username, passwordVerifier, dataUrl, imgVerifier } = req.body;
//     console.log(req.body);
//     User.getUserByUsername(username, async (err, user) => {
//         if (err) throw err;

//         if (!user) {
//             return res.json({
//                 success: false,
//                 msg: "Wrong username or password or image and passcode"
//             });
//         }
//         await bcrypt.compare(passwordVerifier, user.passwordVerifier, async (err, isMatch) => {
//             if (err) throw err;
//             if (!isMatch) {
//                 return res.json({
//                     success: false,
//                     msg: "Wrong username or password or image and passcode"
//                 })
//             }

//             const payload = {
//                 id: user._id,
//                 username: user.username,
//                 email: user.email
//             }
//             const token = jwt.sign(payload, config.secret, {
//                 expiresIn: 86400 // 24 hours
//             });
//             res.json({
//                 success: true,
//                 token: `JWT ${token}`,
//                 user: {
//                     id: user._id,
//                     username: user.username,
//                     email: user.email
//                 }
//             })
//         });
//     });
// };

// exports.authenticate = async (req, res, next) => {
//     const { username, passwordVerifier, dataUrl, imgVerifier } = req.body;
//     console.log(req.body);
//     User.getUserByUsername(username, async (err, user) => {
//         if (err) throw err;

//         if (!user) {
//             return res.json({
//                 success: false,
//                 msg: "Wrong username or password or image and passcode"
//             });
//         }
//         await bcrypt.compare(passwordVerifier, user.passwordVerifier, async (err, isMatch) => {
//             if (err) throw err;
//             if (!isMatch) {
//                 return res.json({
//                     success: false,
//                     msg: "Wrong username or password or image and passcode"
//                 })
//             }

//             const payload = {
//                 id: user._id,
//                 username: user.username,
//                 email: user.email
//             }
//             const token = jwt.sign(payload, config.secret, {
//                 expiresIn: 86400 // 24 hours
//             });
//             res.json({
//                 success: true,
//                 token: `JWT ${token}`,
//                 user: {
//                     id: user._id,
//                     username: user.username,
//                     email: user.email
//                 }
//             })
//         });
//     });
// };

exports.authenticate = async (req, res, next) => {
    const { username, answer, dataUrl, imgVerifier } = req.body;
    console.log(req.body);
    User.getUserByUsername(username, async (err, user) => {
        if (err) throw err;

        if (!user) {
            return res.json({
                success: false,
                msg: "Wrong username or password or image and passcode"
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
                console.log(req.body.answer);
                let dateString = await Opaque.decryptData(req.body.answer, key.privateKey);
                console.log(`Date Given: ${dateString}`);
    
                // Convert the date string to a Date object
                const date = new Date(dateString);
    
                // Get the current time in milliseconds
                const now = Date.now();
    
                const diff = now - date.getTime();
    
                // Check if the difference is less than or equal to 15 seconds
                if (diff <= 15000) {
                    console.log('The date is within the last 15 seconds');
                } else {
                    console.log('The date is not within the last 15 seconds');
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
                    msg: "Wrong username or password or image and passcode"
                });
            }
        });
    });
};


exports.getProfile = async (req, res, next) => {
    res.json({user: req.user});
};