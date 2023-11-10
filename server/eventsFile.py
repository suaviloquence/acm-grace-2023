from dataclasses import dataclass
from db import get_db

@dataclass
class Events(object):
    eventName = str
    # list of users is the data for the users involved?
    eventCollab = list = []
    date = int
    location = tuple

    # group chat and photo need to be implemented later

    @staticmethod
    def get(eventName: str):
        with get_db() as con:
            cur = con.cursor()
            cur.execute("SELECT * FROM events WHERE eventName = ?", [eventName])
            res = cur.fetchone()
            if res is not None:
                return Events(*res)
        return None

    def create(self):
        with get_db() as con:
            con.execute("INSERT INTO events (eventName, eventCollab, date, location) VALUES (?, ?, ?, ?)",
                        (self.eventName, self.eventCollab, self.date, self.location))

    def update(self):
        with get_db() as con:
            con.execute("UPDATE events SET eventName = ?, eventCollab = ?, date = ?, location = ?",
                    (self.eventName, self.eventCollab, self.date, self.location))

    def delete(self):
        with get_db() as con:
            con.execute("DELETE FROM events WHERE eventName = ?", (self.eventName))
