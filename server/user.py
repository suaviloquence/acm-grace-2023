from dataclasses import dataclass
from db import DB

@dataclass
class UsersSlay(object):
	username: str
	password: bytes
	name: str
	age: int
	year: int
	pfp_id: int
	associations: str
	job: str = "Student at UCSC"
	
	@staticmethod
	def get(db: DB, username: str):
		cur = db.con.cursor()
		cur.execute("SELECT * FROM users WHERE username = ?", username)
		res = cur.fetchone()
		if res is None:
			return None
		
		return UsersSlay(res['username'], res['password'], res['name'], res['age'], res['year'], res['pfp'], None)
	
	def get_pfp(self, db: DB):
		cur = db.con.cursor()
		cur.execute("SELECT * FROM pfps WHERE id = ?", self.pfp_id)
		res = cur.fetchone()
		if res is None: return None
		return res['data']
	

	def create(self, db: DB):
		cur = db.con.cursor()
		cur.execute("INSERT INTO users (username, password, name, pfp, age, year) VALUES (?, ?, ?, ?, ?)", self.username, self.password, self.pfp_id, self.age, self.year)
	
	def create_pfp(db: DB, pfp: bytes):
		cur = db.con.cursor()
		cur.execute("INSERT INTO pfps (data) VALUES (?) RETURNING id", pfp)
		res = cur.fetchone()
		if res is None:
			return 0
		return res['id']

