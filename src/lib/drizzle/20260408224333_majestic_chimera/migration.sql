CREATE TABLE `movies` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`imdb_id` text NOT NULL UNIQUE,
	`details` text NOT NULL,
	`expires_at` integer NOT NULL
);
