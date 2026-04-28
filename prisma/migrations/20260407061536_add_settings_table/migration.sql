-- CreateTable
CREATE TABLE `settings` (
    `id` VARCHAR(191) NOT NULL,
    `site_name` VARCHAR(191) NOT NULL DEFAULT 'Zandile.M Stories',
    `admin_email` VARCHAR(191) NOT NULL DEFAULT 'admin@zandile.com',
    `download_price` DECIMAL(10, 2) NOT NULL DEFAULT 60,
    `unlock_chapter_price` DECIMAL(10, 2) NOT NULL DEFAULT 30,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'ZAR',
    `enable_user_registration` BOOLEAN NOT NULL DEFAULT true,
    `enable_email_notifications` BOOLEAN NOT NULL DEFAULT true,
    `allow_book_previews` BOOLEAN NOT NULL DEFAULT true,
    `require_login_to_read` BOOLEAN NOT NULL DEFAULT false,
    `enable_payments` BOOLEAN NOT NULL DEFAULT true,
    `two_factor_auth` BOOLEAN NOT NULL DEFAULT false,
    `auto_logout_inactivity` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
