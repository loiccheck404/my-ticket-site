const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🎫 Starting to seed seats...\n");

  const matches = await prisma.match.findMany();

  if (matches.length === 0) {
    console.log("❌ No matches found!");
    return;
  }

  console.log(
    `Found ${matches.length} matches. Adding 240 seats per match...\n`,
  );

  for (const match of matches) {
    console.log(`🏟️  Processing: ${match.title}`);

    const cat1 = await prisma.ticket.create({
      data: {
        matchId: match.id,
        type: "Category 1",
        price: 1200,
        availableCount: 60,
        totalCount: 60,
        category: 1,
        color: "purple",
      },
    });

    const cat2 = await prisma.ticket.create({
      data: {
        matchId: match.id,
        type: "Category 2",
        price: 800,
        availableCount: 60,
        totalCount: 60,
        category: 2,
        color: "blue",
      },
    });

    const cat3 = await prisma.ticket.create({
      data: {
        matchId: match.id,
        type: "Category 3",
        price: 500,
        availableCount: 60,
        totalCount: 60,
        category: 3,
        color: "teal",
      },
    });

    const cat4 = await prisma.ticket.create({
      data: {
        matchId: match.id,
        type: "Category 4",
        price: 300,
        availableCount: 60,
        totalCount: 60,
        category: 4,
        color: "gold",
      },
    });

    const rows = ["A", "B", "C", "D", "E", "F"];
    const categories = [
      { ticket: cat1, name: "Category 1", section: "101", prefix: "1" },
      { ticket: cat2, name: "Category 2", section: "201", prefix: "2" },
      { ticket: cat3, name: "Category 3", section: "301", prefix: "3" },
      { ticket: cat4, name: "Category 4", section: "401", prefix: "4" },
    ];

    for (const cat of categories) {
      for (const row of rows) {
        for (let seatNum = 1; seatNum <= 10; seatNum++) {
          // Make seat number unique: prefix + row + seatNum (e.g., "1A1", "2A1")
          const uniqueSeatNumber = `${cat.prefix}${row}${seatNum}`;
          await prisma.seat.create({
            data: {
              matchId: match.id,
              ticketId: cat.ticket.id,
              seatNumber: uniqueSeatNumber,
              row: row,
              section: cat.section,
              isBooked: false,
            },
          });
        }
      }
      console.log(`   ✅ Added 60 ${cat.name} seats`);
    }

    console.log(`   🎉 Total: 240 seats added\n`);
  }

  console.log("🎉 Complete! All 30 matches have 240 seats each!\n");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
