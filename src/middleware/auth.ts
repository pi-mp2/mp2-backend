import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "@models/user";
import { Types } from "mongoose"

export interface AuthRequest extends Request {
  user?: { id: string, email: string };
}

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;

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
      return res.status(401).json({ message: "User not found" });
    }

    // Verificar si el token es válido comparando versiones
    if (decoded.tokenVersion !== user.tokenVersion) {
      res.clearCookie("token", {
        httpOnly: true,
        sameSite: "none",
        secure: process.env.NODE_ENV === "production",
        path: "/", // importante: debe coincidir con el usado en res.cookie()
      });
      return res.status(401).json({ message: "Session expired, please log in again" });
    }

    req.user = { id: (user._id as Types.ObjectId).toString(), email: user.email };
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};