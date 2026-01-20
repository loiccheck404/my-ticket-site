"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
router.get("/stats", async (req, res) => {
    try {
        // Get total orders
        const totalOrders = await prisma.order.count();
        // Get total sales (sum of all order amounts)
        const orders = await prisma.order.findMany({
            select: {
                totalAmount: true,
            },
        });
        const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        // Get total users
        const totalUsers = await prisma.user.count();
        // Get total tickets sold (count of order items)
        const totalTickets = await prisma.orderItem.count();
        // Get orders by status
        const ordersByStatus = await prisma.order.groupBy({
            by: ["status"],
            _count: {
                status: true,
            },
        });
        // Get recent orders (last 5)
        const recentOrders = await prisma.order.findMany({
            take: 5,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            stats: {
                totalSales,
                totalOrders,
                totalUsers,
                totalTickets,
                ordersByStatus,
                recentOrders: recentOrders.map((order) => ({
                    id: order.id,
                    amount: order.totalAmount,
                    status: order.status,
                    userName: `${order.user.firstName} ${order.user.lastName}`,
                    userEmail: order.user.email,
                    createdAt: order.createdAt,
                })),
            },
        });
    }
    catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch statistics",
        });
    }
});
/**
 * GET /api/admin/orders
 * Get all orders with details
 */
router.get("/orders", async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
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
                                        title: true,
                                        date: true,
                                        venue: true,
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
                transaction: {
                    select: {
                        cryptocurrency: true,
                        cryptoAmount: true,
                        status: true,
                        confirmations: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        const formattedOrders = orders.map((order) => ({
            orderId: order.id,
            userName: `${order.user.firstName} ${order.user.lastName}`,
            userEmail: order.user.email,
            totalAmount: order.totalAmount,
            status: order.status,
            paymentMethod: order.paymentMethod,
            createdAt: order.createdAt,
            tickets: order.orderItems.map((item) => ({
                match: item.ticket.match.title,
                ticketType: item.ticket.type,
                seat: item.seat
                    ? `${item.seat.section}-${item.seat.row}-${item.seat.seatNumber}`
                    : "N/A",
                price: item.price,
            })),
            transaction: order.transaction
                ? {
                    cryptocurrency: order.transaction.cryptocurrency,
                    cryptoAmount: order.transaction.cryptoAmount,
                    status: order.transaction.status,
                    confirmations: order.transaction.confirmations,
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
        console.error("Error fetching all orders:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch orders",
        });
    }
});
/**
 * GET /api/admin/users
 * Get all users
 */
router.get("/users", async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                createdAt: true,
                _count: {
                    select: {
                        orders: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        const formattedUsers = users.map((user) => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            orderCount: user._count.orders,
            joinedAt: user.createdAt,
        }));
        res.json({
            success: true,
            count: formattedUsers.length,
            users: formattedUsers,
        });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch users",
        });
    }
});
/**
 * GET /api/admin/matches
 * Get all matches with booking stats
 */
router.get("/matches", async (req, res) => {
    try {
        const matches = await prisma.match.findMany({
            include: {
                tickets: {
                    select: {
                        type: true,
                        price: true,
                        availableCount: true,
                        totalCount: true,
                    },
                },
                _count: {
                    select: {
                        seats: true,
                    },
                },
            },
            orderBy: {
                date: "desc",
            },
        });
        const formattedMatches = matches.map((match) => {
            const totalSeats = match._count.seats;
            const bookedSeats = match.tickets.reduce((sum, ticket) => sum + (ticket.totalCount - ticket.availableCount), 0);
            return {
                id: match.id,
                title: match.title,
                description: match.description,
                date: match.date,
                venue: match.venue,
                category: match.category,
                totalSeats,
                bookedSeats,
                availableSeats: totalSeats - bookedSeats,
                tickets: match.tickets,
            };
        });
        res.json({
            success: true,
            count: formattedMatches.length,
            matches: formattedMatches,
        });
    }
    catch (error) {
        console.error("Error fetching matches:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch matches",
        });
    }
});
exports.default = router;
