const express = require("express");
const router = express.Router();
const apiController = require("../controllers/apiController");

router.post("/signup", apiController.signup);

module.exports = router;
