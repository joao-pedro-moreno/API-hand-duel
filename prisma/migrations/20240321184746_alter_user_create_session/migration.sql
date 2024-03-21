/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PLAYER1', 'PLAYER2', 'TIE');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "active_sessions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "rounds" INTEGER NOT NULL DEFAULT 5,
    "player1Id" TEXT NOT NULL,
    "player2Id" TEXT,

    CONSTRAINT "active_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finished_sessions" (
    "id" TEXT NOT NULL,
    "rounds" INTEGER NOT NULL,
    "player1Id" TEXT NOT NULL,
    "player2Id" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL,
    "finished_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finished_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "active_sessions_code_key" ON "active_sessions"("code");
