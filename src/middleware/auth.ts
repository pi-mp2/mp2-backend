import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "@models/user";

export interface AuthRequest extends Request {
  user?: { id: string, email: string };
}

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      tokenVersion: number;
    };

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Invalid token user" });
    }

    // ✅ Verificamos si el tokenVersion aún coincide
    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ message: "Token no longer valid" });
    }

    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};