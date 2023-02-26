const mongoose = require('mongoose')
const User = require('../models/User')
const userValidator = require('../validators/userValidator')
const bcrypt = require('bcrypt')
const fs = require('fs')
const rimraf = require('rimraf')
const config = require('../config/database')
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
    var { username, email, password, dataUrl } = req.body;
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
            console.log(err);
        }
        console.log(`Saved image to ${filename}`);
    });

    // const salt = await bcrypt.genSalt(10);
    // password = await bcrypt.hash(password, salt);

    let newUser = new User({
        username: username,
        email: email,
        password: password,
        imgName: filename 
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


exports.authenticate = async (req, res, next) => {
    const { username, password, dataUrl } = req.body;
    console.log(dataUrl);
    console.log(req.body);
    User.getUserByUsername(username, async (err, user) => {
        if (err) throw err;

        if (!user) {
            return res.json({
                success: false,
                msg: "Wrong username or password"
            });
        }

        User.comparePassword(password, user.password, async (err, isMatch) => {
            if (err) throw err;

            if (isMatch) {
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
            } else {
                res.json({
                    success: false,
                    msg: "Wrong username or password"
                })
            }
        });
    });
};


exports.getProfile = async (req, res, next) => {
    res.json({user: req.user});
};