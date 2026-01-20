"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const pdfTicketGenerator_1 = require("../services/pdfTicketGenerator");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const pdfGenerator = new pdfTicketGenerator_1.PDFTicketGenerator();
/**
 * GET /api/tickets/download/:orderId
 * Download PDF ticket for an order
 */
router.get("/download/:orderId", async (req, res) => {
    try {
        const { orderId } = req.params;
        // Fetch order with all details
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                orderItems: {
                    include: {
                        ticket: {
                            include: {
                                match: true,
                            },
                        },
                        seat: true,
                    },
                },
            },
        });
        if (!order) {
            return res.status(404).json({
                success: false,
                error: "Order not found",
            });
        }
        // Get the first ticket (for now, we'll generate one PDF per order)
        // You can modify this to generate multiple PDFs for multiple tickets
        const firstItem = order.orderItems[0];
        if (!firstItem) {
            return res.status(404).json({
                success: false,
                error: "No tickets found in order",
            });
        }
        // Check if seat exists
        if (!firstItem.seat) {
            return res.status(404).json({
                success: false,
                error: "Seat information not found",
            });
        }
        // Prepare ticket data
        const ticketData = {
            orderId: order.id,
            matchTitle: firstItem.ticket.match.title,
            matchDate: firstItem.ticket.match.date.toISOString(),
            venue: firstItem.ticket.match.venue,
            seatNumber: firstItem.seat.seatNumber,
            row: firstItem.seat.row,
            section: firstItem.seat.section,
            ticketType: firstItem.ticket.type,
            price: firstItem.price,
            userName: `${order.user.firstName} ${order.user.lastName}`,
            status: order.status,
        };
        // Generate PDF
        const pdfDoc = await pdfGenerator.generateTicket(ticketData);
        // Set response headers
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="ticket-${orderId}.pdf"`);
        // Pipe the PDF to the response
        pdfDoc.pipe(res);
        pdfDoc.end();
    }
    catch (error) {
        console.error("Error generating PDF ticket:", error);
        res.status(500).json({
            success: false,
            error: "Failed to generate ticket",
        });
    }
});
/**
 * GET /api/tickets/download/:orderId/:ticketIndex
 * Download PDF for a specific ticket in an order (if multiple tickets)
 */
router.get("/download/:orderId/:ticketIndex", async (req, res) => {
    try {
        const { orderId, ticketIndex } = req.params;
        const index = parseInt(ticketIndex);
        // Fetch order with all details
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                orderItems: {
                    include: {
                        ticket: {
                            include: {
                                match: true,
                            },
                        },
                        seat: true,
                    },
                },
            },
        });
        if (!order) {
            return res.status(404).json({
                success: false,
                error: "Order not found",
            });
        }
        const ticketItem = order.orderItems[index];
        if (!ticketItem) {
            return res.status(404).json({
                success: false,
                error: "Ticket not found",
            });
        }
        // Check if seat exists
        if (!ticketItem.seat) {
            return res.status(404).json({
                success: false,
                error: "Seat information not found",
            });
        }
        // Prepare ticket data
        const ticketData = {
            orderId: order.id,
            matchTitle: ticketItem.ticket.match.title,
            matchDate: ticketItem.ticket.match.date.toISOString(),
            venue: ticketItem.ticket.match.venue,
            seatNumber: ticketItem.seat.seatNumber,
            row: ticketItem.seat.row,
            section: ticketItem.seat.section,
            ticketType: ticketItem.ticket.type,
            price: ticketItem.price,
            userName: `${order.user.firstName} ${order.user.lastName}`,
            status: order.status,
        };
        // Generate PDF
        const pdfDoc = await pdfGenerator.generateTicket(ticketData);
        // Set response headers
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="ticket-${orderId}-${index + 1}.pdf"`);
        // Pipe the PDF to the response
        pdfDoc.pipe(res);
        pdfDoc.end();
    }
    catch (error) {
        console.error("Error generating PDF ticket:", error);
        res.status(500).json({
            success: false,
            error: "Failed to generate ticket",
        });
    }
});
exports.default = router;
