const express = require("express");
const router = express.Router();
const controller = require("../controllers/Aggregates");

// Base: /api/v1/aggregates

// Hammasi
router.get("/", controller.Get);

// Yaratish
router.post("/", controller.Post);

// Yangilash
router.put("/:id", controller.Update);

// O'chirish
router.delete("/:id", controller.Delete);

module.exports = router;
