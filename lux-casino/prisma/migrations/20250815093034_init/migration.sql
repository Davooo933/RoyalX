-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "referralCode" TEXT,
    "referredById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLoginAt" DATETIME
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USDT',
    "chain" TEXT NOT NULL DEFAULT 'TRON',
    "address" TEXT NOT NULL,
    "privateKey" TEXT,
    "balance" DECIMAL NOT NULL DEFAULT 0,
    "locked" DECIMAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "walletId" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL,
    "chain" TEXT,
    "txHash" TEXT,
    "metaJson" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rtpTarget" REAL NOT NULL DEFAULT 0.30,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GameRound" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "userId" TEXT,
    "betAmount" DECIMAL NOT NULL,
    "payoutAmount" DECIMAL NOT NULL DEFAULT 0,
    "seedServer" TEXT NOT NULL,
    "seedClient" TEXT NOT NULL,
    "nonce" INTEGER NOT NULL,
    "resultJson" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SETTLED',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settledAt" DATETIME,
    CONSTRAINT "GameRound_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GameRound_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roundId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "payoutMultiplier" REAL NOT NULL,
    "win" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bet_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "GameRound" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RTPController" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scope" TEXT NOT NULL DEFAULT 'GLOBAL',
    "gameId" TEXT,
    "targetRtp" REAL NOT NULL DEFAULT 0.30,
    "currentWagered" DECIMAL NOT NULL DEFAULT 0,
    "currentPaid" DECIMAL NOT NULL DEFAULT 0,
    "configJson" JSONB,
    "lastResetAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RTPController_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bonus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expiresAt" DATETIME,
    "claimedAt" DATETIME,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bonus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "metaJson" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FairnessSeed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "serverSeedHash" TEXT NOT NULL,
    "serverSeed" TEXT,
    "clientSeed" TEXT,
    "nonceStart" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revealedAt" DATETIME,
    CONSTRAINT "FairnessSeed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_address_key" ON "Wallet"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Game_key_key" ON "Game"("key");

-- CreateIndex
CREATE UNIQUE INDEX "FairnessSeed_serverSeedHash_key" ON "FairnessSeed"("serverSeedHash");
