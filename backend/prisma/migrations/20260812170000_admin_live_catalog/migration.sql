-- Admin/live-catalog feature migration. Additive and data-preserving.

ALTER TABLE "Booking" DROP CONSTRAINT "Booking_userId_fkey";

ALTER TABLE "Booking"
  ADD COLUMN "adminNote" TEXT,
  ADD COLUMN "bookingNumber" TEXT,
  ADD COLUMN "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "paymentAccessExpiresAt" TIMESTAMP(3),
  ADD COLUMN "paymentAccessTokenHash" TEXT,
  ADD COLUMN "promoClaimedAt" TIMESTAMP(3),
  ADD COLUMN "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0;

UPDATE "Booking"
SET "bookingNumber" = 'DC-' || UPPER(SUBSTRING(REPLACE("id", '-', '') FROM 1 FOR 12)),
    "subtotal" = "totalPrice"
WHERE "bookingNumber" IS NULL;

ALTER TABLE "Booking" ALTER COLUMN "bookingNumber" SET NOT NULL;

ALTER TABLE "Payment"
  ADD COLUMN "failureMessage" TEXT,
  ADD COLUMN "processedAt" TIMESTAMP(3);

ALTER TABLE "PromoCode"
  ADD COLUMN "currency" TEXT,
  ADD COLUMN "minCartTotal" DOUBLE PRECISION;

ALTER TABLE "Tour"
  ADD COLUMN "childPriceRate" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  ADD COLUMN "defaultCapacity" INTEGER NOT NULL DEFAULT 20,
  ADD COLUMN "deletedAt" TIMESTAMP(3),
  ADD COLUMN "discountedPrice" DOUBLE PRECISION,
  ADD COLUMN "endTime" TEXT,
  ADD COLUMN "isBookingEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "minParticipants" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "privatePriceMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
  ADD COLUMN "startTime" TEXT,
  ADD COLUMN "tourType" TEXT NOT NULL DEFAULT 'GROUP';

UPDATE "Tour" SET "defaultCapacity" = "maxCapacity";

CREATE TABLE "TourTranslation" (
  "id" TEXT NOT NULL,
  "tourId" TEXT NOT NULL,
  "locale" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "shortDesc" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "highlights" TEXT[],
  "includes" TEXT[],
  "excludes" TEXT[],
  "meetingPoint" TEXT,
  "cancellationPolicy" TEXT,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TourTranslation_pkey" PRIMARY KEY ("id")
);

INSERT INTO "TourTranslation" (
  "id", "tourId", "locale", "title", "shortDesc", "description",
  "highlights", "includes", "excludes", "createdAt", "updatedAt"
)
SELECT
  MD5('translation:en:' || "id"), "id", 'en', "title", "shortDesc", "description",
  "highlights", "includes", "excludes", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Tour";

CREATE TABLE "TourImage" (
  "id" TEXT NOT NULL,
  "tourId" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'CLOUDINARY',
  "storageKey" TEXT,
  "assetId" TEXT,
  "secureUrl" TEXT NOT NULL,
  "width" INTEGER,
  "height" INTEGER,
  "format" TEXT,
  "bytes" INTEGER,
  "altText" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isCover" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TourImage_pkey" PRIMARY KEY ("id")
);

INSERT INTO "TourImage" (
  "id", "tourId", "provider", "secureUrl", "sortOrder", "isCover", "createdAt", "updatedAt"
)
SELECT
  MD5('image:' || t."id" || ':' || image.url), t."id", 'LEGACY', image.url,
  image.ordinality - 1, image.ordinality = 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Tour" t
CROSS JOIN LATERAL UNNEST(t."images") WITH ORDINALITY AS image(url, ordinality);

CREATE TABLE "TourSlugAlias" (
  "id" TEXT NOT NULL,
  "tourId" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TourSlugAlias_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BookingStatusHistory" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "fromStatus" "BookingStatus",
  "toStatus" "BookingStatus" NOT NULL,
  "note" TEXT,
  "changedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BookingStatusHistory_pkey" PRIMARY KEY ("id")
);

INSERT INTO "BookingStatusHistory" ("id", "bookingId", "toStatus", "note", "createdAt")
SELECT MD5('initial-status:' || "id"), "id", "status", 'Migrated current status', "createdAt"
FROM "Booking";

CREATE TABLE "PaymentWebhookEvent" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT,
  "provider" "PaymentProvider" NOT NULL,
  "eventId" TEXT NOT NULL,
  "payloadHash" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'RECEIVED',
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "metadata" JSONB,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "_PromoCodeTours" ("A" TEXT NOT NULL, "B" TEXT NOT NULL);

CREATE INDEX "TourTranslation_locale_idx" ON "TourTranslation"("locale");
CREATE UNIQUE INDEX "TourTranslation_tourId_locale_key" ON "TourTranslation"("tourId", "locale");
CREATE INDEX "TourImage_tourId_sortOrder_idx" ON "TourImage"("tourId", "sortOrder");
CREATE INDEX "TourImage_storageKey_idx" ON "TourImage"("storageKey");
CREATE UNIQUE INDEX "TourSlugAlias_slug_key" ON "TourSlugAlias"("slug");
CREATE INDEX "TourSlugAlias_tourId_idx" ON "TourSlugAlias"("tourId");
CREATE INDEX "BookingStatusHistory_bookingId_createdAt_idx" ON "BookingStatusHistory"("bookingId", "createdAt");
CREATE INDEX "PaymentWebhookEvent_paymentId_idx" ON "PaymentWebhookEvent"("paymentId");
CREATE UNIQUE INDEX "PaymentWebhookEvent_provider_eventId_key" ON "PaymentWebhookEvent"("provider", "eventId");
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
CREATE UNIQUE INDEX "_PromoCodeTours_AB_unique" ON "_PromoCodeTours"("A", "B");
CREATE INDEX "_PromoCodeTours_B_index" ON "_PromoCodeTours"("B");
CREATE UNIQUE INDEX "Booking_bookingNumber_key" ON "Booking"("bookingNumber");
CREATE INDEX "Booking_bookingNumber_idx" ON "Booking"("bookingNumber");
CREATE INDEX "Booking_guestEmail_idx" ON "Booking"("guestEmail");
CREATE INDEX "Booking_guestPhone_idx" ON "Booking"("guestPhone");
CREATE INDEX "Tour_isFeatured_idx" ON "Tour"("isFeatured");
CREATE INDEX "Tour_deletedAt_idx" ON "Tour"("deletedAt");

ALTER TABLE "TourTranslation" ADD CONSTRAINT "TourTranslation_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TourImage" ADD CONSTRAINT "TourImage_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TourSlugAlias" ADD CONSTRAINT "TourSlugAlias_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BookingStatusHistory" ADD CONSTRAINT "BookingStatusHistory_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookingStatusHistory" ADD CONSTRAINT "BookingStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PaymentWebhookEvent" ADD CONSTRAINT "PaymentWebhookEvent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "_PromoCodeTours" ADD CONSTRAINT "_PromoCodeTours_A_fkey" FOREIGN KEY ("A") REFERENCES "PromoCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_PromoCodeTours" ADD CONSTRAINT "_PromoCodeTours_B_fkey" FOREIGN KEY ("B") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
