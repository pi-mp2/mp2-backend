import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Extended Request interface that includes the `user` property.
 * This property stores the decoded information from the JWT.
 */
export interface AuthRequest extends Request {
  user?: { id: string, email: string };
}

/**
 * Middleware that verifies the validity of a JSON Web Token (JWT)
 * stored in the user's cookies. If the token is valid, the decoded
 * user information (id and email) is attached to `req.user` so it
 * can be accessed by subsequent middlewares or controllers.
 *
 * @param req - Express request object (extended as AuthRequest)
 * @param res - Express response object
 * @param next - Callback to pass control to the next middleware
 */
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Retrieve the token from cookies (requires cookie-parser middleware)
    const token = req.cookies.token; // expected format: Bearer <token>
    
    // If no token is found, deny access with 401 Unauthorized
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // Verify and decode the token using the secret key from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string };

    // Attach decoded user data to the request object for later use
    req.user = decoded;

    // Continue to the next middleware or route handler
    next();

  } catch (error) {
    // If the token is invalid or expired, return 403 Forbidden
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
