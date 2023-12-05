-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `updated_at` TIMESTAMP(0) NULL;

-- AlterTable
ALTER TABLE `wallet` ADD COLUMN `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `updated_at` TIMESTAMP(0) NULL;

-- CreateTable
CREATE TABLE `airtime_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `network` VARCHAR(20) NOT NULL,
    `category` VARCHAR(50) NULL,
    `amount` DECIMAL(8, 2) NOT NULL,
    `request_id` VARCHAR(80) NOT NULL,
    `trans_code` VARCHAR(80) NOT NULL,
    `response` JSON NULL,
    `payload` JSON NULL,
    `phone` VARCHAR(20) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `status` ENUM('Pending', 'Failed', 'Successful') NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `airtime_requests` ADD CONSTRAINT `airtime_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
