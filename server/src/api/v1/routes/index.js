const express = require("express");
const router = express.Router();
// const path=require('path')

const users = require("./Teacher");

const login = require("../auth/Router");
const teacher = require("./Teacher");
const course = require("./Course");
const pupil = require("./Pupil");
const contact = require("./Contact");
const auth = require("./Auth");
const Authentication = require("../middlewares/Authentication");
// router
router.get("/", (req, res) => {
  return res.send("Backend is working ...");
});
router.use("/login", login);
router.use(Authentication);
router.use("/users", users);
router.use("/teachers", teacher);
router.use("/courses", course);
router.use("/pupils", pupil);
router.use("/contacts", contact);

router.use("/auth", auth);
module.exports = router;
