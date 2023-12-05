-- CreateTable
CREATE TABLE `dataProducts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `network` VARCHAR(10) NOT NULL,
    `validity` VARCHAR(200) NOT NULL,
    `allowance` VARCHAR(20) NOT NULL,
    `price` VARCHAR(20) NOT NULL,
    `product_id` VARCHAR(20) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `dataProducts_product_id_key`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
