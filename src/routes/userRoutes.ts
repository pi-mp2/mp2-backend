import { Router } from "express";
import { 
    createUser, 
    getUsers, 
    getUserProfile, 
    updateUser, 
    deleteUser,
    changePassword,
    getActivityHistory,
    verifySecurityQuestion,
    resetPasswordWithAnswer,
} from "@controllers/userController";
import { verifyToken } from "@middleware/auth";

const router = Router();

/**
 * @file userRoutes.ts
 * @description Defines all routes related to user management, including registration,
 * authentication, password recovery, and profile management.
 * 
 * Routes are organized into public and protected sections.
 * Protected routes require a valid JWT token.
 */

/**
 * @route POST /api/users
 * @description Creates a new user in the system.
 * @access Public
 */
router.post("/", createUser);

/**
 * @route GET /api/users
 * @description Retrieves all users from the database (for administrative use).
 * @access Public or Admin (depending on implementation)
 */
router.get("/", getUsers);

/**
 * @route GET /api/users/profile
 * @description Retrieves the authenticated user's profile data.
 * @access Private (JWT required)
 */
router.get("/profile", verifyToken, getUserProfile);

/**
 * @route PUT /api/users/profile
 * @description Updates the authenticated user's profile information.
 * @access Private (JWT required)
 */
router.put("/profile", verifyToken, updateUser);

/**
 * @route DELETE /api/users/profile
 * @description Deletes the authenticated user's account.
 * @access Private (JWT required)
 */
router.delete("/profile", verifyToken, deleteUser);

/**
 * @route POST /api/users/forgot-password
 * @description Returns the security question for a given email to initiate password recovery.
 * @access Public
 */
router.post("/forgot-password", verifySecurityQuestion);

/**
 * @route POST /api/users/reset-password-secret
 * @description Validates the user's answer to the security question and resets their password.
 * @access Public
 */
router.post("/reset-password-secret", resetPasswordWithAnswer);

/**
 * @route PUT /api/users/change-password
 * @description Allows the authenticated user to change their password.
 * @access Private (JWT required)
 */
router.put("/change-password", verifyToken, changePassword);

/**
 * @route GET /api/users/activity
 * @description Retrieves the activity history of the authenticated user.
 * @access Private (JWT required)
 */
router.get("/activity", verifyToken, getActivityHistory);
// Cambiar contraseña (usuario logueado)
router.put("/change-password", verifyToken, changePassword);

// Historial de actividad (requiere token)
router.get("/activity", verifyToken, getActivityHistory);

// Recuperación de contraseña (sin login)
router.post("/forgot-password", verifySecurityQuestion); // devuelve la pregunta secreta
router.post("/reset-password-secret", resetPasswordWithAnswer); // valida respuesta y cambia contraseña



export default router;
