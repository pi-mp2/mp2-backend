import { Router, Response } from "express";
import { register, login, logout } from "@controllers/authController";
import { AuthRequest, verifyToken } from "@middleware/auth";

const router = Router();

// Registro e inicio de sesión
router.post("/register", register);
router.post("/login", login);

// Cierre de sesión (requiere estar autenticado)
router.post("/logout", verifyToken, logout);

// Nueva ruta para verificar sesión
router.get("/verify", verifyToken, (req: AuthRequest, res: Response) => {
  res.status(200).json({
    message: "Usuario autenticado",
    user: req.user, // { id, email }
  });
});

export default router;