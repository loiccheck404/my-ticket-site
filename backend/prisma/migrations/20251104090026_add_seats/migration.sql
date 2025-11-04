-- CreateTable
CREATE TABLE "Seat" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "seatNumber" TEXT NOT NULL,
    "row" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "orderItemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Seat_orderItemId_key" ON "Seat"("orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Seat_matchId_seatNumber_key" ON "Seat"("matchId", "seatNumber");

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
