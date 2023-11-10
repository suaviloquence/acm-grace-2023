from dataclasses import dataclass
from db import DB

@dataclass
class Events(object):
    eventName = str
    # list of users is the data for the users involved?
    eventCollab = list = []
    date = int
    location = tuple

    # group chat and photo need to be implemented later

    def get(db: DB, username: str):
        cur = db.con.cursor()
        cur.execute("SELECT * FROM events WHERE eventName = ?", eventName)
        res = cur.fetchone()
        if res is None:
            return None

        return Events(res['eventName'], res['eventCollab'], res['date'], res['location'], None)
    def create(self, db: DB):
        cur = db.con.cursor()
        cur.execute("INSERT INTO events (eventName, eventCollab, date, location) VALUES (?, ?, ?, ?)",
                    self.eventName, self.eventCollab, self.date, self.location)

    def update(self, db: DB):
        cur = db.con.cursor()
        cur.execute("UPDATE events SET eventName = ?, eventCollab = ?, date = ?, location = ?",
                    self.eventName, self.eventCollab, self.date, self.location)

    def delete(self, db: DB):
        cur = db.con.cursor()
        cur.execute("DELETE FROM events WHERE eventName = ?", self.eventName)
