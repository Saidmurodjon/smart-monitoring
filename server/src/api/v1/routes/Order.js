const express = require("express");
const router = express.Router();
const conntroller = require("../controllers/Order");
const Authentication = require("../middlewares/Authentication");
// This is Order router

router.use(Authentication);
router.route("/").get(conntroller.Get);
router.route("/").post(conntroller.Post);
module.exports = router;
