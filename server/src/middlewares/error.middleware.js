/**
 * Centralized Error Handling Middleware
 * Catches all errors and returns consistent JSON responses
 */

export const errorHandler = (err, req, res, next) => {
  // Default error status and message
  let status = err.status || err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Log error for debugging (in production, use proper logging service)
  console.error("Error:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Handle specific error types
  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation Error: " + message;
  } else if (err.name === "UnauthorizedError" || err.name === "JsonWebTokenError") {
    status = 401;
    message = "Unauthorized: Invalid or missing token";
  } else if (err.code === "23505") {
    // PostgreSQL unique constraint violation
    status = 409;
    message = "Duplicate entry: This record already exists";
  } else if (err.code === "23503") {
    // PostgreSQL foreign key constraint violation
    status = 400;
    message = "Invalid reference: Related record does not exist";
  } else if (err.code === "ETIMEDOUT" || err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
    // Database connection errors
    status = 503;
    message = "Database connection unavailable. Please try again later.";
    console.error("Database connection error:", {
      code: err.code,
      message: err.message,
      address: err.address,
      port: err.port,
    });
  } else if (err.code === "57014" || err.message?.includes("timeout")) {
    // Query timeout errors
    status = 504;
    message = "Database query timed out. Please try again.";
  }

  // Send error response
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 * Usage: wrap async functions with this to automatically catch errors
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
