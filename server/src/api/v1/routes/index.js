const express = require("express");
const router = express.Router();
// const path=require('path')

const users = require("./Users");

const login = require("../auth/Router");
const gesList = require("./GesList");
const aggregates = require("./Aggregates");
const auth = require("./Auth");
const Authentication = require("../middlewares/Authentication");
// router
router.get("/", (req, res) => {
  return res.send("Backend is working ...");
});
router.use("/login", login);
// router.use(Authentication);
router.use("/users", users);
router.use("/ges/:gesId/aggregates", aggregates);
router.use("/ges-list", gesList);

// router.use("/auth", auth);
module.exports = router;
