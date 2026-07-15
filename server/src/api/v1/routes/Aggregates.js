const express = require("express");
const router = express.Router({ mergeParams: true });
const controller = require("../controllers/Aggregates");
const requireRole = require("../middlewares/RequireRole");

// Base: /api/v1/aggregates

// Hammasi
router.get("/", controller.Get);

// Yaratish, yangilash, o'chirish — kundalik operatsion ish (ROLES.md §3).
router.post("/", requireRole("ADMIN", "ENGINEER"), controller.Post);
router.put("/", requireRole("ADMIN", "ENGINEER"), controller.Update);
router.delete("/", requireRole("ADMIN", "ENGINEER"), controller.Delete);

module.exports = router;
