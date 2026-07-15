import express from "express";
import { assessTurbineHandler, assessTurbineFromStoredHandler } from "../controllers/TurbineAssessmentController";
import { assessGeneratorHandler, assessGeneratorFromStoredHandler } from "../controllers/GeneratorAssessmentController";
import {
  assessTransformerHandler,
  assessTransformerFromStoredHandler,
} from "../controllers/TransformerAssessmentController";
import { assessGesHandler } from "../controllers/GesAssessmentController";
import { getAssessmentSummaryHandler } from "../controllers/AssessmentSummaryController";

const router = express.Router();

// GET /api/assessment/:aggregateId/summary — hisoblamaydi, faqat DB'dagi
// eng so'nggi natijalarni o'qiydi (dashboard/GES sahifalari uchun)
router.get("/:aggregateId/summary", getAssessmentSummaryHandler);

// POST /api/assessment/turbine/:aggregateId
router.post("/turbine/:aggregateId", assessTurbineHandler);

// POST /api/assessment/turbine/:aggregateId/from-stored — DB'dagi so'nggi
// sensor o'qishlari + statik nominal parametrlar asosida (xom body kerak emas)
router.post("/turbine/:aggregateId/from-stored", assessTurbineFromStoredHandler);

// POST /api/assessment/generator/:aggregateId
router.post("/generator/:aggregateId", assessGeneratorHandler);

// POST /api/assessment/generator/:aggregateId/from-stored
router.post("/generator/:aggregateId/from-stored", assessGeneratorFromStoredHandler);

// POST /api/assessment/transformer/:aggregateId
router.post("/transformer/:aggregateId", assessTransformerHandler);

// POST /api/assessment/transformer/:aggregateId/from-stored
router.post("/transformer/:aggregateId/from-stored", assessTransformerFromStoredHandler);

// POST /api/assessment/ges/:aggregateId — Fgt/F_gg/F_tr allaqachon hisoblangan bo'lishi shart
// (DB'dan o'qiydi — bu allaqachon "from-stored" xarakterida)
router.post("/ges/:aggregateId", assessGesHandler);

export = router;
