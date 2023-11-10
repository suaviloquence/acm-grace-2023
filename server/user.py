from dataclasses import dataclass
from db import get_db

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
	def get(username: str):
		with get_db() as con:
			cur = con.cursor()
			cur.execute("SELECT * FROM users WHERE username = ?", [username])
			res = cur.fetchone()
			if res is not None:
				return UsersSlay(*res, associations=None)
		return None
		
	
	def get_pfp(self):
		cur = db.con.cursor()
		cur.execute("SELECT * FROM pfps WHERE id = ?", [self.pfp_id])
		res = cur.fetchone()
		if res is None: return None
		return res['data']
	

	def create(self):
		with get_db() as con:
			con.execute("INSERT INTO users (username, password, name, pfp, age, year) VALUES (?, ?, ?, ?, ?, ?)", (self.username, self.password, self.name, self.pfp_id, self.age, self.year))
	
	@staticmethod
	def create_pfp(pfp: bytes):
		cur = db.con.cursor()
		cur.execute("INSERT INTO pfps (data) VALUES (?) RETURNING id", (pfp))
		res = cur.fetchone()
		if res is None:
			return 0
		return res['id']
	
	def update(self):
		cur = db.con.cursor()
		cur.execute("UPDATE users SET password = ?, name = ?, pfp = ?, age = ?, year = ? WHERE username = ?",
					(self.password, self.name, self.pfp, self.age, self.year, self.username))
		cur.commit()
		
	@staticmethod
	def update_pfp(pfp_id: int, pfp: bytes):
		cur = db.con.cursor()
		cur.execute("UPDATE pfps SET data = ? WHERE id = ?", (pfp, pfp_id))
		cur.commit()
	
	def delete(self):
		cur = db.con.cursor()
		cur.execute("DELETE FROM users WHERE username = ?", (self.username))
		cur.commit()
	
	@staticmethod
	def delete(pfp_id: int):
		cur = db.con.cursor()
		cur.execute("DELETE FROM pfps WHERE id = ?", (pfp_id))
		cur.commit()

