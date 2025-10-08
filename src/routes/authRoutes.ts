import { Router } from "express";
import { register, login, requestPasswordReset, resetPassword } from "@controllers/authController";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.post("/logout", (req, res) => {
  res.json({ message: "Logout endpoint 🚧" });
});

router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

export default router;