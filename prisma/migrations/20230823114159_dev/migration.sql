-- AlterTable
ALTER TABLE `Users` ADD COLUMN `phone_verified` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `alternative_bundles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `network` VARCHAR(200) NOT NULL DEFAULT 'MTN',
    `actual_amount` DECIMAL(8, 2) NOT NULL,
    `alt_amount` DECIMAL(8, 2) NOT NULL,
    `allowance` VARCHAR(200) NULL,
    `code` VARCHAR(5) NOT NULL,
    `alt_code` VARCHAR(200) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `directbundle_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `network` VARCHAR(20) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `actual_amount` DECIMAL(8, 2) NOT NULL,
    `price` DECIMAL(8, 2) NOT NULL,
    `data_amount` DOUBLE NULL,
    `allowance` VARCHAR(50) NOT NULL,
    `code` VARCHAR(5) NOT NULL,
    `habari_code` VARCHAR(200) NULL,
    `validity` VARCHAR(100) NOT NULL,
    `tariff` VARCHAR(200) NOT NULL,
    `bundlecode` VARCHAR(10) NULL,
    `ringoeq` VARCHAR(100) NULL,
    `ringoamount` DOUBLE NULL,
    `product_id` VARCHAR(200) NULL,
    `biller_id` INTEGER NOT NULL DEFAULT 5,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,
    `creditswitch_code` VARCHAR(199) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
