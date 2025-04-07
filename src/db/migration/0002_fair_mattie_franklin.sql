CREATE TABLE `email` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`email` varchar(255) NOT NULL,
	`verified` boolean NOT NULL DEFAULT false,
	`primary` boolean NOT NULL DEFAULT false,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `email` ADD CONSTRAINT `email_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;