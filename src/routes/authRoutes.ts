import { Router } from "express";
import { register, login } from "@controllers/authController";

const router = Router();

/**
 * @file authRoutes.ts
 * @description Defines authentication-related API routes (register, login, logout).
 * 
 * Routes in this file are used to handle user authentication actions such as
 * creating a new account, logging in, and logging out.
 */

/**
 * POST /api/auth/register
 * Registers a new user account.
 * 
 * @route POST /register
 * @access Public
 */
router.post("/register", register);

/**
 * POST /api/auth/login
 * Authenticates an existing user and issues a JWT token.
 * 
 * @route POST /login
 * @access Public
 */
router.post("/login", login);

/**
 * POST /api/auth/logout
 * Placeholder endpoint for user logout (to be expanded if token invalidation is needed).
 * 
 * @route POST /logout
 * @access Public
 */
router.post("/logout", (req, res) => {
  res.json({ message: "Logout endpoint 🚧" });
});

export default router;
