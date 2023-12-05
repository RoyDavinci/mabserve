/*
  Warnings:

  - A unique constraint covering the columns `[request_id]` on the table `electricity_requests` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[trans_code]` on the table `electricity_requests` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `request_id` to the `electricity_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trans_code` to the `electricity_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `electricity_requests` ADD COLUMN `request_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `trans_code` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `electricity_requests_request_id_key` ON `electricity_requests`(`request_id`);

-- CreateIndex
CREATE UNIQUE INDEX `electricity_requests_trans_code_key` ON `electricity_requests`(`trans_code`);
