const express = require("express");
const auth = express.Router();
// get
auth.route("/").get((req, res) => {
  try {
    return res.status(200).send("available");
  } catch (err) {
    res.status(400).send(err);
  }
});
module.exports = auth;
