/*
  Warnings:

  - Added the required column `status` to the `data_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `data_requests` ADD COLUMN `status` ENUM('Pending', 'Failed', 'Successful') NOT NULL;
