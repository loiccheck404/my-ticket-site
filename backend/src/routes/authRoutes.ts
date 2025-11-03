import { Router } from "express";
import { signup, login } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

//POST /api/auth/signup - Register new user
router.post("/signup", signup);

//POST /api/auth/login - Login existing user
router.post("/login", login);

// GET /api/auth/me - Get logged-in user info (PROTECTED)
router.get("/me", authMiddleware, (req: any, res) => {
  res.json({
    success: true,
    message: "You are logged in!",
    user: req.user,
  });
});

export default router;
