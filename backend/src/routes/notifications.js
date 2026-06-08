import express from "express";
import { protect } from "../middlewares/auth.js";
import { authorize } from "../middlewares/rbac.js";
import {
  getMyNotifications,
  createNotification,
  markAsRead,
} from "../controllers/notificationsController.js";

const router = express.Router();

// GET /api/notifications - Fetch user's notification inbox
// POST /api/notifications - Create/Broadcast announcement (Faculty and Admin)
router
  .route("/")
  .get(protect, getMyNotifications)
  .post(protect, authorize("faculty", "admin"), createNotification);

// PUT /api/notifications/:id/read - Mark notification as read
router.put("/:id/read", protect, markAsRead);

export default router;
