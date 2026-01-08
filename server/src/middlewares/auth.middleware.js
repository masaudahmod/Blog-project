import jwt from "jsonwebtoken";
import { AppError } from "./error.middleware.js";

/**
 * Verify authentication token and attach user to request
 * Does not check role - just verifies token is valid
 */
export const verifyAuth = (req, res, next) => {
  const token =
    req.headers.cookie?.split("=")[1] ||
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "Unauthorized: No token provided" 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: "Unauthorized: Invalid or expired token" 
    });
  }
};

/**
 * Verify user is admin
 * @deprecated Use verifyAuth + allowRoles(['admin']) instead
 */
export const verifyAdmin = (req, res, next) => {
  const token =
    req.headers.cookie?.split("=")[1] ||
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "Unauthorized: No token provided" 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if (decoded.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        message: "Forbidden: Admin access required" 
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: "Unauthorized: Invalid or expired token" 
    });
  }
};

/**
 * Role-Based Access Control Middleware
 * Allows access only if user has one of the specified roles
 * Usage: allowRoles('admin', 'moderator')
 */
export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is authenticated (should be set by verifyAuth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Authentication required",
      });
    }

    // Check if user's role is in the allowed roles list
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of these roles: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};

/**
 * Verify user by specific role (legacy - use allowRoles instead)
 * @deprecated Use verifyAuth + allowRoles(['role']) instead
 */
export const verifyUserByRole = (req, res, next, role) => {
  const token =
    req.headers.cookie?.split("=")[1] ||
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "Unauthorized: No token provided" 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if (decoded.role !== role) {
      return res.status(403).json({ 
        success: false,
        message: `Forbidden: Access requires role: ${role}` 
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: "Unauthorized: Invalid or expired token" 
    });
  }
};
