-- AlterTable
ALTER TABLE `settings` ADD COLUMN `logo_image` VARCHAR(191) NULL,
    ADD COLUMN `logo_text` VARCHAR(191) NOT NULL DEFAULT 'Zandile M',
    ADD COLUMN `logo_type` VARCHAR(191) NOT NULL DEFAULT 'text';
