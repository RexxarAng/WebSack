const express = require("express");
const router = express.Router();
const apiController = require("../controllers/apiController");
const passport = require("passport");


router.post("/startSignup", apiController.startSignup);

// router.post("/signup", apiController.signup);

router.post("/completeSignup", apiController.completeSignup);

router.post("/startAuthenticate", apiController.startAuthenticate);

router.post("/authenticate", apiController.authenticate);

router.post("/imgVerify", apiController.vImgIdentify); // Gotcha

router.get("/profile", [passport.authenticate('jwt', {session:false}), apiController.isNotBlackListedToken], apiController.getProfile);

router.post("/logout", passport.authenticate('jwt', {session:false}), apiController.blackListToken);

module.exports = router;
