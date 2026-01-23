import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { exec } from "child_process";
import { promisify } from "util";
import matchRoutes from "./routes/matchRoutes";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import userOrdersRoutes from "./routes/userOrdersRoute";
import ticketRoutes from "./routes/ticketRoutes";
import adminRoutes from "./routes/adminRoutes";
import emailRoutes from "./routes/emailRoutes";

// Load environment variables
dotenv.config();

// Initialize Prisma Client
const prisma = new PrismaClient();
const execAsync = promisify(exec);

// Auto-seed function
async function autoSeed() {
  try {
    const matchCount = await prisma.match.count();

    if (matchCount === 0) {
      console.log("🌱 Database is empty, running seed...");

      // Run the seed command
      const { stdout, stderr } = await execAsync("npm run seed");

      if (stderr && !stderr.includes("npm warn")) {
        console.error("❌ Seed error:", stderr);
      }

      if (stdout) {
        console.log("✅ Seed output:", stdout);
      }

      const newCount = await prisma.match.count();
      console.log(`✅ Seed completed! Database now has ${newCount} matches`);
    } else {
      console.log(`✅ Database already has ${matchCount} matches`);
    }
  } catch (error) {
    console.error("❌ Auto-seed failed:", error);
    // Don't crash the server if seeding fails
  }
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow frontend to communicate with backend
app.use(express.json()); // Parse JSON request bodies

// Test route - to verify server is working
app.get("/", (req: Request, res: Response) => {
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
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/matches", matchRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/matches", bookingRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/payment", paymentRoutes);

app.use("/api/orders", userOrdersRoutes);

app.use("/api/tickets", ticketRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/payment", emailRoutes);

// 404 handler - for routes that don't exist
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);

  // Run auto-seed after server starts
  autoSeed();
});
