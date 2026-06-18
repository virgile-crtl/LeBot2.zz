/*
  Warnings:

  - The primary key for the `Music` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Music` table. All the data in the column will be lost.
  - The primary key for the `_GuildToMusic` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "_GuildToMusic" DROP CONSTRAINT "_GuildToMusic_B_fkey";

-- AlterTable
ALTER TABLE "Music" DROP CONSTRAINT "Music_pkey",
DROP COLUMN "id",
ADD COLUMN     "private" BOOLEAN NOT NULL DEFAULT false,
ADD CONSTRAINT "Music_pkey" PRIMARY KEY ("title");

-- AlterTable
ALTER TABLE "_GuildToMusic" DROP CONSTRAINT "_GuildToMusic_AB_pkey",
ALTER COLUMN "B" SET DATA TYPE TEXT,
ADD CONSTRAINT "_GuildToMusic_AB_pkey" PRIMARY KEY ("A", "B");

-- AddForeignKey
ALTER TABLE "_GuildToMusic" ADD CONSTRAINT "_GuildToMusic_B_fkey" FOREIGN KEY ("B") REFERENCES "Music"("title") ON DELETE CASCADE ON UPDATE CASCADE;
