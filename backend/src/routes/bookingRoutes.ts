import { Router, Request, Response } from "express";
import prisma from "../config/database";

const router = Router();

// GET /api/matches/:matchId/tickets - Get ticket types for a match
router.get("/:matchId/tickets", async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;

    const tickets = await prisma.ticket.findMany({
      where: { matchId },
      orderBy: { category: 'asc' }
    });

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No tickets found for this match",
      });
    }

    res.json({
      success: true,
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

// GET /api/matches/:matchId/seats - Get available seats for a match
router.get("/:matchId/seats", async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    const { ticketType } = req.query;

    // Build query
    const whereClause: any = {
      matchId,
      isBooked: false,
    };

    // Filter by ticket type
    if (ticketType) {
      const ticket = await prisma.ticket.findFirst({
        where: {
          matchId,
          type: ticketType as string
        }
      });

      if (ticket) {
        whereClause.ticketId = ticket.id;
      }
    }

    const seats = await prisma.seat.findMany({
      where: whereClause,
      orderBy: [{ section: "asc" }, { row: "asc" }, { seatNumber: "asc" }],
      include: {
        ticket: {
          select: {
            price: true,
            category: true,
            color: true
          }
        },
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

// POST /api/bookings - Book seats
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, seatIds } = req.body;

    if (!userId || !seatIds || seatIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User ID and seat IDs are required",
      });
    }

    const seats = await prisma.seat.findMany({
      where: {
        id: { in: seatIds },
      },
      include: {
        ticket: true,
      },
    });

    const bookedSeat = seats.find((seat) => seat.isBooked);
    if (bookedSeat) {
      return res.status(400).json({
        success: false,
        message: `Seat ${bookedSeat.seatNumber} is already booked`,
      });
    }

    const totalAmount = seats.reduce((sum, seat) => sum + seat.ticket.price, 0);

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        status: "pending",
        paymentMethod: "crypto",
      },
    });

    for (const seat of seats) {
      const orderItem = await prisma.orderItem.create({
        data: {
          orderId: order.id,
          ticketId: seat.ticketId,
          quantity: 1,
          price: seat.ticket.price,
        },
      });

      await prisma.seat.update({
        where: { id: seat.id },
        data: {
          isBooked: true,
          orderItemId: orderItem.id,
        },
      });

      await prisma.ticket.update({
        where: { id: seat.ticketId },
        data: {
          availableCount: { decrement: 1 },
        },
      });
    }

    res.json({
      success: true,
      message: "Seats booked successfully!",
      data: {
        orderId: order.id,
        totalAmount,
        seatsBooked: seats.length,
      },
    });
  } catch (error) {
    console.error("Error booking seats:", error);
    res.status(500).json({
      success: false,
      message: "Error booking seats",
    });
  }
});

export default router;
