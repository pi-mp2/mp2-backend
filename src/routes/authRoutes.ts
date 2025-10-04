import { Router } from "express";
import { register } from "@controllers/authController";

const router = Router();

router.post("/register", register);

// dejamos login y logout como placeholder por ahora
router.post("/login", (req, res) => {
  res.json({ message: "Login endpoint 🚧" });
});

router.post("/logout", (req, res) => {
  res.json({ message: "Logout endpoint 🚧" });
});

export default router;
