ALTER TABLE `movies` ADD `did_watch` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `movies` ADD `watched_at` integer;--> statement-breakpoint
ALTER TABLE `movies` ADD `stopped_at` integer;--> statement-breakpoint
ALTER TABLE `movies` DROP COLUMN `details`;--> statement-breakpoint
ALTER TABLE `movies` DROP COLUMN `expires_at`;