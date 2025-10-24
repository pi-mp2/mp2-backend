import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: string, email: string };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try{
    const token = req.cookies.token; // formato: Bearer <token>
    
    if (!token){
      return res.status(401).json({ message: "No token, authorization denied" });
    } 
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string };
    req.user = decoded;
    next();
  }catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};