/*
  Warnings:

  - You are about to alter the column `player1Id` on the `GameResult` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `player2Id` on the `GameResult` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "player1Id" INTEGER NOT NULL,
    "player2Id" INTEGER NOT NULL,
    "winnerId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "player1Score" INTEGER NOT NULL,
    "player2Score" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_GameResult" ("createdAt", "id", "player1Id", "player1Score", "player2Id", "player2Score", "reason", "winnerId") SELECT "createdAt", "id", "player1Id", "player1Score", "player2Id", "player2Score", "reason", "winnerId" FROM "GameResult";
DROP TABLE "GameResult";
ALTER TABLE "new_GameResult" RENAME TO "GameResult";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
