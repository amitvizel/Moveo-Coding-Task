-- CreateTable
CREATE TABLE "DashboardCache" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DashboardCache_userId_key" ON "DashboardCache"("userId");

-- CreateIndex
CREATE INDEX "DashboardCache_userId_fetchedAt_idx" ON "DashboardCache"("userId", "fetchedAt");

-- AddForeignKey
ALTER TABLE "DashboardCache" ADD CONSTRAINT "DashboardCache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
