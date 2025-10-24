import { Router } from "express";
import { register, login } from "@controllers/authController";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.post("/logout", (req, res) => {
  res.json({ message: "Logout endpoint 🚧" });
});

export default router;