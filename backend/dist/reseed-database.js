"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🔄 Re-seeding database after Fedora 43 upgrade...\n");
    console.log("=".repeat(60));
    // Step 1: Create Matches
    console.log("\n📅 Step 1: Creating Matches...\n");
    const matches = [
        {
            title: "Argentina vs Brazil",
            date: new Date("2025-12-15T19:00:00Z"),
            venue: "Maracanã Stadium",
            category: "Single Match",
            imageUrl: "https://via.placeholder.com/400x300",
            description: "Epic South American Rivalry",
        },
        {
            title: "Spain vs Germany",
            date: new Date("2025-12-20T18:00:00Z"),
            venue: "Santiago Bernabéu",
            category: "Single Match",
            imageUrl: "https://via.placeholder.com/400x300",
            description: "European Championship Showdown",
        },
        {
            title: "France vs England",
            date: new Date("2025-12-25T20:00:00Z"),
            venue: "Wembley Stadium",
            category: "Single Match",
            imageUrl: "https://via.placeholder.com/400x300",
            description: "Classic Rivalry Match",
        },
    ];
    const createdMatches = [];
    for (const matchData of matches) {
        const match = await prisma.match.create({
            data: matchData,
        });
        createdMatches.push(match);
        console.log(`✅ Created: ${match.title} at ${match.venue}`);
    }
    console.log(`\n✅ Created ${createdMatches.length} matches!`);
    // Step 2: Create Tickets and Seats for each match
    console.log("\n🎫 Step 2: Creating Tickets and Seats...\n");
    for (const match of createdMatches) {
        console.log(`🏟️  Processing: ${match.title}`);
        // Create VIP Ticket Type
        const vipTicket = await prisma.ticket.create({
            data: {
                matchId: match.id,
                type: "VIP",
                price: 200,
                availableCount: 30,
                totalCount: 30,
            },
        });
        // Create Regular Ticket Type
        const regularTicket = await prisma.ticket.create({
            data: {
                matchId: match.id,
                type: "Regular",
                price: 100,
                availableCount: 30,
                totalCount: 30,
            },
        });
        // Create VIP Seats (Rows A, B, C - 10 seats each)
        const vipRows = ["A", "B", "C"];
        let vipSeatsCreated = 0;
        for (const row of vipRows) {
            for (let seatNum = 1; seatNum <= 10; seatNum++) {
                const seatNumber = `${row}${seatNum}`;
                await prisma.seat.create({
                    data: {
                        matchId: match.id,
                        ticketId: vipTicket.id,
                        seatNumber: seatNumber,
                        row: row,
                        section: "VIP",
                        isBooked: false,
                    },
                });
                vipSeatsCreated++;
            }
        }
        // Create Regular Seats (Rows D, E, F - 10 seats each)
        const regularRows = ["D", "E", "F"];
        let regularSeatsCreated = 0;
        for (const row of regularRows) {
            for (let seatNum = 1; seatNum <= 10; seatNum++) {
                const seatNumber = `${row}${seatNum}`;
                await prisma.seat.create({
                    data: {
                        matchId: match.id,
                        ticketId: regularTicket.id,
                        seatNumber: seatNumber,
                        row: row,
                        section: "Regular",
                        isBooked: false,
                    },
                });
                regularSeatsCreated++;
            }
        }
        console.log(`   ✅ Added ${vipSeatsCreated} VIP seats (Rows A-C, $200 each)`);
        console.log(`   ✅ Added ${regularSeatsCreated} Regular seats (Rows D-F, $100 each)\n`);
    }
    console.log("=".repeat(60));
    console.log("\n🎉 RE-SEEDING COMPLETE!\n");
    console.log("Summary:");
    console.log(`  📅 Matches: ${createdMatches.length}`);
    console.log(`  🎫 Tickets per match: 2 types (VIP & Regular)`);
    console.log(`  🪑 Seats per match: 60 total (30 VIP + 30 Regular)`);
    console.log(`  💰 Total capacity: ${createdMatches.length * 60} seats\n`);
    console.log("Your database is now fully restored! 🚀\n");
}
main()
    .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
