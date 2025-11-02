const express = require("express");
const router = express.Router({ mergeParams: true });
const controller = require("../controllers/Aggregates");

// Base: /api/v1/aggregates

// Hammasi
router.get("/", controller.Get);

// Yaratish
router.post("/", controller.Post);

// Yangilash
router.put("/", controller.Update);

// O'chirish
router.delete("/", controller.Delete);

module.exports = router;
