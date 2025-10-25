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

router.post("/", createUser);
router.get("/", getUsers);

// Rutas protegidas por token
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, updateUser);
router.delete("/profile", verifyToken, deleteUser);

// Cambiar contraseña (usuario logueado)
router.put("/change-password", verifyToken, changePassword);

// Historial de actividad (requiere token)
router.get("/activity", verifyToken, getActivityHistory);

// Recuperación de contraseña (sin login)
router.post("/forgot-password", verifySecurityQuestion); // devuelve la pregunta secreta
router.post("/reset-password-secret", resetPasswordWithAnswer); // valida respuesta y cambia contraseña



export default router;