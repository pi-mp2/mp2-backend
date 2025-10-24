import { Request, Response } from "express";
import { User } from "@models/user"; // usando alias y named export
import bcrypt from "bcrypt";
import { AuthRequest } from "@middleware/auth"; 
import { UserActivity } from "@models/userActivity";

/**
 * Checks if a password meets the required security rules.
 * Must contain uppercase, lowercase, number, special character, and be at least 8 chars long.
 * 
 * @param {string} password - The password to validate.
 * @returns {boolean} Whether the password meets the strength criteria.
 */
const isStrongPassword = (password: string) => 
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);

/**
 * Creates a new user.
 * 
 * @async
 * @function createUser
 * @param {Request} req - Express request object containing user data.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} JSON with the created user or error message.
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: "❌ Error creating user", error });
  }
};

/**
 * Retrieves all users from the database.
 * 
 * @async
 * @function getUsers
 * @param {Request} _req - Express request (not used).
 * @param {Response} res - Express response.
 * @returns {Promise<void>} JSON list of users or error.
 */
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "❌ Error fetching users", error });
  }
};

/**
 * Gets the profile of the currently authenticated user.
 * 
 * @async
 * @function getUserProfile
 * @param {AuthRequest} req - Request containing authenticated user.
 * @param {Response} res - Response object.
 * @returns {Promise<void>} JSON with user data or error.
 */
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).select("-password -securityAnswer");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "✅ User fetched successfully",
      user,
    });
  } catch (error: any) {
    res.status(500).json({ message: "❌ Error fetching user", error: error.message });
  }
};

/**
 * Updates the profile of the authenticated user.
 * 
 * @async
 * @function updateUser
 * @param {AuthRequest} req - Authenticated request with possible updates.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} JSON with updated user or error message.
 */
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const allowedUpdates = ["firstName", "lastName", "age", "email"];
    const updates: Record<string, any> = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // Prevent duplicate email
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

/**
 * Deletes the authenticated user's account and logs the event.
 * 
 * @async
 * @function deleteUser
 * @param {AuthRequest} req - Request containing user authentication.
 * @param {Response} res - Express response.
 * @returns {Promise<void>} JSON confirmation or error.
 */
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

/**
 * Changes the authenticated user's password after verifying the current one.
 * 
 * @async
 * @function changePassword
 * @param {AuthRequest} req - Authenticated request containing passwords.
 * @param {Response} res - Express response.
 * @returns {Promise<void>} JSON confirmation or error.
 */
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

    user.password = newPassword;
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

/**
 * Returns the recent activity history of the authenticated user.
 * 
 * @async
 * @function getActivityHistory
 * @param {AuthRequest} req - Authenticated request.
 * @param {Response} res - Express response.
 * @returns {Promise<void>} JSON with user activity logs.
 */
export const getActivityHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const activities = await UserActivity.find({ user: userId }).sort({ createdAt: -1 }).limit(20);
    res.json({ total: activities.length, activities });
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching history", error: error.message });
  }
};

/**
 * Returns the security question for a given user email.
 * 
 * @async
 * @function verifySecurityQuestion
 * @param {Request} req - Request containing user email.
 * @param {Response} res - Express response.
 * @returns {Promise<void>} JSON with security question or null.
 */
export const verifySecurityQuestion = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(200).json({ securityQuestion: null });
    res.json({ securityQuestion: user.securityQuestion });
  } catch (err) {
    console.error("Error en verifySecurityQuestion:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Validates the user’s security answer and resets the password.
 * 
 * @async
 * @function resetPasswordWithAnswer
 * @param {Request} req - Request containing email, securityAnswer, and newPassword.
 * @param {Response} res - Express response.
 * @returns {Promise<void>} JSON confirmation or error.
 */
export const resetPasswordWithAnswer = async (req: Request, res: Response) => {
  const { email, securityAnswer, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const isMatch = await user.compareSecurityAnswer(securityAnswer);
    if (!isMatch)
      return res.status(400).json({ message: "Respuesta incorrecta" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Contraseña restablecida correctamente ✅" });
  } catch (err) {
    console.error("Error en resetPasswordWithAnswer:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
