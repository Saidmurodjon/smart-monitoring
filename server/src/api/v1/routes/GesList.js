const express = require("express");
const router = express.Router();
const conntroller = require("../controllers/GesList");
const requireRole = require("../middlewares/RequireRole");
// This is user conntroller

// GES yaratish/o'zgartirish/o'chirish — tashkiliy/strategik daraja, faqat admin (ROLES.md §3).
router.route("/").get(conntroller.Get);
router.route("/").post(requireRole("ADMIN"), conntroller.Post);
router.route("/").put(requireRole("ADMIN"), conntroller.Update);
router.route("/").delete(requireRole("ADMIN"), conntroller.Delete);
module.exports = router;
