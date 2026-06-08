import express from "express";
import { protect } from "../middlewares/auth.js";
import { authorize } from "../middlewares/rbac.js";
import {
  getTimetable,
  createTimetableSlot,
  updateTimetableSlot,
  deleteTimetableSlot,
} from "../controllers/timetableController.js";

const router = express.Router();

// GET /api/timetable - Get timetable (All authenticated roles)
// POST /api/timetable - Create slot (Admin only)
router
  .route("/")
  .get(protect, getTimetable)
  .post(protect, authorize("admin"), createTimetableSlot);

// PUT /api/timetable/:id - Update slot (Admin only)
// DELETE /api/timetable/:id - Delete slot (Admin only)
router
  .route("/:id")
  .put(protect, authorize("admin"), updateTimetableSlot)
  .delete(protect, authorize("admin"), deleteTimetableSlot);

export default router;
