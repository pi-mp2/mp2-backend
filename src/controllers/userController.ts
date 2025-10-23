import { Request, Response } from "express";
import { User } from "@models/user"; // usando alias y named export
import bcrypt from "bcrypt";
import { AuthRequest } from "@middleware/auth"; 
import { UserActivity } from "@models/userActivity";

const isStrongPassword = (password: string) => 
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);

// Create User
export const createUser = async (req: Request, res: Response) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: "❌ Error creating user", error });
  }
};

// Get all users
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "❌ Error fetching users", error });
  }
};

// Get single user
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "❌ Error fetching user", error });
  }
};

// Update user
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const allowedUpdates = ["firstName", "lastName", "age", "email"];
    const updates: Record<string, any> = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // Evita duplicados en email
    if (updates.email) {
      const existing = await User.findOne({ email: updates.email, _id: { $ne: userId } });
      if (existing) return res.status(400).json({ message: "Email already in use" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    await UserActivity.create({
      user: userId,
      action: "Updated profile",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json({
      message: "✅ Profile updated successfully",
      user: updatedUser,
      updatedFields: Object.keys(updates),
    });
  } catch (error: any) {
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
};

// Delete user
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await UserActivity.create({
      user: userId,
      action: "Deleted account",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json({ message: "✅ Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "❌ Server error", error });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both passwords are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    if (!isStrongPassword(newPassword))
      return res.status(400).json({
        message: "Weak password: must include upper/lowercase, number, and symbol (min 8 chars)",
      });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await UserActivity.create({
      user: userId,
      action: "Changed password",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json({ message: "✅ Password updated successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Error changing password", error: error.message });
  }
};

export const getActivityHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const activities = await UserActivity.find({ user: userId }).sort({ createdAt: -1 }).limit(20);
    res.json({ total: activities.length, activities });
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching history", error: error.message });
  }
};