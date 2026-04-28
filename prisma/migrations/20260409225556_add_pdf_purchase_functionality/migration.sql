-- AlterTable
ALTER TABLE `books` ADD COLUMN `pdf_file` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `payment_submissions` ADD COLUMN `book_id` VARCHAR(191) NULL,
    ADD COLUMN `purchase_type` VARCHAR(191) NOT NULL DEFAULT 'chapter',
    MODIFY `chapter_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `pdf_purchases` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `book_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `pdf_purchases_user_id_idx`(`user_id`),
    INDEX `pdf_purchases_book_id_idx`(`book_id`),
    UNIQUE INDEX `pdf_purchases_user_id_book_id_key`(`user_id`, `book_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `payment_submissions_book_id_idx` ON `payment_submissions`(`book_id`);

-- AddForeignKey
ALTER TABLE `pdf_purchases` ADD CONSTRAINT `pdf_purchases_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pdf_purchases` ADD CONSTRAINT `pdf_purchases_book_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
