import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendError } from "../utils/response.js";

export const protect = async (req, res, next) => {
  let token;

  // Read header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Mount user to request
      req.user = await User.findById(decoded.id).select("-passwordHash");

      if (!req.user) {
        return sendError(res, "Not authorized, user profile not found", 401);
      }

      return next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      return sendError(res, "Not authorized, token validation failed", 401);
    }
  }

  if (!token) {
    return sendError(res, "Not authorized, token not provided", 401);
  }
};
