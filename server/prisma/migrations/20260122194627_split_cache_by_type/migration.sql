-- Delete existing cache data since it's incompatible with the new structure
DELETE FROM "DashboardCache";

-- CreateEnum
CREATE TYPE "CacheType" AS ENUM ('prices', 'news', 'meme', 'aiInsight');

-- DropIndex
DROP INDEX IF EXISTS "DashboardCache_userId_key";

-- AlterTable - Add cacheType column as nullable first
ALTER TABLE "DashboardCache" ADD COLUMN "cacheType" "CacheType";

-- Update any remaining rows (should be none after DELETE, but just in case)
UPDATE "DashboardCache" SET "cacheType" = 'prices' WHERE "cacheType" IS NULL;

-- Now make it NOT NULL
ALTER TABLE "DashboardCache" ALTER COLUMN "cacheType" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DashboardCache_userId_cacheType_key" ON "DashboardCache"("userId", "cacheType");

-- DropIndex
DROP INDEX IF EXISTS "DashboardCache_userId_fetchedAt_idx";

-- CreateIndex
CREATE INDEX "DashboardCache_userId_cacheType_fetchedAt_idx" ON "DashboardCache"("userId", "cacheType", "fetchedAt");
