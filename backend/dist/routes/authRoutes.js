"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
//POST /api/auth/signup - Register new user
router.post("/signup", authController_1.signup);
//POST /api/auth/login - Login existing user
router.post("/login", authController_1.login);
// GET /api/auth/me - Get logged-in user info (PROTECTED)
router.get("/me", authMiddleware_1.authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: "You are logged in!",
        user: req.user,
    });
});
exports.default = router;
