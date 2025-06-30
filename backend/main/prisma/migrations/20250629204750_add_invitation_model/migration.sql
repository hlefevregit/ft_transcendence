-- CreateTable
CREATE TABLE "Invitation" (
    "inviterId" INTEGER NOT NULL,
    "inviteeId" INTEGER NOT NULL,
    "roomId" TEXT,
    "waitingForPlayer" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("inviterId", "inviteeId")
);

-- CreateIndex
CREATE INDEX "Invitation_inviteeId_waitingForPlayer_idx" ON "Invitation"("inviteeId", "waitingForPlayer");
