import express from "express";
import {
  setStaticParamsHandler,
  ingestReadingsHandler,
  getAggregateDetailHandler,
} from "../controllers/EquipmentDataController";
import requireRole = require("../middlewares/RequireRole");

const router = express.Router();

// GET /api/aggregates/:aggregateId/detail
router.get("/:aggregateId/detail", getAggregateDetailHandler);

// Statik parametr va sensor yozuvlari kiritish — operatsion ish (ROLES.md §3).
router.put("/:aggregateId/:equipmentType/static-params", requireRole("ADMIN", "ENGINEER"), setStaticParamsHandler);
router.post("/:aggregateId/:equipmentType/readings", requireRole("ADMIN", "ENGINEER"), ingestReadingsHandler);

export = router;
