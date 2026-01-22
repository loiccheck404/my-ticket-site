import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🏆 Adding 30 World Cup matches...\n");

  const matches = [
    // ===== OPENING MATCHES (3) =====
    {
      title: "Mexico vs South Africa",
      description: "Opening match - Tournament kicks off in Mexico City",
      date: new Date("2026-06-11T13:00:00"),
      venue: "Estadio Azteca, Mexico City",
      imageUrl: "/images/opening-mexico.jpg",
      category: "Opening",
    },
    {
      title: "USA vs Paraguay",
      description: "USA's opening match on home soil",
      date: new Date("2026-06-12T18:00:00"),
      venue: "SoFi Stadium, Los Angeles",
      imageUrl: "/images/opening-usa.jpg",
      category: "Opening",
    },
    {
      title: "Canada vs UEFA Playoff Winner",
      description: "Canada's World Cup opener in Toronto",
      date: new Date("2026-06-12T15:00:00"),
      venue: "BMO Field, Toronto",
      imageUrl: "/images/opening-canada.jpg",
      category: "Opening",
    },

    // ===== GROUP STAGE BLOCKBUSTERS (7) =====
    {
      title: "Brazil vs Morocco",
      description: "Exciting clash between two football powerhouses",
      date: new Date("2026-06-13T18:00:00"),
      venue: "MetLife Stadium, New York",
      imageUrl: "/images/brazil-morocco.jpg",
      category: "Group-Stage",
    },
    {
      title: "Germany vs Curaçao",
      description: "Four-time champions vs World Cup debutants",
      date: new Date("2026-06-14T12:00:00"),
      venue: "NRG Stadium, Houston",
      imageUrl: "/images/germany-curacao.jpg",
      category: "Group-Stage",
    },
    {
      title: "Spain vs Cape Verde",
      description: "La Roja begins their campaign",
      date: new Date("2026-06-15T12:00:00"),
      venue: "Mercedes-Benz Stadium, Atlanta",
      imageUrl: "/images/spain-capeverde.jpg",
      category: "Group-Stage",
    },
    {
      title: "England vs Croatia",
      description: "Rematch of the dramatic 2018 semi-final",
      date: new Date("2026-06-17T15:00:00"),
      venue: "AT&T Stadium, Dallas",
      imageUrl: "/images/england-croatia.jpg",
      category: "Group-Stage",
    },
    {
      title: "Argentina vs Algeria",
      description: "Defending champions in action",
      date: new Date("2026-06-16T19:00:00"),
      venue: "Arrowhead Stadium, Kansas City",
      imageUrl: "/images/argentina-algeria.jpg",
      category: "Group-Stage",
    },
    {
      title: "France vs Senegal",
      description: "Battle between former champions and contenders",
      date: new Date("2026-06-16T18:00:00"),
      venue: "MetLife Stadium, New York",
      imageUrl: "/images/france-senegal.jpg",
      category: "Group-Stage",
    },
    {
      title: "Netherlands vs Japan",
      description: "European giants face Asian champions",
      date: new Date("2026-06-14T15:00:00"),
      venue: "AT&T Stadium, Dallas",
      imageUrl: "/images/netherlands-japan.jpg",
      category: "Group-Stage",
    },

    // ===== ROUND OF 32 (8 matches) =====
    {
      title: "Round of 32 - Match 1",
      description: "Group A runner-up vs Group B runner-up",
      date: new Date("2026-06-28T15:00:00"),
      venue: "SoFi Stadium, Los Angeles",
      imageUrl: "/images/round32-1.jpg",
      category: "Round-of-32",
    },
    {
      title: "Round of 32 - Match 2",
      description: "Group C winner vs Group F runner-up",
      date: new Date("2026-06-29T13:00:00"),
      venue: "NRG Stadium, Houston",
      imageUrl: "/images/round32-2.jpg",
      category: "Round-of-32",
    },
    {
      title: "Round of 32 - Match 3",
      description: "Group E winner vs Third place qualifier",
      date: new Date("2026-06-29T16:30:00"),
      venue: "Gillette Stadium, Boston",
      imageUrl: "/images/round32-3.jpg",
      category: "Round-of-32",
    },
    {
      title: "Round of 32 - Match 4",
      description: "Group F winner vs Group C runner-up",
      date: new Date("2026-06-29T21:00:00"),
      venue: "Estadio BBVA, Monterrey",
      imageUrl: "/images/round32-4.jpg",
      category: "Round-of-32",
    },
    {
      title: "Round of 32 - Match 5",
      description: "Group I winner vs Third place qualifier",
      date: new Date("2026-06-30T17:00:00"),
      venue: "MetLife Stadium, New York",
      imageUrl: "/images/round32-5.jpg",
      category: "Round-of-32",
    },
    {
      title: "Round of 32 - Match 6",
      description: "Group L winner vs Third place qualifier",
      date: new Date("2026-07-01T12:00:00"),
      venue: "Mercedes-Benz Stadium, Atlanta",
      imageUrl: "/images/round32-6.jpg",
      category: "Round-of-32",
    },
    {
      title: "Round of 32 - Match 7",
      description: "Group H winner vs Group J runner-up",
      date: new Date("2026-07-02T15:00:00"),
      venue: "SoFi Stadium, Los Angeles",
      imageUrl: "/images/round32-7.jpg",
      category: "Round-of-32",
    },
    {
      title: "Round of 32 - Match 8",
      description: "Group J winner vs Group H runner-up",
      date: new Date("2026-07-03T18:00:00"),
      venue: "Hard Rock Stadium, Miami",
      imageUrl: "/images/round32-8.jpg",
      category: "Round-of-32",
    },

    // ===== ROUND OF 16 (4 matches) =====
    {
      title: "Round of 16 - Match 1",
      description: "Winner Match 73 vs Winner Match 75",
      date: new Date("2026-07-04T13:00:00"),
      venue: "NRG Stadium, Houston",
      imageUrl: "/images/round16-1.jpg",
      category: "Round-of-16",
    },
    {
      title: "Round of 16 - Match 2",
      description: "Winner Match 79 vs Winner Match 80",
      date: new Date("2026-07-05T15:00:00"),
      venue: "Estadio Azteca, Mexico City",
      imageUrl: "/images/round16-2.jpg",
      category: "Round-of-16",
    },
    {
      title: "Round of 16 - Match 3",
      description: "Winner Match 83 vs Winner Match 84",
      date: new Date("2026-07-06T14:00:00"),
      venue: "AT&T Stadium, Dallas",
      imageUrl: "/images/round16-3.jpg",
      category: "Round-of-16",
    },
    {
      title: "Round of 16 - Match 4",
      description: "Winner Match 86 vs Winner Match 88",
      date: new Date("2026-07-07T12:00:00"),
      venue: "Mercedes-Benz Stadium, Atlanta",
      imageUrl: "/images/round16-4.jpg",
      category: "Round-of-16",
    },

    // ===== QUARTER-FINALS (4 matches) =====
    {
      title: "Quarter-Final 1",
      description: "First quarter-final showdown",
      date: new Date("2026-07-09T15:00:00"),
      venue: "SoFi Stadium, Los Angeles",
      imageUrl: "/images/quarter-1.jpg",
      category: "Quarter-Final",
    },
    {
      title: "Quarter-Final 2",
      description: "Second quarter-final clash",
      date: new Date("2026-07-10T15:00:00"),
      venue: "Hard Rock Stadium, Miami",
      imageUrl: "/images/quarter-2.jpg",
      category: "Quarter-Final",
    },
    {
      title: "Quarter-Final 3",
      description: "Third quarter-final battle",
      date: new Date("2026-07-11T12:00:00"),
      venue: "Arrowhead Stadium, Kansas City",
      imageUrl: "/images/quarter-3.jpg",
      category: "Quarter-Final",
    },
    {
      title: "Quarter-Final 4",
      description: "Fourth quarter-final encounter",
      date: new Date("2026-07-11T16:00:00"),
      venue: "Gillette Stadium, Boston",
      imageUrl: "/images/quarter-4.jpg",
      category: "Quarter-Final",
    },

    // ===== SEMI-FINALS (2 matches) =====
    {
      title: "Semi-Final 1",
      description: "First semi-final - Road to the final",
      date: new Date("2026-07-14T20:00:00"),
      venue: "AT&T Stadium, Dallas",
      imageUrl: "/images/semi-1.jpg",
      category: "Semi-Final",
    },
    {
      title: "Semi-Final 2",
      description: "Second semi-final - Road to the final",
      date: new Date("2026-07-15T15:00:00"),
      venue: "Mercedes-Benz Stadium, Atlanta",
      imageUrl: "/images/semi-2.jpg",
      category: "Semi-Final",
    },

    // ===== THIRD PLACE (1 match) =====
    {
      title: "Third Place Match",
      description: "Battle for bronze medal",
      date: new Date("2026-07-18T16:00:00"),
      venue: "Hard Rock Stadium, Miami",
      imageUrl: "/images/third-place.jpg",
      category: "Third-Place",
    },

    // ===== FINAL (1 match) =====
    {
      title: "FIFA World Cup 2026 - Final",
      description: "The ultimate showdown for football glory",
      date: new Date("2026-07-19T15:00:00"),
      venue: "MetLife Stadium, New York",
      imageUrl: "/images/wc-final.jpg",
      category: "Final",
    },
  ];

  for (const match of matches) {
    await prisma.match.create({ data: match });
    console.log(`✅ Added: ${match.title}`);
  }

  console.log("\n🎉 All 30 World Cup matches added!\n");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
