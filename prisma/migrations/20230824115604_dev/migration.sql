/*
  Warnings:

  - Added the required column `photo_url` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Users` ADD COLUMN `photo_url` VARCHAR(250) NOT NULL;

-- AlterTable
ALTER TABLE `wallet` ADD COLUMN `account_status` VARCHAR(20) NULL,
    ADD COLUMN `name` VARCHAR(20) NULL;
