const express = require("express");
const router = express.Router();
const conntroller = require("../controllers/Teacher");
// This is user conntroller

router.route("/").get( conntroller.Get);
router.route("/").post(conntroller.Post);
module.exports = router;
