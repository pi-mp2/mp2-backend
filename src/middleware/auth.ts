import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "@models/user";
import { Types } from "mongoose"

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
export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Retrieve the token from cookies (requires cookie-parser middleware)
    const token = req.cookies.token; // expected format: Bearer <token>
    
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
    };

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = { id: (user._id as Types.ObjectId).toString(), email: user.email };

    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
