-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_sortOrder_idx" ON "Category"("sortOrder");

-- CreateIndex
CREATE INDEX "Category_isActive_idx" ON "Category"("isActive");

-- Seed categories 1:1 with the previous TourCategory enum values, using the
-- names the site owner already uses for them.
INSERT INTO "Category" ("id", "slug", "name", "sortOrder", "isActive", "updatedAt") VALUES
    (gen_random_uuid(), 'hot-air-balloon', 'Hot Air Balloon', 0, true, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'daily-tours', 'Daily Tours', 1, true, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'adventure', 'Adventure', 2, true, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'airport-transfer', 'Airport Transfer', 3, true, CURRENT_TIMESTAMP);

-- Add the new FK column nullable first so existing rows can be backfilled
-- before it's tightened to NOT NULL.
ALTER TABLE "Tour" ADD COLUMN "categoryId" TEXT;

UPDATE "Tour" t SET "categoryId" = c."id"
FROM "Category" c
WHERE (t."category" = 'BALLOON' AND c."slug" = 'hot-air-balloon')
   OR (t."category" = 'DAILY_TOUR' AND c."slug" = 'daily-tours')
   OR (t."category" = 'ADVENTURE' AND c."slug" = 'adventure')
   OR (t."category" = 'TRANSFER' AND c."slug" = 'airport-transfer');

-- Fail loudly instead of silently leaving a tour without a category.
DO $$
DECLARE unmapped INTEGER;
BEGIN
    SELECT COUNT(*) INTO unmapped FROM "Tour" WHERE "categoryId" IS NULL;
    IF unmapped > 0 THEN
        RAISE EXCEPTION 'Category migration left % tour(s) without a categoryId', unmapped;
    END IF;
END $$;

ALTER TABLE "Tour" ALTER COLUMN "categoryId" SET NOT NULL;

-- DropIndex (old enum-backed index)
DROP INDEX "Tour_category_idx";

-- CreateIndex
CREATE INDEX "Tour_categoryId_idx" ON "Tour"("categoryId");

-- AddForeignKey
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- The old enum column and type are only dropped now that every row has been
-- safely backfilled onto the new relational column above.
ALTER TABLE "Tour" DROP COLUMN "category";
DROP TYPE "TourCategory";
