-- CreateTable
CREATE TABLE "RiskRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "RiskRule_key_key" ON "RiskRule"("key");
