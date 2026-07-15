import express from "express";
import {
  listAssessmentTypesHandler,
  getAssessmentTypeHandler,
  upsertVariableHandler,
  deleteVariableHandler,
  replaceRulesHandler,
} from "../controllers/FuzzyRuleAdminController";

const router = express.Router();

// GET /api/fuzzy-rules
router.get("/", listAssessmentTypesHandler);

// GET /api/fuzzy-rules/:assessmentType
router.get("/:assessmentType", getAssessmentTypeHandler);

// PUT /api/fuzzy-rules/:assessmentType/variables/:variable
router.put("/:assessmentType/variables/:variable", upsertVariableHandler);

// DELETE /api/fuzzy-rules/:assessmentType/variables/:variable
router.delete("/:assessmentType/variables/:variable", deleteVariableHandler);

// PUT /api/fuzzy-rules/:assessmentType/rules — shu blok uchun BARCHA qoidalarni almashtiradi
router.put("/:assessmentType/rules", replaceRulesHandler);

export = router;
