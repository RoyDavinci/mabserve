-- AlterTable
ALTER TABLE `Users` ADD COLUMN `bvnVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `dailyTransaction` INTEGER NOT NULL DEFAULT 0;
