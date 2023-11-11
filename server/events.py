from dataclasses import dataclass
from db import get_db

@dataclass
class Events(object):
    id: int
    eventName: str
    date: int
    location: tuple

    # group chat and photo need to be implemented later
    
    @staticmethod
    def get_by_user(username: str):
        l = []
        with get_db() as con:
            cur = con.cursor()
            cur.execute("SELECT * FROM events WHERE owner = ?", [username])
            rows = cur.fetchall()
            for res in rows:
                l.append(Events(res[0], res[1], res[2], (res[3], res[4])))
        return l
    

    # username is not the owner of the event
    def add_user(self, username: str):
        with get_db() as con:
            con.execute("INSERT INTO eventCollab (events, name) VALUES (?, ?)", self.id, username) 
    
    def get_by_collabed_user(username: str):
        ids = []
        with get_db() as con:
            cur = con.cursor()
            cur.execute("SELECT * FROM eventCollab WHERE name = ?", username)
            res = cur.fetchall()
            for row in res:
                ids.append(row[0])
        
        events = []
        for id in ids:
            events.append(Events.get(id))
        
        return events

    @staticmethod
    def get(id: int):
        with get_db() as con:
            cur = con.cursor()
            cur.execute("SELECT * FROM events WHERE id = ?", [id])
            res = cur.fetchone()
            if res is not None:
                return Events(res[0], res[1], res[2], (res[3], res[4]))
        return None

    def create(self):
        with get_db() as con:
            cur = con.cursor()
            res = cur.execute("INSERT INTO events (eventName, eventCollab, date, location) VALUES (?, ?, ?, ?) RETURNING id",
                        (self.eventName, self.eventCollab, self.date, self.location))
            self.id = res.fetchone()[0]


    def update(self):
        with get_db() as con:
            con.execute("UPDATE events SET eventName = ?, eventCollab = ?, date = ?, location = ? WHERE id = ?",
                    (self.eventName, self.eventCollab, self.date, self.location, self.id))

    def delete(self):
        with get_db() as con:
            con.execute("DELETE FROM events WHERE id = ?", [self.id])
