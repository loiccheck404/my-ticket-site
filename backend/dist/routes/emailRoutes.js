"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const emailService_1 = require("../services/emailService");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const emailService = new emailService_1.EmailService();
/**
 * POST /api/payment/send-confirmation/:orderId
 * Send order confirmation email
 */
router.post("/send-confirmation/:orderId", async (req, res) => {
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
                                match: {
                                    select: {
                                        title: true,
                                    },
                                },
                            },
                        },
                        seat: {
                            select: {
                                seatNumber: true,
                                row: true,
                                section: true,
                            },
                        },
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
        // Only send email for confirmed orders
        if (order.status !== "CONFIRMED" && order.status !== "COMPLETED") {
            return res.status(400).json({
                success: false,
                error: "Order is not confirmed yet",
            });
        }
        // Prepare email data
        const emailData = {
            userEmail: order.user.email,
            userName: `${order.user.firstName} ${order.user.lastName}`,
            orderId: order.id,
            totalAmount: order.totalAmount,
            tickets: order.orderItems.map((item) => ({
                matchTitle: item.ticket.match.title,
                ticketType: item.ticket.type,
                seatNumber: item.seat?.seatNumber || "N/A",
                row: item.seat?.row || "N/A",
                section: item.seat?.section || "N/A",
                price: item.price,
            })),
            paymentMethod: order.paymentMethod,
        };
        // Send email
        const emailSent = await emailService.sendOrderConfirmation(emailData);
        if (emailSent) {
            res.json({
                success: true,
                message: "Confirmation email sent successfully",
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: "Failed to send email",
            });
        }
    }
    catch (error) {
        console.error("Error sending confirmation email:", error);
        res.status(500).json({
            success: false,
            error: "Failed to send confirmation email",
        });
    }
});
/**
 * GET /api/payment/test-email
 * Test email configuration
 */
router.get("/test-email", async (req, res) => {
    try {
        const isConnected = await emailService.testConnection();
        if (isConnected) {
            res.json({
                success: true,
                message: "Email server is configured correctly",
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: "Email server connection failed",
            });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: "Email test failed",
        });
    }
});
exports.default = router;
