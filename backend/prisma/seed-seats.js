const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🎫 Starting to seed seats...\n");

  const matches = await prisma.match.findMany();

  if (matches.length === 0) {
    console.log("❌ No matches found! Please create matches first.");
    return;
  }

  console.log(`Found ${matches.length} matches. Adding seats...\n`);

  for (const match of matches) {
    console.log(`🏟️  Processing: ${match.title}`);

    const vipTicket = await prisma.ticket.create({
      data: {
        matchId: match.id,
        type: "VIP",
        price: 200,
        availableCount: 30,
        totalCount: 30,
      },
    });

    const regularTicket = await prisma.ticket.create({
      data: {
        matchId: match.id,
        type: "Regular",
        price: 100,
        availableCount: 30,
        totalCount: 30,
      },
    });

    const vipRows = ["A", "B", "C"];
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
      }
    }

    const regularRows = ["D", "E", "F"];
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
      }
    }

    console.log(`   ✅ Added 30 VIP seats (Rows A-C)`);
    console.log(`   ✅ Added 30 Regular seats (Rows D-F)\n`);
  }

  console.log("🎉 Seeding complete! All matches now have seats.\n");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
