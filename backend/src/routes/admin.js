import express from "express";
import { protect } from "../middlewares/auth.js";
import { authorize } from "../middlewares/rbac.js";
import {
  getMetrics,
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAdminProfile,
  updateAdminProfile,
} from "../controllers/adminController.js";

const router = express.Router();

// ── Admin self-profile ─────────────────────────────────────────────────────────
// GET  /api/admin/profile  → admin fetches own account info
// PUT  /api/admin/profile  → admin updates own name/subtitle
router
  .route("/profile")
  .get(protect, authorize("admin"), getAdminProfile)
  .put(protect, authorize("admin"), updateAdminProfile);

// ── Dashboard metrics ──────────────────────────────────────────────────────────
// GET  /api/admin/metrics  → system-wide user/profile counts
router.get("/metrics", protect, authorize("admin"), getMetrics);

// ── User management ────────────────────────────────────────────────────────────
// GET  /api/admin/users    → paginated list of all users (filterable by role)
// POST /api/admin/users    → create a new user account
router
  .route("/users")
  .get(protect, authorize("admin"), getAllUsers)
  .post(protect, authorize("admin"), createUser);

// GET    /api/admin/users/:id  → get user + linked profile
// PUT    /api/admin/users/:id  → update user account fields
// DELETE /api/admin/users/:id  → delete user + cascade-delete role profile
router
  .route("/users/:id")
  .get(protect, authorize("admin"), getUserById)
  .put(protect, authorize("admin"), updateUser)
  .delete(protect, authorize("admin"), deleteUser);

export default router;
