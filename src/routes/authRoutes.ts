import { Router, Request, Response } from "express";

const router = Router();

// Placeholder: Registro
router.post("/register", (req: Request, res: Response) => {
  res.json({ message: "Register endpoint 🚧" });
});

// Placeholder: Login
router.post("/login", (req: Request, res: Response) => {
  res.json({ message: "Login endpoint 🚧" });
});

// Placeholder: Logout
router.post("/logout", (req: Request, res: Response) => {
  res.json({ message: "Logout endpoint 🚧" });
});

export default router;
