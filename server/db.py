import sqlite3

def get_db() -> sqlite3.Connection:
	return sqlite3.connect("data.db")