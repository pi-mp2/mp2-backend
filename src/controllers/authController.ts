import { Request, Response } from "express";
import { User } from "@models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { successResponse, errorResponse } from "@utils/responseHandler";

const isStrongPassword = (password: string) =>
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);

// POST /api/auth/register
export async function register(req: Request, res: Response) {
  try {
    const { firstName, lastName, age, email, password } = req.body;

    if (!firstName || !lastName || !age || !email || !password) {
      return errorResponse(res, 400, "All fields are required");
    }

    if (!isStrongPassword(password)) {
      return errorResponse(
        res,
        400,
        "Password too weak. Must include upper/lowercase, number, and symbol (min 8 chars)"
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, "Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      age,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return successResponse(
      res,
      "✅ User registered successfully",
      {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
      201
    );
  } catch (error: any) {
    console.error(error);
    return errorResponse(res, 500, "Server error", error.message);
  }
}

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, 400, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorResponse(res, 401, "Invalid credentials");

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(res, "✅ Login successful", {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  } catch (error: any) {
    return errorResponse(res, 500, "Server error", error.message);
  }
};

// POST /api/auth/logout
export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("token");
  return successResponse(res, "✅ Logged out successfully");
};