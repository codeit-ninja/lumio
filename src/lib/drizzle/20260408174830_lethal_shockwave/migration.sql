CREATE TABLE `favorites_list_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`list_id` integer NOT NULL,
	`imdb_id` text NOT NULL,
	`details` blob NOT NULL,
	CONSTRAINT `fk_favorites_list_items_list_id_favorites_lists_id_fk` FOREIGN KEY (`list_id`) REFERENCES `favorites_lists`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `favorites_lists` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL
);
