-- CreateEnum
CREATE TYPE "TourBadge" AS ENUM ('BEST_SELLER', 'LIKELY_TO_SELL_OUT');

-- AlterTable
ALTER TABLE "Tour" ADD COLUMN     "badge" "TourBadge";
