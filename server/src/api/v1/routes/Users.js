const express = require("express");
const router = express.Router();
const conntroller = require("../controllers/Users");
// This is user conntroller

router.route("/").get(conntroller.Get);
router.route("/").post(conntroller.Post);
// router.route("/").put(conntroller.Update);
// router.route("/").delete(conntroller.Delete);
module.exports = router;
