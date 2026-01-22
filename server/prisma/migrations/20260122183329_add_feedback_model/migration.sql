-- CreateEnum
CREATE TYPE "FeedbackContentType" AS ENUM ('NEWS', 'AI_INSIGHT', 'MEME', 'COIN_PRICE');

-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('UP', 'DOWN');

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentType" "FeedbackContentType" NOT NULL,
    "contentId" TEXT NOT NULL,
    "vote" "VoteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_userId_contentType_idx" ON "Feedback"("userId", "contentType");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
