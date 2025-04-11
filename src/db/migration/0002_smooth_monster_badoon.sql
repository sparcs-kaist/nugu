CREATE TABLE `user_role` (
	`user_id` int NOT NULL,
	`role` varchar(20) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `user_role_user_id_role_pk` PRIMARY KEY(`user_id`,`role`)
);
--> statement-breakpoint
ALTER TABLE `user_role` ADD CONSTRAINT `user_role_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_user_role_01` ON `user_role` (`user_id`);