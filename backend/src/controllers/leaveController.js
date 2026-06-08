import LeaveRequest from "../models/LeaveRequest.js";
import Student from "../models/Student.js";
import { sendSuccess, sendError } from "../utils/response.js";

// @desc    Get leave requests
// @route   GET /api/leaves
// @access  Private
export const getLeaveRequests = async (req, res, next) => {
  try {
    const { role } = req.user;
    let filter = {};

    if (role === "student") {
      const studentProfile = await Student.findOne({ userId: req.user._id });
      if (!studentProfile) {
        return sendError(res, "Student profile not found", 404);
      }
      filter = { studentId: studentProfile._id };
    } else if (role === "parent") {
      const { studentId } = req.query;
      if (!studentId) {
        return sendError(res, "studentId query parameter is required for parents", 400);
      }
      filter = { studentId };
    } else if (role === "faculty" || role === "admin") {
      const { studentId, status } = req.query;
      if (studentId) filter.studentId = studentId;
      if (status) filter.status = status;
    }

    const leaves = await LeaveRequest.find(filter)
      .populate({
        path: "studentId",
        populate: { path: "userId", select: "name rollNumber branch section" },
      })
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });

    return sendSuccess(res, "Leave requests retrieved successfully", {
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a leave request
// @route   POST /api/leaves
// @access  Private (Student only)
export const createLeaveRequest = async (req, res, next) => {
  try {
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      return sendError(res, "startDate, endDate, and reason are required", 400);
    }

    const studentProfile = await Student.findOne({ userId: req.user._id });
    if (!studentProfile) {
      return sendError(res, "Student profile not found. You must have a student profile to request leave.", 404);
    }

    const leave = await LeaveRequest.create({
      studentId: studentProfile._id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: "Pending",
      approvedBy: null,
      remarks: "",
    });

    return sendSuccess(res, "Leave request submitted successfully", { leave }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject leave request
// @route   PUT /api/leaves/:id
// @access  Private (Faculty, Admin only)
export const reviewLeaveRequest = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    if (!status || !["Approved", "Rejected"].includes(status)) {
      return sendError(res, "Valid status ('Approved' or 'Rejected') is required", 400);
    }

    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave) {
      return sendError(res, "Leave request not found", 404);
    }

    leave.status = status;
    leave.remarks = remarks || "";
    leave.approvedBy = req.user._id;

    await leave.save();

    const populatedLeave = await leave.populate([
      { path: "studentId", populate: { path: "userId", select: "name" } },
      { path: "approvedBy", select: "name email" },
    ]);

    return sendSuccess(res, `Leave request ${status.toLowerCase()} successfully`, { leave: populatedLeave });
  } catch (error) {
    next(error);
  }
};
