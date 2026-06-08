import express from "express";
import { protect } from "../middlewares/auth.js";
import { authorize } from "../middlewares/rbac.js";
import {
  getLeaveRequests,
  createLeaveRequest,
  reviewLeaveRequest,
} from "../controllers/leaveController.js";

const router = express.Router();

// GET /api/leaves - Fetch leave requests (all authenticated roles with filters)
// POST /api/leaves - Submit a leave request (Student only)
router
  .route("/")
  .get(protect, getLeaveRequests)
  .post(protect, authorize("student"), createLeaveRequest);

// PUT /api/leaves/:id - Approve or reject leave request (Faculty and Admin)
router.put("/:id", protect, authorize("faculty", "admin"), reviewLeaveRequest);

export default router;
