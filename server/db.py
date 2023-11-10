import sqlite3

class DB(object):
	con: sqlite3.Connection
	
	def __init__(self):
		super().__init__()
		self.con = sqlite3.connect("data.db")