/*
  Warnings:

  - You are about to drop the column `unlock_chapter_price` on the `settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `settings` DROP COLUMN `unlock_chapter_price`,
    ADD COLUMN `unlock_chapter_price_bank` DECIMAL(10, 2) NOT NULL DEFAULT 30,
    ADD COLUMN `unlock_chapter_price_card` DECIMAL(10, 2) NOT NULL DEFAULT 35;
