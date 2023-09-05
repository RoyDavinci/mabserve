/*
  Warnings:

  - You are about to drop the column `address` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `date_of_birth` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `middle_name` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `place_of_birth` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `state_of_Residence` on the `Users` table. All the data in the column will be lost.
  - Added the required column `fullName` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Users` DROP COLUMN `address`,
    DROP COLUMN `date_of_birth`,
    DROP COLUMN `first_name`,
    DROP COLUMN `last_name`,
    DROP COLUMN `middle_name`,
    DROP COLUMN `place_of_birth`,
    DROP COLUMN `state_of_Residence`,
    ADD COLUMN `fullName` VARCHAR(100) NOT NULL;
