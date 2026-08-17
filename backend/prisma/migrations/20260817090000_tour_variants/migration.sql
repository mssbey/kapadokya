-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "variant" JSONB;

-- CreateTable
CREATE TABLE "TourVariant" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceDelta" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TourVariant_tourId_sortOrder_idx" ON "TourVariant"("tourId", "sortOrder");

-- AddForeignKey
ALTER TABLE "TourVariant" ADD CONSTRAINT "TourVariant_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
