"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
/**
 * GET /api/orders/user/:userId
 * Get all orders for a specific user with full details
 */
router.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        // Get all orders for this user
        const orders = await prisma.order.findMany({
            where: {
                userId: userId, // Keep as string since schema uses String
            },
            include: {
                user: {
                    select: {
                        id: true,
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
                                        id: true,
                                        title: true,
                                        description: true,
                                        date: true,
                                        venue: true,
                                        imageUrl: true,
                                    },
                                },
                            },
                        },
                        seat: {
                            select: {
                                id: true,
                                seatNumber: true,
                                row: true,
                                section: true,
                            },
                        },
                    },
                },
                transaction: true,
            },
            orderBy: {
                createdAt: "desc", // Most recent first
            },
        });
        // Format the response
        const formattedOrders = orders.map((order) => ({
            orderId: order.id,
            status: order.status,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt,
            paymentMethod: order.paymentMethod,
            user: {
                name: `${order.user.firstName} ${order.user.lastName}`,
                email: order.user.email,
            },
            tickets: order.orderItems.map((item) => ({
                ticketType: item.ticket.type,
                price: item.price,
                quantity: item.quantity,
                match: {
                    id: item.ticket.match.id,
                    title: item.ticket.match.title,
                    description: item.ticket.match.description,
                    date: item.ticket.match.date,
                    venue: item.ticket.match.venue,
                    imageUrl: item.ticket.match.imageUrl,
                },
                seat: item.seat
                    ? {
                        seatNumber: item.seat.seatNumber,
                        row: item.seat.row,
                        section: item.seat.section,
                    }
                    : null,
            })),
            transaction: order.transaction
                ? {
                    cryptocurrency: order.transaction.cryptocurrency,
                    cryptoAmount: order.transaction.cryptoAmount,
                    walletAddress: order.transaction.walletAddress,
                    status: order.transaction.status,
                    confirmations: order.transaction.confirmations,
                    expiresAt: order.transaction.expiresAt,
                }
                : null,
        }));
        res.json({
            success: true,
            count: formattedOrders.length,
            orders: formattedOrders,
        });
    }
    catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch orders",
        });
    }
});
exports.default = router;
