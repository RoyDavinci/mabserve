-- CreateTable
CREATE TABLE `wallet_histories` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `amount` DOUBLE NOT NULL,
    `userId` BIGINT UNSIGNED NOT NULL,
    `source` VARCHAR(100) NULL,
    `channel` VARCHAR(191) NULL,
    `status` VARCHAR(1) NOT NULL DEFAULT '0',
    `balanceAfter` DOUBLE NULL,
    `createdAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NULL,
    `reference` VARCHAR(100) NULL,
    `description` VARCHAR(250) NULL,
    `type` VARCHAR(20) NULL DEFAULT 'CREDIT',

    INDEX `wallet_histories_createdAt_idx`(`createdAt`),
    INDEX `wallet_histories_description_idx`(`description`),
    INDEX `wallet_histories_reference_idx`(`reference`),
    INDEX `wallet_histories_type_idx`(`type`),
    INDEX `wallet_histories_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
