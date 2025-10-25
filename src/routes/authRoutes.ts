import { Router, Response } from "express";
import { register, login, logout } from "@controllers/authController";
import { AuthRequest, verifyToken } from "@middleware/auth";

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
// Registro e inicio de sesión
router.post("/register", register);

/**
 * POST /api/auth/login
 * Authenticates an existing user and issues a JWT token.
 * 
 * @route POST /login
 * @access Public
 */
router.post("/login", login);

// Cierre de sesión (requiere estar autenticado)
router.post("/logout", verifyToken, logout);

// Nueva ruta para verificar sesión
router.get("/verify", verifyToken, (req: AuthRequest, res: Response) => {
  res.status(200).json({
    message: "Usuario autenticado",
    user: req.user, // { id, email }
  });
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
