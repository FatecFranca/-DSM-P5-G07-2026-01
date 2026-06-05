/*
  Warnings:

  - You are about to drop the `genres` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `onboarding_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `track_genres` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_genres` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "onboarding_profiles" DROP CONSTRAINT "onboarding_profiles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "track_genres" DROP CONSTRAINT "track_genres_genre_id_fkey";

-- DropForeignKey
ALTER TABLE "track_genres" DROP CONSTRAINT "track_genres_track_id_fkey";

-- DropForeignKey
ALTER TABLE "user_genres" DROP CONSTRAINT "user_genres_genre_id_fkey";

-- DropForeignKey
ALTER TABLE "user_genres" DROP CONSTRAINT "user_genres_user_id_fkey";

-- DropTable
DROP TABLE "genres";

-- DropTable
DROP TABLE "onboarding_profiles";

-- DropTable
DROP TABLE "track_genres";

-- DropTable
DROP TABLE "user_genres";
