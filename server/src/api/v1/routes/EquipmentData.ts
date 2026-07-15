import express from "express";
import { setStaticParamsHandler, ingestReadingsHandler } from "../controllers/EquipmentDataController";

const router = express.Router();

// PUT /api/aggregates/:aggregateId/:equipmentType/static-params
router.put("/:aggregateId/:equipmentType/static-params", setStaticParamsHandler);

// POST /api/aggregates/:aggregateId/:equipmentType/readings
router.post("/:aggregateId/:equipmentType/readings", ingestReadingsHandler);

export = router;
