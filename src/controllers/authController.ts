import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "@models/user";

// POST /api/auth/register
export async function register(req: Request, res: Response) {
  try {
    const { firstName, lastName, age, email, password } = req.body;

    // Validaciones básicas
    if (!firstName || !lastName || !age || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Revisar si ya existe usuario
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
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

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}