import Invoice from "../models/Invoice.js";
import Student from "../models/Student.js";
import Parent from "../models/Parent.js";
import { sendSuccess, sendError } from "../utils/response.js";

// Helper: Verify parent permission for a student
const verifyParentAccess = async (parentUserId, studentId) => {
  const parentProfile = await Parent.findOne({ userId: parentUserId });
  if (!parentProfile) return false;
  return parentProfile.children.some((childId) => childId.toString() === studentId.toString());
};

// @desc    Get student invoices
// @route   GET /api/fees/student/:studentId
// @access  Private (Self student, parent of child, admin)
export const getStudentInvoices = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { role } = req.user;

    // Access control check
    if (role === "student") {
      const studentProfile = await Student.findOne({ userId: req.user._id });
      if (!studentProfile || studentProfile._id.toString() !== studentId) {
        return sendError(res, "Access denied. You can only view your own fee invoices", 403);
      }
    } else if (role === "parent") {
      const hasAccess = await verifyParentAccess(req.user._id, studentId);
      if (!hasAccess) {
        return sendError(res, "Access denied. You can only view your children's fee invoices", 403);
      }
    }

    const invoices = await Invoice.find({ studentId }).sort({ dueDate: 1 });

    return sendSuccess(res, "Fee invoices retrieved successfully", {
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new invoice
// @route   POST /api/fees
// @access  Private (Admin only)
export const createInvoice = async (req, res, next) => {
  try {
    const { studentId, title, amount, dueDate } = req.body;

    if (!studentId || !title || !amount || !dueDate) {
      return sendError(res, "studentId, title, amount, and dueDate are required", 400);
    }

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return sendError(res, "Student profile not found", 404);
    }

    const invoice = await Invoice.create({
      studentId,
      title,
      amount: Number(amount),
      dueDate: new Date(dueDate),
      status: "Unpaid",
      paymentDate: null,
      paymentMethod: "",
      transactionId: "",
    });

    return sendSuccess(res, "Invoice created successfully", { invoice }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate paying an invoice
// @route   POST /api/fees/pay/:invoiceId
// @access  Private (Parent only)
export const payInvoice = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const { paymentMethod, transactionId } = req.body;

    if (!paymentMethod || !transactionId) {
      return sendError(res, "paymentMethod and transactionId are required", 400);
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return sendError(res, "Invoice not found", 404);
    }

    if (invoice.status === "Paid") {
      return sendError(res, "Invoice has already been paid", 400);
    }

    // Verify parent has access to this student's invoice
    const hasAccess = await verifyParentAccess(req.user._id, invoice.studentId);
    if (!hasAccess) {
      return sendError(res, "Access denied. You can only pay invoices for your own children", 403);
    }

    invoice.status = "Paid";
    invoice.paymentDate = new Date();
    invoice.paymentMethod = paymentMethod;
    invoice.transactionId = transactionId;

    await invoice.save();

    return sendSuccess(res, "Invoice paid successfully", { invoice });
  } catch (error) {
    next(error);
  }
};
