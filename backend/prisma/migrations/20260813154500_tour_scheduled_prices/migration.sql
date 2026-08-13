CREATE TABLE "TourScheduledPrice" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourScheduledPrice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TourScheduledPrice_tourId_date_key" ON "TourScheduledPrice"("tourId", "date");
CREATE INDEX "TourScheduledPrice_tourId_date_idx" ON "TourScheduledPrice"("tourId", "date");
CREATE INDEX "TourScheduledPrice_date_idx" ON "TourScheduledPrice"("date");

ALTER TABLE "TourScheduledPrice"
ADD CONSTRAINT "TourScheduledPrice_tourId_fkey"
FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
