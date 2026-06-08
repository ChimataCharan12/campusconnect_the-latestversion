import express from "express";
import { protect } from "../middlewares/auth.js";
import { authorize } from "../middlewares/rbac.js";
import {
  getStudentMarks,
  getClassMarks,
  updateStudentMarks,
} from "../controllers/marksController.js";

const router = express.Router();

// GET /api/marks/student/:studentId - Get all grades for a student
router.get("/student/:studentId", protect, getStudentMarks);

// GET /api/marks/class - Get class marks details (Faculty and Admin)
router.get("/class", protect, authorize("faculty", "admin"), getClassMarks);

// POST /api/marks/update - Update or insert student marks (Faculty and Admin)
router.post("/update", protect, authorize("faculty", "admin"), updateStudentMarks);

export default router;
