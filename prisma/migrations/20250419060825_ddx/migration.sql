-- CreateTable
CREATE TABLE `virtual_accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `response_code` VARCHAR(191) NOT NULL,
    `response_message` VARCHAR(191) NOT NULL,
    `flw_ref` VARCHAR(191) NOT NULL,
    `order_ref` VARCHAR(191) NOT NULL,
    `account_number` VARCHAR(191) NOT NULL,
    `frequency` VARCHAR(191) NULL DEFAULT 'N/A',
    `bank_name` VARCHAR(191) NOT NULL,
    `expiry_date` VARCHAR(191) NULL DEFAULT 'N/A',
    `note` VARCHAR(191) NULL,
    `amount` DOUBLE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `virtual_accounts_userId_key`(`userId`),
    UNIQUE INDEX `virtual_accounts_flw_ref_key`(`flw_ref`),
    UNIQUE INDEX `virtual_accounts_order_ref_key`(`order_ref`),
    UNIQUE INDEX `virtual_accounts_account_number_key`(`account_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `virtual_accounts` ADD CONSTRAINT `virtual_accounts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
