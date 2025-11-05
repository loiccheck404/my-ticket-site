/*
  Warnings:

  - Added the required column `cryptoAmount` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exchangeRate` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "confirmations" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "cryptoAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "exchangeRate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "txHash" DROP NOT NULL;
