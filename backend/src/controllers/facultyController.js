import Faculty from "../models/Faculty.js";
import { sendSuccess, sendError } from "../utils/response.js";

// @desc    Get current faculty's profile
// @route   GET /api/faculty/profile
// @access  Private (faculty only)
export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await Faculty.findOne({ userId: req.user._id }).populate(
      "userId",
      "name email username subtitle"
    );

    if (!profile) {
      return sendError(
        res,
        "Faculty profile not found. Please contact admin to set up your profile.",
        404
      );
    }

    return sendSuccess(res, "Faculty profile retrieved successfully", {
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current faculty's profile
// @route   PUT /api/faculty/profile
// @access  Private (faculty only)
export const updateMyProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      "phone",
      "address",
      "photoUrl",
      "dateOfBirth",
      "qualification",
    ];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return sendError(res, "No valid fields provided for update", 400);
    }

    const profile = await Faculty.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("userId", "name email username subtitle");

    if (!profile) {
      return sendError(res, "Faculty profile not found", 404);
    }

    return sendSuccess(res, "Faculty profile updated successfully", { profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a faculty profile by ID
// @route   GET /api/faculty/:id
// @access  Private (admin only)
export const getFacultyById = async (req, res, next) => {
  try {
    const profile = await Faculty.findById(req.params.id).populate(
      "userId",
      "name email username subtitle role"
    );

    if (!profile) {
      return sendError(res, "Faculty member not found", 404);
    }

    return sendSuccess(res, "Faculty retrieved successfully", { profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all faculty (admin access)
// @route   GET /api/faculty
// @access  Private (admin)
export const getAllFaculty = async (req, res, next) => {
  try {
    const { department } = req.query;
    const filter = { isActive: true };

    if (department) filter.department = department;

    const faculty = await Faculty.find(filter)
      .populate("userId", "name email username subtitle")
      .sort({ department: 1 });

    return sendSuccess(res, "Faculty list retrieved successfully", {
      count: faculty.length,
      faculty,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a faculty profile (admin only)
// @route   POST /api/faculty
// @access  Private (admin only)
export const createFacultyProfile = async (req, res, next) => {
  try {
    const {
      userId,
      employeeId,
      department,
      designation,
      subjects,
      phone,
      address,
      photoUrl,
      qualification,
      experience,
      joiningDate,
    } = req.body;

    if (!userId || !employeeId || !department || !designation) {
      return sendError(
        res,
        "userId, employeeId, department, and designation are required",
        400
      );
    }

    const existing = await Faculty.findOne({
      $or: [{ userId }, { employeeId: employeeId.toUpperCase() }],
    });

    if (existing) {
      return sendError(
        res,
        "A faculty profile already exists for this user or employee ID",
        400
      );
    }

    const profile = await Faculty.create({
      userId,
      employeeId,
      department,
      designation,
      subjects: subjects || [],
      phone: phone || "",
      address: address || "",
      photoUrl: photoUrl || "",
      qualification: qualification || "",
      experience: experience || 0,
      joiningDate: joiningDate || null,
    });

    return sendSuccess(
      res,
      "Faculty profile created successfully",
      { profile },
      201
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Update a faculty profile by ID (admin only)
// @route   PUT /api/faculty/:id
// @access  Private (admin only)
export const updateFacultyById = async (req, res, next) => {
  try {
    const allowedFields = [
      "employeeId",
      "department",
      "designation",
      "subjects",
      "phone",
      "address",
      "photoUrl",
      "qualification",
      "experience",
      "joiningDate",
      "isActive",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const profile = await Faculty.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("userId", "name email username subtitle");

    if (!profile) {
      return sendError(res, "Faculty member not found", 404);
    }

    return sendSuccess(res, "Faculty profile updated successfully", { profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a faculty profile (admin only)
// @route   DELETE /api/faculty/:id
// @access  Private (admin only)
export const deleteFacultyById = async (req, res, next) => {
  try {
    const profile = await Faculty.findByIdAndDelete(req.params.id);

    if (!profile) {
      return sendError(res, "Faculty member not found", 404);
    }

    return sendSuccess(res, "Faculty profile deleted successfully", {});
  } catch (error) {
    next(error);
  }
};
