"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const router = (0, express_1.Router)();
// GET /api/matches - Get all matches
router.get("/", async (req, res) => {
    try {
        const matches = await database_1.default.match.findMany({
            orderBy: {
                date: "asc", // Sort by date, earliest first
            },
        });
        res.json({
            success: true,
            count: matches.length,
            data: matches,
        });
    }
    catch (error) {
        console.error("Error fetching matches:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching matches",
        });
    }
});
// GET /api/matches/:id - Get single match by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const match = await database_1.default.match.findUnique({
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
    }
    catch (error) {
        console.error("Error fetching match:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching match",
        });
    }
});
// POST /api/matches - Create a new match
router.post("/", async (req, res) => {
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
        const match = await database_1.default.match.create({
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
    }
    catch (error) {
        console.error("Error creating match:", error);
        res.status(500).json({
            success: false,
            message: "Error creating match",
        });
    }
});
exports.default = router;
