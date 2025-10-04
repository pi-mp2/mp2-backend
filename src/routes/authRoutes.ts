import { Router } from "express";
import { register } from "@controllers/authController";
import { login } from "@controllers/authController";
import { requestPasswordReset, resetPassword } from "@controllers/authController";

const router = Router();

router.post("/register", register);

// dejamos login y logout como placeholder por ahora
router.post("/login", login);

router.post("/logout", (req, res) => {
  res.json({ message: "Logout endpoint 🚧" });
});

router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

export default router;
