const express = require("express");
const router = express.Router();
// const path=require('path')

const users = require("./Users");

const login = require("../auth/Router");
const googleAuth = require("../auth/google");
const passwordReset = require("../auth/PasswordReset");
const gesList = require("./GesList");
const aggregates = require("./Aggregates");
const assessment = require("./Assessment");
const equipmentData = require("./EquipmentData");
const fuzzyRules = require("./FuzzyRules");
const Authentication = require("../middlewares/Authentication");
// router
router.get("/", (req, res) => {
  return res.send("Backend is working ...");
});

// Ochiq (autentifikatsiyasiz) yo'llar — login va ro'yxatdan o'tish uchun
// hali tokenga ega bo'lish mumkin emas. `/users`ning o'zi GET/PUT uchun
// ichkarida Authentication+requireRole qo'llaydi (POST ochiq qoladi).
router.use("/login", login);
router.use("/auth", googleAuth);
router.use("/auth", passwordReset);
router.use("/users", users);

// ROLES.md §6-7 — shu qatordan keyingi hamma resurs uchun tizimga kirish
// (JWT) majburiy; har bir resurs ichida yozish amallari requireRole bilan
// yanada cheklanadi.
router.use(Authentication);
router.use("/ges/:gesId/aggregates", aggregates);
router.use("/ges-list", gesList);
router.use("/assessment", assessment);
router.use("/aggregates", equipmentData);
router.use("/fuzzy-rules", fuzzyRules);

module.exports = router;
