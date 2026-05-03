-- Create all tables for zandilem.co.za
-- Run this in phpMyAdmin SQL tab

CREATE TABLE IF NOT EXISTS `roles` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT '2000-01-01 00:00:00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NULL,
  `phone` VARCHAR(191) NULL,
  `password` VARCHAR(191) NOT NULL,
  `role_id` VARCHAR(191) NOT NULL,
  `reset_token` VARCHAR(191) NULL,
  `reset_token_expiry` DATETIME NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT '2000-01-01 00:00:00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`),
  UNIQUE KEY `users_phone_key` (`phone`),
  INDEX `users_role_id_idx` (`role_id`),
  INDEX `users_phone_idx` (`phone`),
  CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `admins` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `role_id` VARCHAR(191) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT '2000-01-01 00:00:00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `admins_email_key` (`email`),
  INDEX `admins_role_id_idx` (`role_id`),
  CONSTRAINT `admins_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `books` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `author` VARCHAR(191) NOT NULL DEFAULT 'Zandile.M Stories',
  `description` TEXT NOT NULL,
  `cover_image` VARCHAR(191) NULL,
  `pdf_file` VARCHAR(191) NULL,
  `year` VARCHAR(191) NULL,
  `genre` VARCHAR(191) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'completed',
  `release_date` DATETIME NULL,
  `price` DECIMAL(10,2) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT '2000-01-01 00:00:00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `chapters` (
  `id` VARCHAR(191) NOT NULL,
  `book_id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `order` INT NOT NULL,
  `is_locked` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT '2000-01-01 00:00:00',
  PRIMARY KEY (`id`),
  INDEX `chapters_book_id_idx` (`book_id`),
  CONSTRAINT `chapters_book_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(191) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `book_id` VARCHAR(191) NULL,
  `user_id` VARCHAR(191) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'completed',
  `payment_method` VARCHAR(191) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT '2000-01-01 00:00:00',
  PRIMARY KEY (`id`),
  INDEX `transactions_created_at_idx` (`created_at`),
  INDEX `transactions_type_idx` (`type`),
  INDEX `transactions_book_id_idx` (`book_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `chapter_unlocks` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `chapter_id` VARCHAR(191) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `chapter_unlocks_user_id_chapter_id_key` (`user_id`, `chapter_id`),
  INDEX `chapter_unlocks_user_id_idx` (`user_id`),
  INDEX `chapter_unlocks_chapter_id_idx` (`chapter_id`),
  CONSTRAINT `chapter_unlocks_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chapter_unlocks_chapter_id_fkey` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `payment_submissions` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `chapter_id` VARCHAR(191) NULL,
  `book_id` VARCHAR(191) NULL,
  `purchase_type` VARCHAR(191) NOT NULL DEFAULT 'chapter',
  `payment_reference` VARCHAR(191) NOT NULL,
  `proof_of_payment` VARCHAR(191) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
  `admin_note` VARCHAR(191) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT '2000-01-01 00:00:00',
  PRIMARY KEY (`id`),
  INDEX `payment_submissions_user_id_idx` (`user_id`),
  INDEX `payment_submissions_chapter_id_idx` (`chapter_id`),
  INDEX `payment_submissions_book_id_idx` (`book_id`),
  INDEX `payment_submissions_status_idx` (`status`),
  CONSTRAINT `payment_submissions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_submissions_chapter_id_fkey` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `pdf_purchases` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `book_id` VARCHAR(191) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pdf_purchases_user_id_book_id_key` (`user_id`, `book_id`),
  INDEX `pdf_purchases_user_id_idx` (`user_id`),
  INDEX `pdf_purchases_book_id_idx` (`book_id`),
  CONSTRAINT `pdf_purchases_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pdf_purchases_book_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `settings` (
  `id` VARCHAR(191) NOT NULL,
  `site_name` VARCHAR(191) NOT NULL DEFAULT 'Zandile.M Stories',
  `admin_email` VARCHAR(191) NOT NULL DEFAULT 'admin@zandile.com',
  `logo_type` VARCHAR(191) NOT NULL DEFAULT 'text',
  `logo_text` VARCHAR(191) NOT NULL DEFAULT 'Zandile M',
  `logo_image` VARCHAR(191) NULL,
  `download_price_card` DECIMAL(10,2) NOT NULL DEFAULT 65,
  `download_price_bank` DECIMAL(10,2) NOT NULL DEFAULT 60,
  `unlock_chapter_price_card` DECIMAL(10,2) NOT NULL DEFAULT 35,
  `unlock_chapter_price_bank` DECIMAL(10,2) NOT NULL DEFAULT 30,
  `currency` VARCHAR(191) NOT NULL DEFAULT 'ZAR',
  `bank_name` VARCHAR(191) NULL,
  `account_number` VARCHAR(191) NULL,
  `account_holder` VARCHAR(191) NULL,
  `branch_code` VARCHAR(191) NULL,
  `account_type` VARCHAR(191) NULL,
  `enable_user_registration` BOOLEAN NOT NULL DEFAULT TRUE,
  `enable_email_notifications` BOOLEAN NOT NULL DEFAULT TRUE,
  `allow_book_previews` BOOLEAN NOT NULL DEFAULT TRUE,
  `require_login_to_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `enable_payments` BOOLEAN NOT NULL DEFAULT TRUE,
  `two_factor_auth` BOOLEAN NOT NULL DEFAULT FALSE,
  `auto_logout_inactivity` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT '2000-01-01 00:00:00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed roles
INSERT IGNORE INTO `roles` (`id`, `name`, `updated_at`) VALUES
  (UUID(), 'admin', NOW()),
  (UUID(), 'user', NOW());

-- Seed admin account (password: Mafuleka55)
INSERT IGNORE INTO `admins` (`id`, `name`, `email`, `password`, `role_id`, `updated_at`)
SELECT UUID(), 'Zandile Mafuleka', 'admim@zandilem.co.za',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  id,
  NOW()
FROM `roles` WHERE `name` = 'admin' LIMIT 1;

-- Seed default settings
INSERT IGNORE INTO `settings` (`id`, `updated_at`) VALUES (UUID(), NOW());
