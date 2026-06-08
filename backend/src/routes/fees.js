import express from "express";
import { protect } from "../middlewares/auth.js";
import { authorize } from "../middlewares/rbac.js";
import {
  getStudentInvoices,
  createInvoice,
  payInvoice,
} from "../controllers/feeController.js";

const router = express.Router();

// GET /api/fees/student/:studentId - Fetch invoices for a student
router.get("/student/:studentId", protect, getStudentInvoices);

// POST /api/fees - Create a new invoice (Admin only)
router.post("/", protect, authorize("admin"), createInvoice);

// POST /api/fees/pay/:invoiceId - Simulate paying an invoice (Parent only)
router.post("/pay/:invoiceId", protect, authorize("parent"), payInvoice);

export default router;
