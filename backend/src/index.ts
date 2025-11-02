import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import console = require("console");

//Load environment variables
dotenv.config();

//Inititalize Express app
const app = express();
const PORT = process.env.PORT || 5000;

//Middleware
app.use(cors()); //Allow frontend to communicate with backend
app.use(express.json()); //Parse JSON request bodies

//Test route - to verify server is working
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Ticket Booking API is running!",
    status: "success",
  });
});

//Health check route
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

//start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
