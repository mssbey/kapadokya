CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED');

ALTER TABLE "Tour" ALTER COLUMN "currency" SET DEFAULT 'EUR';
ALTER TABLE "Booking" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "Booking" ALTER COLUMN "currency" SET DEFAULT 'EUR';
ALTER TABLE "Payment" ALTER COLUMN "currency" SET DEFAULT 'EUR';

CREATE TABLE "PromoCode" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "type" "DiscountType" NOT NULL,
  "value" DOUBLE PRECISION NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "maxUses" INTEGER,
  "usedCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");
ALTER TABLE "Booking" ADD COLUMN "promoCodeId" TEXT;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
