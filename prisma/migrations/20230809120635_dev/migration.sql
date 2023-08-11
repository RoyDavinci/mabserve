-- CreateTable
CREATE TABLE `Users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `fullNme` VARCHAR(100) NOT NULL,
    `password` VARCHAR(200) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `login_at` DATETIME(3) NULL,
    `role` ENUM('Super_Admin', 'Admin', 'User') NOT NULL DEFAULT 'User',
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `otp` VARCHAR(191) NULL,
    `accountStatus` INTEGER NOT NULL DEFAULT 1234567890,
    `phone` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `Users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallet` (
    `code` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `balance_before` DECIMAL(9, 2) NOT NULL DEFAULT 0.00,
    `balance_after` DECIMAL(9, 2) NOT NULL DEFAULT 0.00,
    `balance` DECIMAL(9, 2) NOT NULL DEFAULT 0.00,

    UNIQUE INDEX `wallet_user_id_key`(`user_id`),
    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `wallet` ADD CONSTRAINT `wallet_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
