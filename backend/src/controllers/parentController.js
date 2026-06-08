import Parent from "../models/Parent.js";
import Student from "../models/Student.js";
import { sendSuccess, sendError } from "../utils/response.js";

// @desc    Get current parent's profile
// @route   GET /api/parents/profile
// @access  Private (parent only)
export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await Parent.findOne({ userId: req.user._id })
      .populate("userId", "name email username subtitle")
      .populate({
        path: "children",
        populate: {
          path: "userId",
          select: "name email subtitle",
        },
      });

    if (!profile) {
      return sendError(
        res,
        "Parent profile not found. Please contact admin to set up your profile.",
        404
      );
    }

    return sendSuccess(res, "Parent profile retrieved successfully", {
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current parent's profile
// @route   PUT /api/parents/profile
// @access  Private (parent only)
export const updateMyProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      "phone",
      "alternatePhone",
      "address",
      "occupation",
      "photoUrl",
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

    const profile = await Parent.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate("userId", "name email username subtitle")
      .populate({
        path: "children",
        populate: { path: "userId", select: "name email subtitle" },
      });

    if (!profile) {
      return sendError(res, "Parent profile not found", 404);
    }

    return sendSuccess(res, "Parent profile updated successfully", { profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Get linked children of current parent
// @route   GET /api/parents/children
// @access  Private (parent only)
export const getMyChildren = async (req, res, next) => {
  try {
    const parentProfile = await Parent.findOne({
      userId: req.user._id,
    }).populate({
      path: "children",
      populate: { path: "userId", select: "name email subtitle" },
    });

    if (!parentProfile) {
      return sendError(res, "Parent profile not found", 404);
    }

    return sendSuccess(res, "Children retrieved successfully", {
      count: parentProfile.children.length,
      children: parentProfile.children,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a parent profile by ID (admin only)
// @route   GET /api/parents/:id
// @access  Private (admin only)
export const getParentById = async (req, res, next) => {
  try {
    const profile = await Parent.findById(req.params.id)
      .populate("userId", "name email username subtitle role")
      .populate({
        path: "children",
        populate: { path: "userId", select: "name email subtitle" },
      });

    if (!profile) {
      return sendError(res, "Parent not found", 404);
    }

    return sendSuccess(res, "Parent retrieved successfully", { profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all parents (admin only)
// @route   GET /api/parents
// @access  Private (admin only)
export const getAllParents = async (req, res, next) => {
  try {
    const parents = await Parent.find({ isActive: true })
      .populate("userId", "name email username subtitle")
      .sort({ createdAt: -1 });

    return sendSuccess(res, "Parents list retrieved successfully", {
      count: parents.length,
      parents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a parent profile (admin only)
// @route   POST /api/parents
// @access  Private (admin only)
export const createParentProfile = async (req, res, next) => {
  try {
    const {
      userId,
      phone,
      alternatePhone,
      address,
      occupation,
      relation,
      photoUrl,
      children,
    } = req.body;

    if (!userId || !phone) {
      return sendError(res, "userId and phone are required", 400);
    }

    const existing = await Parent.findOne({ userId });
    if (existing) {
      return sendError(
        res,
        "A parent profile already exists for this user",
        400
      );
    }

    const profile = await Parent.create({
      userId,
      phone,
      alternatePhone: alternatePhone || "",
      address: address || "",
      occupation: occupation || "",
      relation: relation || "Father",
      photoUrl: photoUrl || "",
      children: children || [],
    });

    return sendSuccess(
      res,
      "Parent profile created successfully",
      { profile },
      201
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Update a parent profile by ID (admin only)
// @route   PUT /api/parents/:id
// @access  Private (admin only)
export const updateParentById = async (req, res, next) => {
  try {
    const allowedFields = [
      "phone",
      "alternatePhone",
      "address",
      "occupation",
      "relation",
      "photoUrl",
      "children",
      "isActive",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const profile = await Parent.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("userId", "name email username subtitle");

    if (!profile) {
      return sendError(res, "Parent not found", 404);
    }

    return sendSuccess(res, "Parent profile updated successfully", { profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a parent profile (admin only)
// @route   DELETE /api/parents/:id
// @access  Private (admin only)
export const deleteParentById = async (req, res, next) => {
  try {
    const profile = await Parent.findByIdAndDelete(req.params.id);

    if (!profile) {
      return sendError(res, "Parent not found", 404);
    }

    return sendSuccess(res, "Parent profile deleted successfully", {});
  } catch (error) {
    next(error);
  }
};
