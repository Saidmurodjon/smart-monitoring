import express from "express";
import { assessTurbineHandler } from "../controllers/TurbineAssessmentController";
import { assessGeneratorHandler } from "../controllers/GeneratorAssessmentController";
import { assessTransformerHandler } from "../controllers/TransformerAssessmentController";

const router = express.Router();

// POST /api/assessment/turbine/:aggregateId
router.post("/turbine/:aggregateId", assessTurbineHandler);

// POST /api/assessment/generator/:aggregateId
router.post("/generator/:aggregateId", assessGeneratorHandler);

// POST /api/assessment/transformer/:aggregateId
router.post("/transformer/:aggregateId", assessTransformerHandler);

export = router;
