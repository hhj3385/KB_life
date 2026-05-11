/*
  Warnings:

  - You are about to drop the column `glasses` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `hat` on the `Session` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
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
    "accessory" TEXT,
    "nickname" TEXT,
    "pledge" TEXT,
    "cardNo" TEXT,
    "issuedAt" DATETIME,
    "prizeDrawn" BOOLEAN NOT NULL DEFAULT false,
    "prizeRank" INTEGER,
    "drawnAt" DATETIME
);
INSERT INTO "new_Session" ("cardNo", "consentedAt", "createdAt", "drawnAt", "expiresAt", "gender", "hair", "id", "issuedAt", "lastAnswerAt", "nickname", "photoPath", "pledge", "prizeDrawn", "prizeRank", "responses", "resultType", "scores") SELECT "cardNo", "consentedAt", "createdAt", "drawnAt", "expiresAt", "gender", "hair", "id", "issuedAt", "lastAnswerAt", "nickname", "photoPath", "pledge", "prizeDrawn", "prizeRank", "responses", "resultType", "scores" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
CREATE UNIQUE INDEX "Session_cardNo_key" ON "Session"("cardNo");
CREATE INDEX "Session_createdAt_idx" ON "Session"("createdAt");
CREATE INDEX "Session_resultType_idx" ON "Session"("resultType");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
