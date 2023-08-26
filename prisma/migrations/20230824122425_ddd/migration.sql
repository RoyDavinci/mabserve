/*
  Warnings:

  - Added the required column `wallet_id` to the `wallet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `wallet` ADD COLUMN `wallet_id` INTEGER NOT NULL,
    MODIFY `code` INTEGER NOT NULL AUTO_INCREMENT;
