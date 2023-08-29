-- AlterTable
ALTER TABLE `Users` ADD COLUMN `commission` ENUM('percentage', 'static', 'null') NOT NULL DEFAULT 'null',
    ADD COLUMN `email_verified_at` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `level` ENUM('agent', 'null') NOT NULL DEFAULT 'agent',
    ADD COLUMN `whitelistip` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `middle_name` VARCHAR(100) NULL,
    MODIFY `place_of_birth` VARCHAR(100) NULL,
    MODIFY `state_of_Residence` VARCHAR(100) NULL;
