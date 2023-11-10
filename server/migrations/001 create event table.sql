CREATE TABLE events (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    eventName TEXT NOT NULL,
    owner TEXT NOT NULL,
    date INT NOT NULL,
    location_lat REAL NOT NULL,
    location_lon REAL NOT NULL,
);

CREATE TABLE eventCollab (
    events INTEGER NOT NULL REFERENCES events(id),
    name TEXT NOT NULL REFERENCES users(username)

);