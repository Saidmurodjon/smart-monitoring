import express from "express";
import { assessTurbineHandler } from "../controllers/TurbineAssessmentController";

const router = express.Router();

// POST /api/assessment/turbine/:aggregateId
router.post("/turbine/:aggregateId", assessTurbineHandler);

export = router;
