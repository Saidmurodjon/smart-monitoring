const express = require("express");
const router = express.Router();
const conntroller = require("../controllers/Users");
const Authentication = require("../middlewares/Authentication");
const requireRole = require("../middlewares/RequireRole");
// This is user conntroller

// Ro'yxatdan o'tish — autentifikatsiyasiz, ochiq (yangi foydalanuvchi hali
// tokenga ega bo'la olmaydi). Har doim VIEWER rolida yaratiladi (Users.js
// controller ichida majburlanadi).
router.route("/").post(conntroller.Post);

// O'z profilini ko'rish/tahrirlash — istalgan rol, faqat o'ziniki.
router.route("/me").get(Authentication, conntroller.GetMe);
router.route("/me").put(Authentication, conntroller.UpdateMe);
router.route("/me/password").put(Authentication, conntroller.UpdateMyPassword);

// Foydalanuvchilar ro'yxati va rol boshqaruvi — faqat admin.
router.route("/").get(Authentication, requireRole("ADMIN"), conntroller.Get);
router.route("/:id/role").put(Authentication, requireRole("ADMIN"), conntroller.UpdateRole);
// SENDMAIL.md — PENDING foydalanuvchini tasdiqlash/rad etish, faqat admin.
router.route("/:id/approve").put(Authentication, requireRole("ADMIN"), conntroller.ApproveUser);
router.route("/:id/reject").put(Authentication, requireRole("ADMIN"), conntroller.RejectUser);

module.exports = router;
