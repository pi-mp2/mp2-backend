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

    // Validar fortaleza de la contraseña
    if (!isStrongPassword(password)) {
      return errorResponse(
        res,
        400,
        "Password too weak. Must include upper/lowercase, number, and symbol (min 8 chars)"
      );
    }

    // Verificar si el correo ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, "Email is already registered");
    }

    // Hashear contraseña y respuesta secreta
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

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, 400, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorResponse(res, 401, "Invalid credentials");

    const token = jwt.sign(
      { id: user._id, email: user.email, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
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

// POST /api/auth/logout
export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
    if (token) {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      await User.findByIdAndUpdate(decoded.id, { $inc: { tokenVersion: 1 } });
    }

    res.clearCookie("token", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return successResponse(res, "✅ Logged out successfully");
  } catch (error: any) {
    return errorResponse(res, 500, "Server error", error.message);
  }
};