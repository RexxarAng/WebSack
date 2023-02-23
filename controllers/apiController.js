const mongoose = require('mongoose')
const User = require('../models/User')
const userValidator = require('../validators/userValidator')
const bcrypt = require('bcrypt')
 

exports.signup = async (req, res) => {
    const { name, email, password } = req.body;
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
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
        const newUser = User.create(req.body);
        res.json({
            success: true,
            msg: newUser
        })
    } else {
        res.json({
            success: false,
            msg: 'User Already Exists'
        })
    }
};