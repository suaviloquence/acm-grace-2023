CREATE TABLE pfps (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	data BLOB NOT NULL
);

CREATE TABLE users (
	username TEXT NOT NULL PRIMARY KEY,
	password BLOB NOT NULL,
	name TEXT NOT NULL,
	pronouns TEXT,
	age INTEGER,
	year INTEGER,
	pfp INTEGER NOT NULL REFERENCES pfps(id) DEFAULT 0
);
