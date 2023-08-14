const express = require("express");
const router = express.Router();
const authController = require("./Controller");

router.route("/").post(authController.Login);

module.exports = router;
