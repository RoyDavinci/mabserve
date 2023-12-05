-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `walletId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `electricity_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('Pending', 'Failed', 'Successful') NOT NULL,
    `amount` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `unit` VARCHAR(191) NULL,
    `token` VARCHAR(191) NULL,
    `resetToken` VARCHAR(191) NULL,
    `configureToken` VARCHAR(191) NULL,
    `customerName` VARCHAR(200) NULL,
    `customerAddress` VARCHAR(225) NULL,
    `debtPayment` VARCHAR(191) NULL,
    `taxAmount` VARCHAR(191) NULL,
    `arrearsApplied` VARCHAR(191) NULL,
    `meterNumber` VARCHAR(191) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `electricity_requests` ADD CONSTRAINT `electricity_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
