/*
  Warnings:

  - The values [PLAYER1,PLAYER2,TIE,INTERRUPTED] on the enum `SessionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SessionStatus_new" AS ENUM ('player1', 'player2', 'tie');
ALTER TABLE "finished_sessions" ALTER COLUMN "status" TYPE "SessionStatus_new" USING ("status"::text::"SessionStatus_new");
ALTER TYPE "SessionStatus" RENAME TO "SessionStatus_old";
ALTER TYPE "SessionStatus_new" RENAME TO "SessionStatus";
DROP TYPE "SessionStatus_old";
COMMIT;
