import express from "express";
import { protect } from "../middlewares/auth.js";
import { authorize } from "../middlewares/rbac.js";
import {
  getMyProfile,
  updateMyProfile,
  getStudentById,
  getAllStudents,
  createStudentProfile,
  updateStudentById,
  deleteStudentById,
} from "../controllers/studentController.js";

const router = express.Router();

// ── Self-service routes (student access) ──────────────────────────────────────
// GET  /api/students/profile  → student fetches own profile
// PUT  /api/students/profile  → student updates own safe fields
router
  .route("/profile")
  .get(protect, authorize("student"), getMyProfile)
  .put(protect, authorize("student"), updateMyProfile);

// ── Admin / Faculty read routes ───────────────────────────────────────────────
// GET  /api/students          → list all students (admin, faculty)
// POST /api/students          → create a student profile (admin only)
router
  .route("/")
  .get(protect, authorize("admin", "faculty"), getAllStudents)
  .post(protect, authorize("admin"), createStudentProfile);

// GET  /api/students/:id      → get one student (admin, faculty)
// PUT  /api/students/:id      → update student by id (admin only)
// DELETE /api/students/:id    → delete student by id (admin only)
router
  .route("/:id")
  .get(protect, authorize("admin", "faculty"), getStudentById)
  .put(protect, authorize("admin"), updateStudentById)
  .delete(protect, authorize("admin"), deleteStudentById);

export default router;
