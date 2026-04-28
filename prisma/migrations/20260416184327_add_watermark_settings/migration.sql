-- AlterTable
ALTER TABLE `settings` ADD COLUMN `enable_watermark` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `watermark_font_size` INTEGER NOT NULL DEFAULT 20,
    ADD COLUMN `watermark_opacity` DECIMAL(3, 2) NOT NULL DEFAULT 0.3,
    ADD COLUMN `watermark_position` VARCHAR(191) NOT NULL DEFAULT 'both',
    ADD COLUMN `watermark_text` VARCHAR(191) NULL;
