"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const router = (0, express_1.Router)();
// GET /api/matches/:matchId/tickets - Get ticket types for a match
router.get("/:matchId/tickets", async (req, res) => {
    try {
        const { matchId } = req.params;
        // Get all ticket types for this match
        const tickets = await database_1.default.ticket.findMany({
            where: { matchId },
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
    }
    catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching tickets",
        });
    }
});
// GET /api/matches/:matchId/seats - Get available seats for a match
router.get("/:matchId/seats", async (req, res) => {
    try {
        const { matchId } = req.params;
        const { ticketType } = req.query; // Optional filter by VIP or Regular
        // Build query
        const whereClause = {
            matchId,
            isBooked: false, // Only available seats
        };
        // Filter by ticket type if provided
        if (ticketType) {
            whereClause.section = ticketType;
        }
        // Get available seats
        const seats = await database_1.default.seat.findMany({
            where: whereClause,
            orderBy: [{ row: "asc" }, { seatNumber: "asc" }],
            include: {
                ticket: true, // Include price info
            },
        });
        res.json({
            success: true,
            count: seats.length,
            data: seats,
        });
    }
    catch (error) {
        console.error("Error fetching seats:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching seats",
        });
    }
});
// POST /api/bookings - Book seats
router.post("/", async (req, res) => {
    try {
        const { userId, seatIds } = req.body;
        // Validate input
        if (!userId || !seatIds || seatIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "User ID and seat IDs are required",
            });
        }
        // Check if all seats are available
        const seats = await database_1.default.seat.findMany({
            where: {
                id: { in: seatIds },
            },
            include: {
                ticket: true,
            },
        });
        // Check if any seat is already booked
        const bookedSeat = seats.find((seat) => seat.isBooked);
        if (bookedSeat) {
            return res.status(400).json({
                success: false,
                message: `Seat ${bookedSeat.seatNumber} is already booked`,
            });
        }
        // Calculate total amount
        const totalAmount = seats.reduce((sum, seat) => sum + seat.ticket.price, 0);
        // Create order
        const order = await database_1.default.order.create({
            data: {
                userId,
                totalAmount,
                status: "pending",
                paymentMethod: "crypto",
            },
        });
        // Create order items and mark seats as booked
        for (const seat of seats) {
            // Create order item
            const orderItem = await database_1.default.orderItem.create({
                data: {
                    orderId: order.id,
                    ticketId: seat.ticketId,
                    quantity: 1,
                    price: seat.ticket.price,
                },
            });
            // Mark seat as booked and link to order item
            await database_1.default.seat.update({
                where: { id: seat.id },
                data: {
                    isBooked: true,
                    orderItemId: orderItem.id,
                },
            });
            // Update ticket available count
            await database_1.default.ticket.update({
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
    }
    catch (error) {
        console.error("Error booking seats:", error);
        res.status(500).json({
            success: false,
            message: "Error booking seats",
        });
    }
});
exports.default = router;
