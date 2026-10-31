/*
  Warnings:

  - You are about to drop the column `city` on the `nutritionProfile` table. All the data in the column will be lost.
  - You are about to drop the column `countryCode` on the `nutritionProfile` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `nutritionProfile` table. All the data in the column will be lost.
  - You are about to drop the column `regionCode` on the `nutritionProfile` table. All the data in the column will be lost.
  - You are about to drop the column `timeZone` on the `nutritionProfile` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "foodAlias_alias_trgm";

-- AlterTable
ALTER TABLE "nutritionProfile" DROP COLUMN "city",
DROP COLUMN "countryCode",
DROP COLUMN "currency",
DROP COLUMN "regionCode",
DROP COLUMN "timeZone";

-- CreateTable
CREATE TABLE "userLocation" (
    "id" TEXT NOT NULL,
    "nutritionProfileId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT 'IN',
    "regionCode" TEXT,
    "city" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "timeZone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "userLocation_nutritionProfileId_key" ON "userLocation"("nutritionProfileId");

-- AddForeignKey
ALTER TABLE "userLocation" ADD CONSTRAINT "userLocation_nutritionProfileId_fkey" FOREIGN KEY ("nutritionProfileId") REFERENCES "nutritionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
