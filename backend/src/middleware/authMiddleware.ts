import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Request type to include user info
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1]; // "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please login.",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as { userId: string; email: string };

    // Attach user info to request
    req.user = decoded;

    // Continue to next function
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please login again.",
    });
  }
};
