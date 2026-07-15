import express from "express";
import {
  listAssessmentTypesHandler,
  getAssessmentTypeHandler,
  upsertVariableHandler,
  deleteVariableHandler,
  replaceRulesHandler,
} from "../controllers/FuzzyRuleAdminController";
import requireRole = require("../middlewares/RequireRole");

const router = express.Router();

// GET /api/fuzzy-rules
router.get("/", listAssessmentTypesHandler);

// GET /api/fuzzy-rules/:assessmentType
router.get("/:assessmentType", getAssessmentTypeHandler);

// Noto'g'ri threshold butun baholash tizimini buzishi mumkin — faqat admin (ROLES.md §2).
const adminOnly = requireRole("ADMIN");

// PUT /api/fuzzy-rules/:assessmentType/variables/:variable
router.put("/:assessmentType/variables/:variable", adminOnly, upsertVariableHandler);

// DELETE /api/fuzzy-rules/:assessmentType/variables/:variable
router.delete("/:assessmentType/variables/:variable", adminOnly, deleteVariableHandler);

// PUT /api/fuzzy-rules/:assessmentType/rules — shu blok uchun BARCHA qoidalarni almashtiradi
router.put("/:assessmentType/rules", adminOnly, replaceRulesHandler);

export = router;
