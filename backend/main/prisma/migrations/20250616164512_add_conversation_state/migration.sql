-- CreateTable
CREATE TABLE "ConversationState" (
    "readerId" INTEGER NOT NULL,
    "otherId" INTEGER NOT NULL,
    "lastReadId" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("readerId", "otherId")
);

-- CreateIndex
CREATE INDEX "ConversationState_readerId_idx" ON "ConversationState"("readerId");

-- CreateIndex
CREATE INDEX "ConversationState_otherId_idx" ON "ConversationState"("otherId");
