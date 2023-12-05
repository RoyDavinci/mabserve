-- AlterTable
ALTER TABLE `electricity_requests` ADD COLUMN `payload` JSON NULL,
    ADD COLUMN `response` JSON NULL;
