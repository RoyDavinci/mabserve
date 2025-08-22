/*
  Warnings:

  - You are about to drop the `virtual_accounts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `virtual_accounts` DROP FOREIGN KEY `virtual_accounts_userId_fkey`;

-- DropTable
DROP TABLE `virtual_accounts`;

-- CreateTable
CREATE TABLE `VirtualAccount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `flwRef` VARCHAR(191) NULL,
    `orderRef` VARCHAR(191) NOT NULL,
    `accountNumber` VARCHAR(191) NOT NULL,
    `frequency` VARCHAR(191) NULL DEFAULT 'N/A',
    `bankName` VARCHAR(191) NOT NULL,
    `expiryDate` VARCHAR(191) NULL DEFAULT 'N/A',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `VirtualAccount_userId_key`(`userId`),
    UNIQUE INDEX `VirtualAccount_orderRef_key`(`orderRef`),
    UNIQUE INDEX `VirtualAccount_accountNumber_key`(`accountNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VirtualAccount` ADD CONSTRAINT `VirtualAccount_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
