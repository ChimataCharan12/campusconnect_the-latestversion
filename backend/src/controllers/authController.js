import jwt from "jsonwebtoken";
import crypto from "crypto";
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
          photoUrl: user.photoUrl,
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
        photoUrl: user.photoUrl,
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
        photoUrl: req.user.photoUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request a password reset token
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, "Please provide an email address", 400);
    }

    // Look up user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return sendError(res, "No account found with that email address", 404);
    }

    // ── Token generation ────────────────────────────────────────────────────
    // 1. Generate a cryptographically secure raw token (32 bytes → 64 hex chars)
    const rawToken = crypto.randomBytes(32).toString("hex");

    // 2. Hash it with SHA-256 — ONLY the hash is persisted to MongoDB
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // 3. Set token fields on the user document
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // 4. Save — bypass required-field validation for unrelated fields
    await user.save({ validateBeforeSave: false });

    // ── Dev-mode response (raw token returned; email step comes later) ───────
    return sendSuccess(res, "Password reset token generated", {
      resetToken: rawToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return sendError(res, "Please provide a new password", 400);
    }

    // Hash the raw token to compare with the database hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user by hashed token and make sure it has not expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return sendError(res, "Invalid or expired reset token", 400);
    }

    // Set the new password and clear the reset fields
    user.passwordHash = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    // Save the user (this will trigger the pre-save hook to hash user.passwordHash)
    await user.save();

    return sendSuccess(res, "Password reset successful");
  } catch (error) {
    next(error);
  }
};

