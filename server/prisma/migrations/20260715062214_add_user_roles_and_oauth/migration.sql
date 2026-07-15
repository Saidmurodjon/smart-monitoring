-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ENGINEER', 'VIEWER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'local',
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'VIEWER',
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

