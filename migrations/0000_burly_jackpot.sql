CREATE TABLE `events` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`mosque_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(255) NOT NULL,
	`date` timestamp NOT NULL,
	`time` varchar(50) NOT NULL,
	`is_recurring` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mosques` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` varchar(255) NOT NULL,
	`city` varchar(255) NOT NULL,
	`contact_number` varchar(20),
	`email` varchar(255) NOT NULL,
	`mosque_identifier` varchar(50),
	`latitude` varchar(50) NOT NULL,
	`longitude` varchar(50) NOT NULL,
	`image_url` varchar(255) NOT NULL,
	`additional_images` varchar(255),
	`is_verified` boolean DEFAULT false,
	`verification_status` varchar(20) DEFAULT 'pending',
	`created_by` bigint unsigned,
	`has_womens_section` boolean DEFAULT false,
	`has_accessible_entrance` boolean DEFAULT false,
	`has_parking` boolean DEFAULT false,
	`has_wudu_facilities` boolean DEFAULT false,
	`has_quran_classes` boolean DEFAULT false,
	`has_community_hall` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `mosques_id` PRIMARY KEY(`id`),
	CONSTRAINT `mosques_mosque_identifier_unique` UNIQUE(`mosque_identifier`)
);
--> statement-breakpoint
CREATE TABLE `prayer_times` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`mosque_id` bigint unsigned NOT NULL,
	`fajr` varchar(50) NOT NULL,
	`dhuhr` varchar(50) NOT NULL,
	`asr` varchar(50) NOT NULL,
	`maghrib` varchar(50) NOT NULL,
	`isha` varchar(50) NOT NULL,
	`jummuah` varchar(50),
	`fajr_azaan` varchar(50) NOT NULL,
	`dhuhr_azaan` varchar(50) NOT NULL,
	`asr_azaan` varchar(50) NOT NULL,
	`maghrib_azaan` varchar(50) NOT NULL,
	`isha_azaan` varchar(50) NOT NULL,
	`fajr_days` varchar(50) DEFAULT 'Daily',
	`dhuhr_days` varchar(50) DEFAULT 'Daily',
	`asr_days` varchar(50) DEFAULT 'Daily',
	`maghrib_days` varchar(50) DEFAULT 'Daily',
	`isha_days` varchar(50) DEFAULT 'Daily',
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `prayer_times_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`username` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`role` varchar(50) NOT NULL DEFAULT 'committee',
	`mosque_id` bigint unsigned,
	`is_verified` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_mosque_id_mosques_id_fk` FOREIGN KEY (`mosque_id`) REFERENCES `mosques`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `prayer_times` ADD CONSTRAINT `prayer_times_mosque_id_mosques_id_fk` FOREIGN KEY (`mosque_id`) REFERENCES `mosques`(`id`) ON DELETE no action ON UPDATE no action;