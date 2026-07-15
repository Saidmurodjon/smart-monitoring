import express from "express";
import { assessTurbineHandler, assessTurbineFromStoredHandler } from "../controllers/TurbineAssessmentController";
import { assessGeneratorHandler, assessGeneratorFromStoredHandler } from "../controllers/GeneratorAssessmentController";
import {
  assessTransformerHandler,
  assessTransformerFromStoredHandler,
} from "../controllers/TransformerAssessmentController";
import { assessGesHandler } from "../controllers/GesAssessmentController";
import { getAssessmentSummaryHandler } from "../controllers/AssessmentSummaryController";
import requireRole = require("../middlewares/RequireRole");

const router = express.Router();

// GET /api/assessment/:aggregateId/summary — hisoblamaydi, faqat DB'dagi
// eng so'nggi natijalarni o'qiydi (dashboard/GES sahifalari uchun)
router.get("/:aggregateId/summary", getAssessmentSummaryHandler);

// Yangi FIS baholashni ishga tushirish — operatsion ish (ROLES.md §3).
const canAssess = requireRole("ADMIN", "ENGINEER");

// POST /api/assessment/turbine/:aggregateId
router.post("/turbine/:aggregateId", canAssess, assessTurbineHandler);

// POST /api/assessment/turbine/:aggregateId/from-stored — DB'dagi so'nggi
// sensor o'qishlari + statik nominal parametrlar asosida (xom body kerak emas)
router.post("/turbine/:aggregateId/from-stored", canAssess, assessTurbineFromStoredHandler);

// POST /api/assessment/generator/:aggregateId
router.post("/generator/:aggregateId", canAssess, assessGeneratorHandler);

// POST /api/assessment/generator/:aggregateId/from-stored
router.post("/generator/:aggregateId/from-stored", canAssess, assessGeneratorFromStoredHandler);

// POST /api/assessment/transformer/:aggregateId
router.post("/transformer/:aggregateId", canAssess, assessTransformerHandler);

// POST /api/assessment/transformer/:aggregateId/from-stored
router.post("/transformer/:aggregateId/from-stored", canAssess, assessTransformerFromStoredHandler);

// POST /api/assessment/ges/:aggregateId — Fgt/F_gg/F_tr allaqachon hisoblangan bo'lishi shart
// (DB'dan o'qiydi — bu allaqachon "from-stored" xarakterida)
router.post("/ges/:aggregateId", canAssess, assessGesHandler);

export = router;
