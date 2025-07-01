-- CreateTable
CREATE TABLE "MatchNotification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "senderId" INTEGER NOT NULL,
    "player1" TEXT NOT NULL,
    "player2" TEXT NOT NULL,
    "isPrint" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MatchNotification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MatchNotification_senderId_idx" ON "MatchNotification"("senderId");
