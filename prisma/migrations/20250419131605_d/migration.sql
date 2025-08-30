/*
  Warnings:

  - You are about to drop the column `bank_name` on the `virtual_accounts` table. All the data in the column will be lost.
  - Added the required column `bankName` to the `virtual_accounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `virtual_accounts` DROP COLUMN `bank_name`,
    ADD COLUMN `bankName` VARCHAR(191) NOT NULL;
