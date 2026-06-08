import User from "../models/User.js";
import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";
import Parent from "../models/Parent.js";
import { sendSuccess, sendError } from "../utils/response.js";

// @desc    Get system dashboard metrics
// @route   GET /api/admin/metrics
// @access  Private (admin only)
export const getMetrics = async (req, res, next) => {
  try {
    const [totalUsers, totalStudents, totalFaculty, totalParents] =
      await Promise.all([
        User.countDocuments(),
        Student.countDocuments({ isActive: true }),
        Faculty.countDocuments({ isActive: true }),
        Parent.countDocuments({ isActive: true }),
      ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    return sendSuccess(res, "Dashboard metrics retrieved successfully", {
      metrics: {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalParents,
        usersByRole,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all system users
// @route   GET /api/admin/users
// @access  Private (admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (role) filter.role = role;

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, "Users retrieved successfully", {
      total,
      page: Number(page),
      limit: Number(limit),
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new user account (admin only)
// @route   POST /api/admin/users
// @access  Private (admin only)
export const createUser = async (req, res, next) => {
  try {
    const { username, email, password, role, name, subtitle } = req.body;

    if (!username || !email || !password || !role || !name) {
      return sendError(
        res,
        "username, email, password, role, and name are required",
        400
      );
    }

    const validRoles = ["student", "faculty", "parent", "admin"];
    if (!validRoles.includes(role)) {
      return sendError(
        res,
        `Invalid role. Must be one of: ${validRoles.join(", ")}`,
        400
      );
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existing) {
      return sendError(
        res,
        "Username or email is already registered in the system",
        400
      );
    }

    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash: password,
      role,
      name,
      subtitle: subtitle || "",
    });

    return sendSuccess(
      res,
      "User account created successfully",
      {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          name: user.name,
          subtitle: user.subtitle,
          createdAt: user.createdAt,
        },
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single user by ID
// @route   GET /api/admin/users/:id
// @access  Private (admin only)
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    // Fetch role-specific profile
    let profile = null;
    if (user.role === "student") {
      profile = await Student.findOne({ userId: user._id });
    } else if (user.role === "faculty") {
      profile = await Faculty.findOne({ userId: user._id });
    } else if (user.role === "parent") {
      profile = await Parent.findOne({ userId: user._id });
    }

    return sendSuccess(res, "User retrieved successfully", { user, profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a user account (admin only)
// @route   PUT /api/admin/users/:id
// @access  Private (admin only)
export const updateUser = async (req, res, next) => {
  try {
    const allowedFields = ["name", "subtitle", "isActive"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return sendError(res, "No valid fields provided for update", 400);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, "User updated successfully", { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user account and associated profile (admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private (admin only)
export const deleteUser = async (req, res, next) => {
  try {
    // Prevent admin from deleting their own account
    if (req.params.id === req.user._id.toString()) {
      return sendError(res, "Admins cannot delete their own account", 403);
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    // Remove linked profile based on role
    if (user.role === "student") {
      await Student.findOneAndDelete({ userId: user._id });
    } else if (user.role === "faculty") {
      await Faculty.findOneAndDelete({ userId: user._id });
    } else if (user.role === "parent") {
      await Parent.findOneAndDelete({ userId: user._id });
    }

    await User.findByIdAndDelete(req.params.id);

    return sendSuccess(
      res,
      `User '${user.username}' and associated profile deleted successfully`,
      {}
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin's own profile
// @route   GET /api/admin/profile
// @access  Private (admin only)
export const getAdminProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");

    return sendSuccess(res, "Admin profile retrieved successfully", { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin's own profile
// @route   PUT /api/admin/profile
// @access  Private (admin only)
export const updateAdminProfile = async (req, res, next) => {
  try {
    const allowedFields = ["name", "subtitle"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return sendError(res, "No valid fields provided for update", 400);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    return sendSuccess(res, "Admin profile updated successfully", { user });
  } catch (error) {
    next(error);
  }
};
