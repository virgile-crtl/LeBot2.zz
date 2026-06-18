-- CreateTable
CREATE TABLE "Guild" (
    "guildId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "botChannelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "Music" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Music_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GuildToMusic" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_GuildToMusic_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GuildToMusic_B_index" ON "_GuildToMusic"("B");

-- AddForeignKey
ALTER TABLE "_GuildToMusic" ADD CONSTRAINT "_GuildToMusic_A_fkey" FOREIGN KEY ("A") REFERENCES "Guild"("guildId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GuildToMusic" ADD CONSTRAINT "_GuildToMusic_B_fkey" FOREIGN KEY ("B") REFERENCES "Music"("id") ON DELETE CASCADE ON UPDATE CASCADE;
