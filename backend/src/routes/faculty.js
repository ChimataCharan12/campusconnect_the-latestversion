import express from "express";
import { protect } from "../middlewares/auth.js";
import { authorize } from "../middlewares/rbac.js";
import {
  getMyProfile,
  updateMyProfile,
  getFacultyById,
  getAllFaculty,
  createFacultyProfile,
  updateFacultyById,
  deleteFacultyById,
} from "../controllers/facultyController.js";

const router = express.Router();

// ── Self-service routes (faculty access) ──────────────────────────────────────
// GET  /api/faculty/profile  → faculty fetches own profile
// PUT  /api/faculty/profile  → faculty updates own safe fields
router
  .route("/profile")
  .get(protect, authorize("faculty"), getMyProfile)
  .put(protect, authorize("faculty"), updateMyProfile);

// ── Admin routes ───────────────────────────────────────────────────────────────
// GET  /api/faculty          → list all faculty (admin)
// POST /api/faculty          → create a faculty profile (admin only)
router
  .route("/")
  .get(protect, authorize("admin"), getAllFaculty)
  .post(protect, authorize("admin"), createFacultyProfile);

// GET  /api/faculty/:id      → get one faculty member (admin)
// PUT  /api/faculty/:id      → update faculty by id (admin only)
// DELETE /api/faculty/:id    → delete faculty by id (admin only)
router
  .route("/:id")
  .get(protect, authorize("admin"), getFacultyById)
  .put(protect, authorize("admin"), updateFacultyById)
  .delete(protect, authorize("admin"), deleteFacultyById);

export default router;
