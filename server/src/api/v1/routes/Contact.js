const express = require("express");
const contact = express.Router();
const conntroller = require("../controllers/Contact");

// get

contact.route("/").get(conntroller.Get);
contact.route("/").post(conntroller.Post);
module.exports = contact;
