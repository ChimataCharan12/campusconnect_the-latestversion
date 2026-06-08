import express from "express";
import { protect } from "../middlewares/auth.js";
import { authorize } from "../middlewares/rbac.js";
import {
  getMyProfile,
  updateMyProfile,
  getMyChildren,
  getParentById,
  getAllParents,
  createParentProfile,
  updateParentById,
  deleteParentById,
} from "../controllers/parentController.js";

const router = express.Router();

// ── Self-service routes (parent access) ───────────────────────────────────────
// GET  /api/parents/profile   → parent fetches own profile
// PUT  /api/parents/profile   → parent updates own safe fields
router
  .route("/profile")
  .get(protect, authorize("parent"), getMyProfile)
  .put(protect, authorize("parent"), updateMyProfile);

// GET  /api/parents/children  → parent views linked child records
router.get("/children", protect, authorize("parent"), getMyChildren);

// ── Admin routes ───────────────────────────────────────────────────────────────
// GET  /api/parents           → list all parents (admin)
// POST /api/parents           → create a parent profile (admin only)
router
  .route("/")
  .get(protect, authorize("admin"), getAllParents)
  .post(protect, authorize("admin"), createParentProfile);

// GET  /api/parents/:id       → get one parent (admin)
// PUT  /api/parents/:id       → update parent by id (admin only)
// DELETE /api/parents/:id     → delete parent by id (admin only)
router
  .route("/:id")
  .get(protect, authorize("admin"), getParentById)
  .put(protect, authorize("admin"), updateParentById)
  .delete(protect, authorize("admin"), deleteParentById);

export default router;
