import express from "express";
import { assessTurbineHandler } from "../controllers/TurbineAssessmentController";
import { assessGeneratorHandler } from "../controllers/GeneratorAssessmentController";

const router = express.Router();

// POST /api/assessment/turbine/:aggregateId
router.post("/turbine/:aggregateId", assessTurbineHandler);

// POST /api/assessment/generator/:aggregateId
router.post("/generator/:aggregateId", assessGeneratorHandler);

export = router;
