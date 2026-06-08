import { sendError } from "../utils/response.js";

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Authorization required, session not found", 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Role forbidden. User role '${req.user.role}' is not authorized to access this resource`,
        403
      );
    }

    next();
  };
};
