-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Call" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "callSid" TEXT NOT NULL,
    "fromNumber" TEXT NOT NULL,
    "toNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in-progress',
    "language" TEXT NOT NULL DEFAULT 'hi-IN',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "duration" INTEGER,
    "summary" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'phone',
    "leadScore" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Call" ("callSid", "createdAt", "duration", "endedAt", "fromNumber", "id", "language", "startedAt", "status", "summary", "toNumber", "updatedAt") SELECT "callSid", "createdAt", "duration", "endedAt", "fromNumber", "id", "language", "startedAt", "status", "summary", "toNumber", "updatedAt" FROM "Call";
DROP TABLE "Call";
ALTER TABLE "new_Call" RENAME TO "Call";
CREATE UNIQUE INDEX "Call_callSid_key" ON "Call"("callSid");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
