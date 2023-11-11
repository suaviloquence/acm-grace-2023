from dataclasses import dataclass
from db import get_db

@dataclass
class Events(object):
    id: int
    eventName: str
    owner: str
    start: int
    end: int
    location_lat: float
    location_lon: float

    # group chat and photo need to be implemented later
    
    @staticmethod
    def get_by_user(username: str):
        l = []
        with get_db() as con:
            cur = con.cursor()
            cur.execute("SELECT * FROM events WHERE owner = ?", [username])
            rows = cur.fetchall() or []
            for res in rows:
                l.append(Events(*res))
        return l
    

    # username is not the owner of the event
    def add_user(self, username: str):
        with get_db() as con:
            con.execute("INSERT INTO eventCollab (events, name) VALUES (?, ?)", [self.id, username]) 

    # only append when invitation is accepted FIX THIS
    def get_by_collabed_user(username: str):
        ids = []
        with get_db() as con:
            cur = con.cursor()
            cur.execute("SELECT * FROM eventCollab WHERE name = ? AND accepted = TRUE", [username])
            res = cur.fetchall() or []
            for row in res:
                ids.append(row[0])
        
        events = []
        for id in ids:
            events.append(Events.get(id))
        
        return events
    def get_photo(self):
        photolist = []
        with get_db() as con:
            cur = con.cursor()
            cur.execute("SELECT photo FROM photos WHERE eventid = ?", [self.id])
            rows = cur.fetchall()
            for i in rows:
                photolist.append(i)
        return photolist

    def add_photo(self, data):
        with get_db() as con:
            cur = con.cursor()
            cur.execute("INSERT INTO photos (eventid, photo) VALUES (?, ?) RETURNING id", [self.id, data])
            return cur.fetchone()[0]

    def delete_photo(self):
        with get_db() as con:
            con.execute("DELETE FROM photo WHERE id = ?", [id])


    @staticmethod
    def get(id: int):
        with get_db() as con:
            cur = con.cursor()
            cur.execute("SELECT * FROM events WHERE id = ?", [id])
            res = cur.fetchone()
            if res is not None:
                return Events(*res)
        return None

    def create(self):
        with get_db() as con:
            cur = con.cursor()
            res = cur.execute("INSERT INTO events (eventName, owner, start, end, location_lat, location_lon) VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
                        (self.eventName, self.owner, self.start, self.end, self.location_lat, self.location_lon))
            self.id = res.fetchone()[0]


    def update(self):
        with get_db() as con:
            con.execute("UPDATE events SET eventName = ?, owner = ?, start = ?, end = ?, location_lat = ?, location_lon = ? WHERE id = ?",
                    (self.eventName, self.owner, self.start, self.end, self.location_lat, self.location_lon, self.id))

    def delete(self):
        with get_db() as con:
            con.execute("DELETE FROM events WHERE id = ?", [self.id])
