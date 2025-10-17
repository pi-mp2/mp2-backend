import { Request, Response } from "express";
import { User } from "@models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { successResponse, errorResponse } from "@utils/responseHandler";

// POST /api/auth/register
export async function register(req: Request, res: Response) {
  try {
    const { firstName, lastName, age, email, password } = req.body;

    // Validaciones básicas
    if (!firstName || !lastName || !age || !email || !password) {
      return errorResponse(res, 400, "All fields are required");
    }

    if (password.length < 6) {
      return errorResponse(res, 400, "Password must be at least 6 characters long");
    }

    // Revisar si ya existe usuario
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, "Email is already registered");
    }

    // Hash de contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear usuario
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

    // Validar campos
    if (!email || !password) {
      return errorResponse(res, 400, "Email and password are required");
    }

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, 401, "Invalid credentials");

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorResponse(res, 401, "Invalid credentials");

    // Generar JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    // Guardar token en cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return successResponse(res, "✅ Login successful", { token });
  } catch (error: any) {
    console.error(error);
    return errorResponse(res, 500, "Server error", error.message);
  }
};

// Solicitud de reset
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, 404, "User not found");

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    // Transporter básico (para Gmail o SMTP)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `<p>Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>`,
    });

    return successResponse(res, "Password reset email sent");
  } catch (error: any) {
    console.error(error);
    return errorResponse(res, 500, "Server error");
  }
};

// Restablecer contraseña
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const user = await User.findById(decoded.id);
    if (!user) return errorResponse(res, 500, "User not found");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return successResponse(res, "Password successfully reset");
  } catch (error) {
    console.error(error);
    errorResponse(res, 400, "Invalid or expired token");
  }
};