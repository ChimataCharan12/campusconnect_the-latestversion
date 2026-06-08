import Student from "../models/Student.js";
import { sendSuccess, sendError } from "../utils/response.js";

// @desc    Get current student's profile
// @route   GET /api/students/profile
// @access  Private (student only)
export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await Student.findOne({ userId: req.user._id }).populate(
      "userId",
      "name email username subtitle"
    );

    if (!profile) {
      return sendError(
        res,
        "Student profile not found. Please contact admin to set up your profile.",
        404
      );
    }

    return sendSuccess(res, "Student profile retrieved successfully", {
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current student's profile
// @route   PUT /api/students/profile
// @access  Private (student only)
export const updateMyProfile = async (req, res, next) => {
  try {
    const allowedFields = ["phone", "address", "photoUrl", "dateOfBirth"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return sendError(res, "No valid fields provided for update", 400);
    }

    const profile = await Student.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("userId", "name email username subtitle");

    if (!profile) {
      return sendError(res, "Student profile not found", 404);
    }

    return sendSuccess(res, "Student profile updated successfully", { profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a student profile by ID (admin/faculty access)
// @route   GET /api/students/:id
// @access  Private (admin, faculty)
export const getStudentById = async (req, res, next) => {
  try {
    const profile = await Student.findById(req.params.id)
      .populate("userId", "name email username subtitle role")
      .populate("parentId", "phone relation");

    if (!profile) {
      return sendError(res, "Student not found", 404);
    }

    return sendSuccess(res, "Student retrieved successfully", { profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students (admin/faculty access)
// @route   GET /api/students
// @access  Private (admin, faculty)
export const getAllStudents = async (req, res, next) => {
  try {
    const { branch, section, year } = req.query;
    const filter = { isActive: true };

    if (branch) filter.branch = branch;
    if (section) filter.section = section;
    if (year) filter.year = Number(year);

    const students = await Student.find(filter)
      .populate("userId", "name email username subtitle")
      .sort({ rollNumber: 1 });

    return sendSuccess(res, "Students retrieved successfully", {
      count: students.length,
      students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a student profile (admin only)
// @route   POST /api/students
// @access  Private (admin only)
export const createStudentProfile = async (req, res, next) => {
  try {
    const {
      userId,
      rollNumber,
      branch,
      section,
      year,
      semester,
      cgpa,
      phone,
      address,
      photoUrl,
      parentId,
      admissionYear,
    } = req.body;

    if (!userId || !rollNumber || !branch || !section || !year || !semester) {
      return sendError(
        res,
        "userId, rollNumber, branch, section, year, and semester are required",
        400
      );
    }

    const existing = await Student.findOne({
      $or: [{ userId }, { rollNumber: rollNumber.toUpperCase() }],
    });

    if (existing) {
      return sendError(
        res,
        "A student profile already exists for this user or roll number",
        400
      );
    }

    const profile = await Student.create({
      userId,
      rollNumber,
      branch,
      section,
      year,
      semester,
      cgpa: cgpa || 0,
      phone: phone || "",
      address: address || "",
      photoUrl: photoUrl || "",
      parentId: parentId || null,
      admissionYear: admissionYear || new Date().getFullYear(),
    });

    return sendSuccess(
      res,
      "Student profile created successfully",
      { profile },
      201
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Update a student profile by ID (admin only)
// @route   PUT /api/students/:id
// @access  Private (admin only)
export const updateStudentById = async (req, res, next) => {
  try {
    const allowedFields = [
      "rollNumber",
      "branch",
      "section",
      "year",
      "semester",
      "cgpa",
      "phone",
      "address",
      "photoUrl",
      "parentId",
      "admissionYear",
      "isActive",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const profile = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("userId", "name email username subtitle");

    if (!profile) {
      return sendError(res, "Student not found", 404);
    }

    return sendSuccess(res, "Student profile updated successfully", { profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a student profile (admin only)
// @route   DELETE /api/students/:id
// @access  Private (admin only)
export const deleteStudentById = async (req, res, next) => {
  try {
    const profile = await Student.findByIdAndDelete(req.params.id);

    if (!profile) {
      return sendError(res, "Student not found", 404);
    }

    return sendSuccess(res, "Student profile deleted successfully", {});
  } catch (error) {
    next(error);
  }
};
