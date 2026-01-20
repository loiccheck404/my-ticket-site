"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const matchRoutes_1 = __importDefault(require("./routes/matchRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const userOrdersRoute_1 = __importDefault(require("./routes/userOrdersRoute"));
const ticketRoutes_1 = __importDefault(require("./routes/ticketRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const emailRoutes_1 = __importDefault(require("./routes/emailRoutes"));
// Load environment variables
dotenv_1.default.config();
// Initialize Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)()); // Allow frontend to communicate with backend
app.use(express_1.default.json()); // Parse JSON request bodies
// Test route - to verify server is working
app.get("/", (req, res) => {
    res.json({
        message: "Ticket Booking API is running!",
        status: "success",
        version: "1.0.0",
        endpoints: {
            health: "/api/health",
            matches: "/api/matches",
            auth: "/api/auth",
        },
    });
});
// Health check route
app.get("/api/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
    });
});
// API Routes
app.use("/api/matches", matchRoutes_1.default);
app.use("/api/auth", authRoutes_1.default);
app.use("/api/matches", bookingRoutes_1.default);
app.use("/api/bookings", bookingRoutes_1.default);
app.use("/api/payment", paymentRoutes_1.default);
app.use("/api/orders", userOrdersRoute_1.default);
app.use("/api/tickets", ticketRoutes_1.default);
app.use("/api/admin", adminRoutes_1.default);
app.use("/api/payment", emailRoutes_1.default);
// 404 handler - for routes that don't exist
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});
// Error handling middleware (must be last)
app.use(errorHandler_1.errorHandler);
// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/`);
});
