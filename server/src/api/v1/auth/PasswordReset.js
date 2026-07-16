const express = require("express");
const router = express.Router();
const controller = require("./PasswordResetController");

// SENDMAIL.md — parolni tiklash, autentifikatsiyasiz (ochiq) yo'llar.
router.route("/forgot-password").post(controller.ForgotPassword);
router.route("/reset-password").post(controller.ResetPassword);

module.exports = router;
