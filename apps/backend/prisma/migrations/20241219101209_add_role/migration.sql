-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "ROLE" NOT NULL DEFAULT 'ADMIN';
