/*
  Warnings:

  - You are about to drop the column `download_price` on the `settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `settings` DROP COLUMN `download_price`,
    ADD COLUMN `download_price_bank` DECIMAL(10, 2) NOT NULL DEFAULT 60,
    ADD COLUMN `download_price_card` DECIMAL(10, 2) NOT NULL DEFAULT 65,
    MODIFY `account_holder` VARCHAR(191) NULL,
    MODIFY `account_number` VARCHAR(191) NULL,
    MODIFY `account_type` VARCHAR(191) NULL,
    MODIFY `bank_name` VARCHAR(191) NULL,
    MODIFY `branch_code` VARCHAR(191) NULL;
