import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🏆 Adding World Cup matches...\n");

  const matches = [
    {
      title: "FIFA World Cup 2026 - Final",
      description: "The ultimate showdown for football glory",
      date: new Date("2026-07-19T18:00:00"),
      venue: "MetLife Stadium, New York",
      imageUrl: "/images/wc-final.jpg",
      category: "Final",
    },
    {
      title: "FIFA World Cup 2026 - Semi Final 1",
      description: "First semi-final match",
      date: new Date("2026-07-14T18:00:00"),
      venue: "AT&T Stadium, Dallas",
      imageUrl: "/images/wc-semi1.jpg",
      category: "Semi-Final",
    },
    {
      title: "FIFA World Cup 2026 - Semi Final 2",
      description: "Second semi-final match",
      date: new Date("2026-07-15T18:00:00"),
      venue: "Mercedes-Benz Stadium, Atlanta",
      imageUrl: "/images/wc-semi2.jpg",
      category: "Semi-Final",
    },
    {
      title: "FIFA World Cup 2026 - Quarter Final",
      description: "Exciting quarter-final action",
      date: new Date("2026-07-09T18:00:00"),
      venue: "SoFi Stadium, Los Angeles",
      imageUrl: "/images/wc-quarter.jpg",
      category: "Quarter-Final",
    },
  ];

  for (const match of matches) {
    await prisma.match.create({ data: match });
    console.log(`✅ Added: ${match.title}`);
  }

  console.log("\n🎉 All World Cup matches added!\n");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
