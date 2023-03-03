const mongoose = require('mongoose')
const User = require('../models/User')
const userValidator = require('../validators/userValidator')
const bcrypt = require('bcrypt')
const fs = require('fs')
const rimraf = require('rimraf')
const config = require('../config/database')
const jwt = require('jsonwebtoken');
// const tf = require('@tensorflow/tfjs-node');
// const mobilenet = require('@tensorflow-models/mobilenet');
// const { createCanvas, loadImage } = require('canvas');
// const IMAGE_SIZE = 224;
const Opaque = require('../opaque/opaque');

let model = null;
let rKey;

async function doEncrypt(imgVerifier, uKey) {
    try {
      const { GotchaService } = await import('@websack/gotcha');
      const gService = new GotchaService();
      rKey = gService.vHashEncrypt(imgVerifier, uKey);
      console.log(rKey);
    } catch (err) {
      // handle error here
    }
  }


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
    console.log(req.body);
    var username = req.body.username;
    const usernameExists = await User.findOne({ username: username });
    if (usernameExists) {
        console.log("already exists");
        return res.json({
            success: false,
            msg: 'Username already in use'
        })
    }
    return res.json({ 
        success: true,
        oprfKey: Opaque.generateOPRFKey(username)
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
    
    // HERE!
    doEncrypt(imgVerifier, uKey)

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


exports.completeSignup = async (req, res, next) => {
    var { username, email, oprfOutput, dataUrl, imgVerifier, oprfKey } = req.body;
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
    const salt = await bcrypt.genSalt(10);
    const passwordVerifierHash = await bcrypt.hash(oprfOutput, salt);

    let newUser = new User({
        username: username,
        email: email,
        passwordVerifier: passwordVerifierHash,
        oprfKey: oprfKey,
        imgName: filename,
        imgVerifier: imgVerifier
    });

    User.create(newUser, (err, user) => {
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


async function loadModel() {
    if (model == null) {
        model = await mobilenet.load();
    }
}

// async function verifySignature(candidateSignaturePath, originalSignaturePath, username) {
//     console.log("verifying signature...");
//     const signaturePath = `./uploads/users/${username}/signatures`;
//     const candidateSignature = await loadImage(`${signaturePath}/${candidateSignaturePath}`);
//     const originalSignature = await loadImage(`${signaturePath}/${originalSignaturePath}`);
  
//     const model = await mobilenet.load();
  
//     // Create an HTMLCanvasElement for the candidate signature
//     const canvas1 = createCanvas(candidateSignature.width, candidateSignature.height);
//     const ctx1 = canvas1.getContext('2d');
//     ctx1.drawImage(candidateSignature, 0, 0);
  
//     // Create an HTMLCanvasElement for the original signature
//     const canvas2 = createCanvas(originalSignature.width, originalSignature.height);
//     const ctx2 = canvas2.getContext('2d');
//     ctx2.drawImage(originalSignature, 0, 0);
  
//     // Convert the HTMLCanvasElements to tensors
//     const tensor1 = tf.browser.fromPixels(canvas1).toFloat();
//     const tensor2 = tf.browser.fromPixels(canvas2).toFloat();
  
//     // Classify the candidate signature and the original signature
//     const predictions1 = await model.classify(tensor1);
//     const predictions2 = await model.classify(tensor2);
  
//   // Get the top predicted class and its probability for the candidate signature and the original signature
//     const topPrediction1 = predictions1[0];
//     const topPrediction2 = predictions2[0];

//     // Compare the top predicted classes and return their similarity and the confidence level of the model
//     const cosineSimilarity = topPrediction1.className === topPrediction2.className ? 1 : 0;
//     const confidenceLevel = topPrediction1.probability;

//     return { cosineSimilarity, confidenceLevel };
// }
  
// exports.authenticate = async (req, res, next) => {
//     const { username, password, dataUrl, imgVerifier } = req.body;
//     User.getUserByUsername(username, async (err, user) => {
//         if (err) throw err;

//         if (!user) {
//             return res.json({
//                 success: false,
//                 msg: "Wrong username or password or image and passcode"
//             });
//         }
//         if (user.imgVerifier != imgVerifier) {
//             return res.json({
//                 success: false,
//                 msg: "Wrong username or password or image and passcode"
//             });
//         }
//         User.comparePassword(password, user.password, async (err, isMatch) => {
//             if (err) throw err;

//             if (isMatch) {
//                 // const filename = await saveSignature(dataUrl, username);
//                 // console.log(filename);
//                 // const similarity = await verifySignature(filename, user.imgName, username);
//                 // console.log(similarity)
//                 const payload = {
//                     id: user._id,
//                     username: user.username,
//                     email: user.email
//                 }
//                 const token = jwt.sign(payload, config.secret, {
//                     expiresIn: 86400 // 24 hours
//                 });
//                 res.json({
//                     success: true,
//                     token: `JWT ${token}`,
//                     user: {
//                         id: user._id,
//                         username: user.username,
//                         email: user.email
//                     }
//                 })
//             } else {
//                 res.json({
//                     success: false,
//                     msg: "Wrong username or password or image and passcode"
//                 })
//             }
//         });
//     });
// };

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
            oprfKey: user.oprfKey
        });
    });
}

exports.authenticate = async (req, res, next) => {
    const { username, passwordVerifier, dataUrl, imgVerifier } = req.body;
    console.log(req.body);
    User.getUserByUsername(username, async (err, user) => {
        if (err) throw err;

        if (!user) {
            return res.json({
                success: false,
                msg: "Wrong username or password or image and passcode"
            });
        }
        await bcrypt.compare(passwordVerifier, user.passwordVerifier, async (err, isMatch) => {
            if (err) throw err;
            if (!isMatch) {
                return res.json({
                    success: false,
                    msg: "Wrong username or password or image and passcode"
                })
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
        });
    });
};


exports.getProfile = async (req, res, next) => {
    res.json({user: req.user});
};