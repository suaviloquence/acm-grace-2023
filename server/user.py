from dataclasses import dataclass
from db import get_db

@dataclass
class UsersSlay(object):
	username: str
	password: bytes
	name: str
	pronouns: str
	bio: str
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
		with get_db() as con:
			cur = con.cursor()
			cur.execute("SELECT * FROM pfps WHERE id = ?", [self.pfp_id])
			res = cur.fetchone()
			if res is None: return None
		return res['data']

	def get_friends(self):
		with get_db() as con:
			cur = con.cursor()
			cur.execute("SELECT * FROM friends WHERE username1 = ?", [self.username])

	def create(self):
		with get_db() as con:
			con.execute("INSERT INTO users (username, password, name, pronouns, bio, age, year, pfp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", (self.username, self.password, self.name, self.pronouns, self.bio, self.age, self.year, self.pfp_id))
	
	@staticmethod
	def create_pfp(pfp: bytes):
		with get_db() as con:
			cur = con.cursor()
			cur.execute("INSERT INTO pfps (data) VALUES (?) RETURNING id", (pfp))
			res = cur.fetchone()
			if res is None:
				return 0
		return res['id']
	
	def update(self):
		with get_db() as con:
			con.execute("UPDATE users SET password = ?, name = ?, pronouns = ?, bio = ?, age = ?, year = ?, pfp = ? WHERE username = ?",
					(self.password, self.name, self.pronouns, self.bio, self.age, self.year, self.pfp_id, self.username))

	@staticmethod
	def update_pfp(pfp_id: int, pfp: bytes):
		with get_db() as con:
			con.execute("UPDATE pfps SET data = ? WHERE id = ?", (pfp, pfp_id))

	def delete(self):
		with get_db() as con:
			con.execute("DELETE FROM users WHERE username = ?", (self.username))
	
	@staticmethod
	def delete_pfp(pfp_id: int):
		with get_db() as con:
			con.execute("DELETE FROM pfps WHERE id = ?", (pfp_id))

