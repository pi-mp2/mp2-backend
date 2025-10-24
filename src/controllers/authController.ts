/**
 * @fileoverview Authentication controller.
 * Handles user registration, login, and logout using JWT and secure password hashing.
 */

import { Request, Response } from "express";
import { User } from "@models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { successResponse, errorResponse } from "@utils/responseHandler";

/**
 * Validates password strength to ensure minimum security requirements.
 *
 * @param {string} password - Password string to validate.
 * @returns {boolean} True if the password meets all strength requirements.
 *
 * @example
 * isStrongPassword("Abc@1234") // true
 */
const isStrongPassword = (password: string) =>
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);

/**
 * Registers a new user.
 * 
 * Validates required fields, checks password strength, ensures email uniqueness,
 * hashes the password and security answer, then saves the new user in MongoDB.
 * 
 * @async
 * @function register
 * @param {Request} req - Express request containing user data in body.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} A JSON response with user details or error.
 * 
 * @example
 * POST /api/auth/register
 * {
 *   "firstName": "Jane",
 *   "lastName": "Doe",
 *   "age": 25,
 *   "email": "jane@example.com",
 *   "password": "Strong@123",
 *   "securityQuestion": "Your favorite movie?",
 *   "securityAnswer": "Inception"
 * }
 */
export async function register(req: Request, res: Response) {
  try {
    const 
    { firstName, 
      lastName, 
      age, 
      email, 
      password,
      securityQuestion,
      securityAnswer,
    } = req.body;

    if (
      !firstName || 
      !lastName || 
      !age || 
      !email || 
      !password ||
      !securityQuestion ||
      !securityAnswer
    ) {
      return errorResponse(res, 400, "All fields are required");
    }

    // Validate password strength
    if (!isStrongPassword(password)) {
      return errorResponse(
        res,
        400,
        "Password too weak. Must include upper/lowercase, number, and symbol (min 8 chars)"
      );
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, "Email is already registered");
    }

    // Hash password and security answer
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedAnswer = await bcrypt.hash(securityAnswer, 10);

    const newUser = new User({
      firstName,
      lastName,
      age,
      email,
      password: hashedPassword,
      securityQuestion,
      securityAnswer: hashedAnswer,
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
        securityQuestion: newUser.securityQuestion,
      },
      201
    );
  } catch (error: any) {
    console.error(error);
    return errorResponse(res, 500, "Server error", error.message);
  }
}

/**
 * Logs in a user.
 * 
 * Authenticates the user by verifying credentials, comparing password hashes,
 * and issuing a signed JWT token stored as an HTTP-only cookie.
 * 
 * @async
 * @function login
 * @param {Request} req - Express request containing email and password.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} A JSON response with JWT token and user info.
 * 
 * @example
 * POST /api/auth/login
 * {
 *   "email": "jane@example.com",
 *   "password": "Strong@123"
 * }
 */
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
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return successResponse(res, "✅ Login successful", {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token,
    });
  } catch (error: any) {
    return errorResponse(res, 500, "Server error", error.message);
  }
};

/**
 * Logs out the user by clearing the authentication cookie.
 * 
 * @async
 * @function logout
 * @param {Request} _req - Express request object (unused).
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} Confirmation message.
 * 
 * @example
 * POST /api/auth/logout
 * // -> { "message": "✅ Logged out successfully" }
 */
export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("token");
  return successResponse(res, "✅ Logged out successfully");
};
