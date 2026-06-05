/*
  Warnings:

  - You are about to drop the column `objective` on the `playlists` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "playlists" DROP COLUMN "objective";

-- DropEnum
DROP TYPE "objective";
