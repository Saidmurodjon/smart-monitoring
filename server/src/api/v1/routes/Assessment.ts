import express from "express";
import { assessTurbineHandler, assessTurbineFromStoredHandler } from "../controllers/TurbineAssessmentController";
import { assessGeneratorHandler } from "../controllers/GeneratorAssessmentController";
import { assessTransformerHandler } from "../controllers/TransformerAssessmentController";
import { assessGesHandler } from "../controllers/GesAssessmentController";

const router = express.Router();

// POST /api/assessment/turbine/:aggregateId
router.post("/turbine/:aggregateId", assessTurbineHandler);

// POST /api/assessment/turbine/:aggregateId/from-stored — DB'dagi so'nggi
// sensor o'qishlari + statik nominal parametrlar asosida (xom body kerak emas)
router.post("/turbine/:aggregateId/from-stored", assessTurbineFromStoredHandler);

// POST /api/assessment/generator/:aggregateId
router.post("/generator/:aggregateId", assessGeneratorHandler);

// POST /api/assessment/transformer/:aggregateId
router.post("/transformer/:aggregateId", assessTransformerHandler);

// POST /api/assessment/ges/:aggregateId — Fgt/F_gg/F_tr allaqachon hisoblangan bo'lishi shart
router.post("/ges/:aggregateId", assessGesHandler);

export = router;
