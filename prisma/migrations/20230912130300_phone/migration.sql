/*
  Warnings:

  - Added the required column `phone` to the `data_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `data_requests` ADD COLUMN `phone` VARCHAR(191) NOT NULL;
