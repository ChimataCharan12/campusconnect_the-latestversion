import express from "express";
import { protect } from "../middlewares/auth.js";
import { authorize } from "../middlewares/rbac.js";
import {
  getStudentAttendance,
  getStudentAttendanceSummary,
  getClassAttendance,
  markAttendance,
  getAdminAttendanceSummary,
} from "../controllers/attendanceController.js";

const router = express.Router();

// GET /api/attendance/student/:studentId - Get detailed attendance logs for a student
router.get("/student/:studentId", protect, getStudentAttendance);

// GET /api/attendance/summary/:studentId - Get attendance percentage summary for a student
router.get("/summary/:studentId", protect, getStudentAttendanceSummary);

// GET /api/attendance/class - Get attendance list for a specific class (Faculty and Admin)
router.get("/class", protect, authorize("faculty", "admin"), getClassAttendance);

// GET /api/attendance/admin/summary - Admin aggregate view of all class groups
router.get("/admin/summary", protect, authorize("admin"), getAdminAttendanceSummary);

// POST /api/attendance/mark - Mark attendance for students (Faculty and Admin)
router.post("/mark", protect, authorize("faculty", "admin"), markAttendance);

export default router;
