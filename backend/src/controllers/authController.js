import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendSuccess, sendError } from "../utils/response.js";

// Helper to generate token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { username, email, password, role, name, subtitle } = req.body;

    // Validation
    if (!username || !email || !password || !role || !name) {
      return sendError(res, "Please fill in all required fields", 400);
    }

    const validRoles = ["student", "faculty", "parent", "admin"];
    if (!validRoles.includes(role)) {
      return sendError(res, "Invalid user role specified", 400);
    }

    // Check duplicates
    const userExists = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (userExists) {
      return sendError(res, "Username or email is already registered", 400);
    }

    // Create user (User.js pre-save hook will hash the passwordHash field)
    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash: password,
      role,
      name,
      subtitle: subtitle || "",
    });

    const token = generateToken(user._id);

    return sendSuccess(
      res,
      "User registered successfully",
      {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          name: user.name,
          subtitle: user.subtitle,
        },
      },
      211 // Using a successful status code for creation
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendError(res, "Please enter both username/email and password", 400);
    }

    // Find user (by username or email)
    const user = await User.findOne({
      $or: [
        { email: username.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    });

    if (!user) {
      return sendError(res, "Invalid credentials", 401);
    }

    // Check password match
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, "Invalid credentials", 401);
    }

    const token = generateToken(user._id);

    return sendSuccess(res, "Logged in successfully", {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
        subtitle: user.subtitle,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, "Current user profile retrieved", {
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        name: req.user.name,
        subtitle: req.user.subtitle,
      },
    });
  } catch (error) {
    next(error);
  }
};
