-- CreateTable
CREATE TABLE `transactions` (
    `transaction_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `operator_name` VARCHAR(191) NOT NULL,
    `operator_unique_id` VARCHAR(191) NULL,
    `status` ENUM('Pending', 'Failed', 'Successful') NOT NULL DEFAULT 'Pending',
    `amount` DECIMAL(9, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN',
    `payload` JSON NULL,
    `response` JSON NULL,
    `reference` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `transactions_operator_unique_id_key`(`operator_unique_id`),
    UNIQUE INDEX `transactions_reference_key`(`reference`),
    PRIMARY KEY (`transaction_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
