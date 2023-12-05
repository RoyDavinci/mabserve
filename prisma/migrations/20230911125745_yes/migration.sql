/*
  Warnings:

  - A unique constraint covering the columns `[request_id]` on the table `airtime_requests` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[trans_code]` on the table `airtime_requests` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `airtime_requests_request_id_key` ON `airtime_requests`(`request_id`);

-- CreateIndex
CREATE UNIQUE INDEX `airtime_requests_trans_code_key` ON `airtime_requests`(`trans_code`);
