-- CreateIndex
CREATE INDEX `Users_id_idx` ON `Users`(`id`);

-- CreateIndex
CREATE INDEX `unique_email_idx` ON `Users`(`email`);

-- CreateIndex
CREATE INDEX `wallet_code_idx` ON `wallet`(`code`);

-- CreateIndex
CREATE INDEX `unique_user_idx` ON `wallet`(`user_id`);
