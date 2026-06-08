import Mark from "../models/Mark.js";
import Student from "../models/Student.js";
import Parent from "../models/Parent.js";
import { sendSuccess, sendError } from "../utils/response.js";

// Helper: Verify parent permission for a student
const verifyParentAccess = async (parentUserId, studentId) => {
  const parentProfile = await Parent.findOne({ userId: parentUserId });
  if (!parentProfile) return false;
  return parentProfile.children.some((childId) => childId.toString() === studentId.toString());
};

// @desc    Get all marks for a student
// @route   GET /api/marks/student/:studentId
// @access  Private (Self student, parent of child, faculty, admin)
export const getStudentMarks = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { role } = req.user;

    // Access control check
    if (role === "student") {
      const studentProfile = await Student.findOne({ userId: req.user._id });
      if (!studentProfile || studentProfile._id.toString() !== studentId) {
        return sendError(res, "Access denied. You can only view your own marks", 403);
      }
    } else if (role === "parent") {
      const hasAccess = await verifyParentAccess(req.user._id, studentId);
      if (!hasAccess) {
        return sendError(res, "Access denied. You can only view your children's marks", 403);
      }
    }

    const { subject, examType } = req.query;
    const filter = { studentId };

    if (subject) filter.subject = subject;
    if (examType) filter.examType = examType;

    const marks = await Mark.find(filter).sort({ subject: 1, examType: 1 });

    return sendSuccess(res, "Student marks retrieved successfully", {
      count: marks.length,
      marks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get class marks details (Faculty and Admin)
// @route   GET /api/marks/class
// @access  Private (Faculty, Admin)
export const getClassMarks = async (req, res, next) => {
  try {
    const { branch, section, year, subject, examType } = req.query;

    if (!branch || !section || !year || !subject || !examType) {
      return sendError(res, "branch, section, year, subject, and examType parameters are required", 400);
    }

    // Find students in this class
    const students = await Student.find({
      branch,
      section,
      year: Number(year),
      isActive: true,
    });

    if (students.length === 0) {
      return sendSuccess(res, "No active students found in this class", { students: [], marks: [] });
    }

    const studentIds = students.map((s) => s._id);

    // Find marks records for these students
    const marks = await Mark.find({
      studentId: { $in: studentIds },
      subject,
      examType,
    }).populate({
      path: "studentId",
      populate: { path: "userId", select: "name rollNumber" },
    });

    return sendSuccess(res, "Class marks retrieved successfully", {
      count: marks.length,
      marks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update or insert student marks (in bulk or single)
// @route   POST /api/marks/update
// @access  Private (Faculty, Admin)
export const updateStudentMarks = async (req, res, next) => {
  try {
    const { subject, examType, marksData } = req.body;

    if (!subject || !examType || !marksData || !Array.isArray(marksData)) {
      return sendError(res, "subject, examType, and marksData (array) are required", 400);
    }

    const operations = marksData.map((data) => {
      const { studentId, marksObtained, maxMarks, remarks } = data;
      return {
        updateOne: {
          filter: { studentId, subject, examType },
          update: {
            $set: {
              marksObtained: Number(marksObtained),
              maxMarks: Number(maxMarks) || 100,
              remarks: remarks || "",
            },
          },
          upsert: true,
        },
      };
    });

    await Mark.bulkWrite(operations);

    return sendSuccess(res, "Student marks updated successfully", {
      updatedCount: marksData.length,
    });
  } catch (error) {
    next(error);
  }
};
