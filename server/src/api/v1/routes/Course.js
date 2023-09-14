const express = require("express");
const router = express.Router();
const conntroller = require("../controllers/Course");
// This is Pochta router
router.route("/").get(conntroller.Get);
router.route("/").post(conntroller.Post);
router.route("/").put(conntroller.Update);
router.route("/").delete(conntroller.Delete);
module.exports = router;
