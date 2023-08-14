const express = require("express");
const router = express.Router();
const conntroller = require("../controllers/Pochta");
// This is Pochta router
router.route("/").get(conntroller.Get);
module.exports = router;
