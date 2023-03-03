const express = require("express");
const router = express.Router();
const apiController = require("../controllers/apiController");
const passport = require("passport");


router.post("/startSignup", apiController.startSignup);

router.post("/signup", apiController.signup);

router.post("/authenticate", apiController.authenticate);

router.get("/profile", passport.authenticate('jwt', {session:false}), apiController.getProfile);

module.exports = router;
