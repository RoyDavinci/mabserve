-- CreateTable
CREATE TABLE `data_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `network` VARCHAR(191) NULL,
    `amount` VARCHAR(191) NULL,
    `request_id` VARCHAR(191) NOT NULL,
    `external_ref` VARCHAR(191) NULL,
    `response` JSON NULL,
    `payload` JSON NULL,
    `trans_code` VARCHAR(191) NOT NULL,
    `package` VARCHAR(191) NULL,
    `bundle` VARCHAR(191) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `data_requests_request_id_key`(`request_id`),
    UNIQUE INDEX `data_requests_trans_code_key`(`trans_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
