import express from "express";
import { assessTurbineHandler } from "../controllers/TurbineAssessmentController";
import { assessGeneratorHandler } from "../controllers/GeneratorAssessmentController";
import { assessTransformerHandler } from "../controllers/TransformerAssessmentController";
import { assessGesHandler } from "../controllers/GesAssessmentController";

const router = express.Router();

// POST /api/assessment/turbine/:aggregateId
router.post("/turbine/:aggregateId", assessTurbineHandler);

// POST /api/assessment/generator/:aggregateId
router.post("/generator/:aggregateId", assessGeneratorHandler);

// POST /api/assessment/transformer/:aggregateId
router.post("/transformer/:aggregateId", assessTransformerHandler);

// POST /api/assessment/ges/:aggregateId — Fgt/F_gg/F_tr allaqachon hisoblangan bo'lishi shart
router.post("/ges/:aggregateId", assessGesHandler);

export = router;
