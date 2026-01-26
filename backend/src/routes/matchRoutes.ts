import { Router, Request, Response } from "express";
import prisma from "../config/database";

const router = Router();

// GET /api/matches - Get all matches
router.get("/", async (req: Request, res: Response) => {
  try {
    const matches = await prisma.match.findMany({
      orderBy: {
        date: "asc", // Sort by date, earliest first
      },
    });

    res.json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching matches",
    });
  }
});

// GET /api/matches/:id - Get single match by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        tickets: true, // Include all tickets for this match
      },
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    res.json({
      success: true,
      data: match,
    });
  } catch (error) {
    console.error("Error fetching match:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching match",
    });
  }
});

// GET /api/matches/:id/tickets - Get ticket categories for a match
router.get("/:id/tickets", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // First check if match exists
    const match = await prisma.match.findUnique({
      where: { id },
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    // Get all tickets for this match
    const tickets = await prisma.ticket.findMany({
      where: { matchId: id },
      orderBy: {
        price: "asc", // Order by price
      },
    });

    res.json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tickets",
    });
  }
});

// GET /api/matches/:id/seats - Get available seats for a match
router.get("/:id/seats", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // First check if match exists
    const match = await prisma.match.findUnique({
      where: { id },
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    // Get all seats for this match
    const seats = await prisma.seat.findMany({
      where: { matchId: id },
      orderBy: {
        seatNumber: "asc",
      },
    });

    res.json({
      success: true,
      count: seats.length,
      data: seats,
    });
  } catch (error) {
    console.error("Error fetching seats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching seats",
    });
  }
});

// POST /api/matches - Create a new match
router.post("/", async (req: Request, res: Response) => {
  try {
    const { title, description, date, venue, category, imageUrl } = req.body;

    // Validate required fields
    if (!title || !date || !venue || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, date, venue, imageUrl",
      });
    }

    // Create the match
    const match = await prisma.match.create({
      data: {
        title,
        description: description || "",
        date: new Date(date),
        venue,
        imageUrl,
        category: category || "Single Match",
      },
    });

    res.status(201).json({
      success: true,
      message: "Match created successfully!",
      data: match,
    });
  } catch (error) {
    console.error("Error creating match:", error);
    res.status(500).json({
      success: false,
      message: "Error creating match",
    });
  }
});

export default router;
