import { Router } from "express";
import { 
    createUser, 
    getUsers, 
    getUserById, 
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
router.get("/:id", getUserById);

// Rutas protegidas por token
router.put("/profile", verifyToken, updateUser);
router.delete("/profile", verifyToken, deleteUser);

router.post("/forgot-password", verifySecurityQuestion); // devuelve la pregunta secreta
router.post("/reset-password-secret", resetPasswordWithAnswer); // valida respuesta y cambia contraseña

router.put("/change-password", verifyToken, changePassword);
router.get("/activity", verifyToken, getActivityHistory);

export default router;