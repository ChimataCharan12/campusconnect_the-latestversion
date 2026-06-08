import { sendError } from "../utils/response.js";

const errorHandler = (err, req, res, next) => {
  console.error("Express Error:", err.stack || err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || null;

  return sendError(res, message, statusCode, errors);
};

export default errorHandler;
