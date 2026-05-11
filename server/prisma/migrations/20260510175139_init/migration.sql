-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "consentedAt" DATETIME,
    "photoPath" TEXT,
    "responses" TEXT,
    "lastAnswerAt" DATETIME,
    "resultType" TEXT,
    "scores" TEXT,
    "gender" TEXT,
    "hair" INTEGER,
    "hat" INTEGER,
    "glasses" INTEGER,
    "nickname" TEXT,
    "pledge" TEXT,
    "cardNo" TEXT,
    "issuedAt" DATETIME,
    "prizeDrawn" BOOLEAN NOT NULL DEFAULT false,
    "prizeRank" INTEGER,
    "drawnAt" DATETIME
);

-- CreateTable
CREATE TABLE "Prize" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rank" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "remaining" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "EventLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionId" TEXT,
    "type" TEXT NOT NULL,
    "meta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_cardNo_key" ON "Session"("cardNo");

-- CreateIndex
CREATE INDEX "Session_createdAt_idx" ON "Session"("createdAt");

-- CreateIndex
CREATE INDEX "Session_resultType_idx" ON "Session"("resultType");

-- CreateIndex
CREATE INDEX "EventLog_type_createdAt_idx" ON "EventLog"("type", "createdAt");
