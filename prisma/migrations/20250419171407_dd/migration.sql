/*
  Warnings:

  - You are about to drop the column `expiryDate` on the `VirtualAccount` table. All the data in the column will be lost.
  - You are about to drop the column `flwRef` on the `VirtualAccount` table. All the data in the column will be lost.
  - You are about to drop the column `frequency` on the `VirtualAccount` table. All the data in the column will be lost.
  - You are about to drop the column `orderRef` on the `VirtualAccount` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `VirtualAccount_orderRef_key` ON `VirtualAccount`;

-- AlterTable
ALTER TABLE `VirtualAccount` DROP COLUMN `expiryDate`,
    DROP COLUMN `flwRef`,
    DROP COLUMN `frequency`,
    DROP COLUMN `orderRef`;
