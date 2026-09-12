PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_favorites_list_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`list_id` integer NOT NULL,
	`imdb_id` text NOT NULL,
	`details` text NOT NULL,
	CONSTRAINT `fk_favorites_list_items_list_id_favorites_lists_id_fk` FOREIGN KEY (`list_id`) REFERENCES `favorites_lists`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_favorites_list_items`(`id`, `list_id`, `imdb_id`, `details`) SELECT `id`, `list_id`, `imdb_id`, `details` FROM `favorites_list_items`;--> statement-breakpoint
DROP TABLE `favorites_list_items`;--> statement-breakpoint
ALTER TABLE `__new_favorites_list_items` RENAME TO `favorites_list_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;