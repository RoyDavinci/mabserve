/*
  Warnings:

  - You are about to drop the column `account_number` on the `virtual_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `expiry_date` on the `virtual_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `flw_ref` on the `virtual_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `virtual_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `order_ref` on the `virtual_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `response_code` on the `virtual_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `response_message` on the `virtual_accounts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[flwRef]` on the table `virtual_accounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderRef]` on the table `virtual_accounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accountNumber]` on the table `virtual_accounts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountNumber` to the `virtual_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `flwRef` to the `virtual_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderRef` to the `virtual_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responseCode` to the `virtual_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responseMessage` to the `virtual_accounts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `virtual_accounts_account_number_key` ON `virtual_accounts`;

-- DropIndex
DROP INDEX `virtual_accounts_flw_ref_key` ON `virtual_accounts`;

-- DropIndex
DROP INDEX `virtual_accounts_order_ref_key` ON `virtual_accounts`;

-- AlterTable
ALTER TABLE `virtual_accounts` DROP COLUMN `account_number`,
    DROP COLUMN `expiry_date`,
    DROP COLUMN `flw_ref`,
    DROP COLUMN `note`,
    DROP COLUMN `order_ref`,
    DROP COLUMN `response_code`,
    DROP COLUMN `response_message`,
    ADD COLUMN `accountNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `expiryDate` VARCHAR(191) NULL DEFAULT 'N/A',
    ADD COLUMN `flwRef` VARCHAR(191) NOT NULL,
    ADD COLUMN `orderRef` VARCHAR(191) NOT NULL,
    ADD COLUMN `responseCode` VARCHAR(191) NOT NULL,
    ADD COLUMN `responseMessage` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `virtual_accounts_flwRef_key` ON `virtual_accounts`(`flwRef`);

-- CreateIndex
CREATE UNIQUE INDEX `virtual_accounts_orderRef_key` ON `virtual_accounts`(`orderRef`);

-- CreateIndex
CREATE UNIQUE INDEX `virtual_accounts_accountNumber_key` ON `virtual_accounts`(`accountNumber`);
