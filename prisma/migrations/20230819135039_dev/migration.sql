/*
  Warnings:

  - You are about to drop the column `fullName` on the `Users` table. All the data in the column will be lost.
  - Added the required column `address` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `middle_name` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `place_of_birth` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state_of_Residence` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Users` DROP COLUMN `fullName`,
    ADD COLUMN `address` VARCHAR(100) NOT NULL,
    ADD COLUMN `date_of_birth` DATETIME(3) NULL,
    ADD COLUMN `first_name` VARCHAR(100) NOT NULL,
    ADD COLUMN `last_name` VARCHAR(100) NOT NULL,
    ADD COLUMN `middle_name` VARCHAR(100) NOT NULL,
    ADD COLUMN `place_of_birth` VARCHAR(100) NOT NULL,
    ADD COLUMN `state_of_Residence` VARCHAR(100) NOT NULL;
