#!/usr/bin/env python3
import json

from flask import Flask, request, session, send_from_directory
from dataclasses import dataclass
from db import get_db
from user import UsersSlay
import bcrypt
import os.path
from events import Events
import logging

logging.basicConfig(level=logging.DEBUG)


app = Flask(__name__, static_folder=os.path.abspath("../public"))
app.secret_key = b'github dot com'

def error(message):
    return json.dumps({"error": message})

@app.route("/api/user/me", methods = ['GET'])
def get_me():
    if 'username' not in session:
        return error("not logged in.")
    return get_user(session['username'])

@app.route("/api/user/<username>")
def get_user(username):
    """ get the user from the database """
    user = UsersSlay.get(username)
    if user is not None:
        return json.dumps({
            'username': user.username,
            'name': user.name,
            'pronouns': user.pronouns,
            'bio': user.bio,
            'age': user.age,
            'year': user.year,
        })
    else:
        return error("user not found")

@app.route("/api/event/<id>")
def get_event(id):
    """ get the user from the database """
    event = Events.get(id)
    if event is not None:
        return json.dumps({
            'eventName': event.EventName,
            'date': event.date,
            'location': event.location,
        })
    else:
        return error("event not found")

@app.route("/api/user/me/friends", methods =['GET'])
def get_friends(username):
    # ADD AFTER ADDING FRIENDS TO USER.PY
    l = []
    data = request.json
    if username not in data:
        return error("this user doesn't exist")

    friend = UsersSlay.get_friends(username)
    if friend is not None:
        for i in friend:
            l.append(i)
        return l
    else:
        return error("this user doesn't have friends")


@app.route("/api/user/me/friends", methods =['PUT'])
def add_friend(self, username):
    data = request.json
    if username not in data:
        return error("This user doesn't exist")
    UsersSlay.add_friend(self, username)


@app.route("/api/user/me/friends", methods=['DELETE'])
def delete_friend(username):
    data = request.json
    if username not in data:
        return error("This user doesn't exist")
    UsersSlay.delete_friend(username)


@app.route("/api/events/<id>/photos/<photoid>", methods=['GET'])
def get_photo(eventid):
    event = Events.get(eventid)
    if event is not None:
        photo = event.get_photo(eventid)
        if photo is not None:
            return photo
    return error("This event doesn't exist")


@app.route("/api/events/<id>/photos/", methods =['POST'])
def add_photo(eventid, data):
    event = Events.get(eventid)
    if event is None:
        return error("This event doesn't exist")
    event.add_photo(data)

@app.route("/api/events/<id>/photos/", methods =['DELETE'])
def delete_photo(eventid, photoid):
    event = Events.get(eventid)
    if event is None:
        return error("This event doesn't exist")
    event.delete_photo(photoid)

    
@app.route("/api/user", methods=["POST"])
def create_user():
    if not request.is_json:
        # return error invalid request
        return error("Invalid request :pensive:")

    data = request.json

    if 'username' not in data:
        return error("username is required")
    
    username = data['username'].lower()
    
    if UsersSlay.get(username) is not None:
        return error("User already exists :()")

    if 'password' not in data:
        return error("password is required")
    password = data['password']
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    if 'name' not in data:
        return error("name is required")
    name = data['name']
    
    pronouns = None
    if 'pronouns' in data:
        pronouns = data['pronouns']

    bio = None
    if 'bio' in data:
        bio = data['bio']

    age = None

    if 'age' in data:
        age = data['age']
        if data['age'] >=100 or data['age'] <= 0:
            return error("This is not a real age")
    
    year = None
    if 'year' in data:
        if data['year'] > 2040 or data['year'] < 2022:
            return error("This is not a valid graduation year")
        year = data['year']

    user = UsersSlay(username, hashed, name, pronouns, bio, age, year, 0, None)
    
    user.create()
    
    return json.dumps({"success": True})



@app.route("/api/user", methods=["PUT"])
def update_user():
    if not request.is_json:
        # return error invalid request
        return error("Invalid request :pensive:")

    data = request.json

    if 'username' not in session: return error("not logged in")
    username = session['username']
    
    user = UsersSlay.get(username)
    
    if user is None:
        return error("User doesnt exists :()")

    if 'name' in data:
        user.name = data['name']
    
    user.pronouns = None
    if 'pronouns' in data:
        user.pronouns = data['pronouns']

    user.bio = None
    if 'bio' in data:
        user.bio = data['bio']

    user.age = None
    
    if 'age' in data:
        age = int(data['age'])
        if age >=100 or age <= 0:
            return error("This is not a real age")
        user.age = age
    
    user.year = None
    if 'year' in data:
        year = int(data['year'])
        if year > 2040 or year < 2022:
            return error("This is not a valid graduation year")
        user.year = year

    user.update()
    
    return get_me()

@app.route("/api/event/<id>", methods=["DELETE"])
def delete_event(id):
    event = Events.get(id)
    if id is None: return error("evt not found")
    if 'username' not in session or session['username'] != event.owner:
        return error("you are not the owner (maury voice)")
    with get_db() as con:
        con.execute("DELETE FROM events WHERE id = ?", [id])
    return json.dumps({"success": True})

@app.route("/api/event", methods=["PUT"])
def update_event():
    if not request.is_json:
        # return error invalid request
        return error("Invalid request :pensive:")

    data = request.json

    if 'username' not in session: return error("not logged in")
    username = session['username'];

    event = Events.get(id)

    if event is None:
        return error("User doesnt exists :()")

    if 'eventName' in data:
        event.name = data['eventName']

    event.date = None
    if 'date' in data:
        date = data['date']
        if date < 0:
            return error("This is not a real date")
        event.date = date

    event.location = None

    if 'location' in data:
        location = data['location']
        if location[0] > 90 or data[0] < -90:
            return error("This is not a real latitude")
        if location[1] < -180 or location > 180:
            return error("This is not a real longitude")
        event.location = location

    event.update()

    return get_me()


@app.route("/api/event/<id>/users/<username>", methods=['POST'])
def invite(idcode, username):
    event = Events.get(idcode)
    if event is None:
        return error("This event doesn't exist")
    if event.owner == username:
        return error("This user is the owner of the event")
    # invite user to the event
    event.add_user(username)
    return json.dumps({"success": True})

@app.route("/api/event/<id>/users", methods=['PUT'])
def accept_invite(idcode, username):
    event = Events.get(idcode)
    if event is None:
        return error("This event doesn't exist")

    with get_db() as con:
        con.execute("UPDATE eventCollab SET accepted = TRUE")

    return json.dumps({"success": True})


@app.route("/api/event/<id>/users/<username>", methods=['DELETE'])
def decline_invite(idcode, username):
    event = Events.get(idcode)
    if event is None:
        return error("This event doesn't exist")

    with get_db() as con:
        con.execute("DELETE FROM eventCollab where id = ?")
    return json.dumps({"success": True})

@app.route("/api/event/<id>/users/<username>", methods=['GET'])
def get_invitees(eventid):
    event = Events.get(eventid)
    invitee = []
    if event is None:
        return error("This event doesn't exist")
    with get_db() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM eventCollab WHERE events = ? AND accepted = TRUE", [eventid])
        res = cur.fetchall()
        for i in res:
            invitee.append(i)
    return invitee





@app.route("/api/user/<username>/pfp", methods=['GET'])
def get_pfp(username, pfpid):
    user = UsersSlay.get(username)
    if user is None:
        return error("This user doesn't exist")
    user.get_pfp(pfpid)


@app.route("/api/user/<username>/pfp", methods=['POST'])
def create_pfp(username, data):
    user = UsersSlay.get(username)
    if user is None:
        return error("This user doesn't exist")
    user.create_pfp(data)


@app.route("/api/user/<username>/pfp", methods=['PUT'])
def update_pfp(username, pfpid, data):
    user = UsersSlay.get(username)
    if user is None:
        return error("This user doesn't exist")
    user.update_pfp(pfpid, data)


@app.route("/api/user/<username>/pfp", methods =['DELETE'])
def delete_pfp(username, pfpid):
    user = UsersSlay.get(username)
    if user is None:
        return error("This user doesn't exist")
    user.delete_pfp(pfpid)


@app.route("/api/login", methods=['POST'])
def login():
    if 'username' in session:
        return get_me()
    if not request.is_json:
        return error('invalid req')
    data = request.json
    if 'username' not in data or 'password' not in data:
        return error('invalid json')
    username = data['username'].lower()
    password: str = data['password']

    user = UsersSlay.get(data['username'])
    if user is None:
        return error('user not found')

    if not bcrypt.checkpw(password.encode(), user.password):
        return error('invalid pw')

    session['username'] = username
    return get_me()
    

@app.route('/api/logout')
def logout():
    if 'username' in session:
        del session['username']
    return json.dumps({"success": True})
    
@app.route('/api/user/me/events')
def get_my_events():
    if 'username' not in session: return error('not logged in')
    return get_users_Events(session['username']);

@app.route('/api/user/<username>/events')
def get_users_Events(username):
    userevents = Events.get_by_user(username)
    colabevents = Events.get_by_collabed_user(username)
    e = []
    for i in userevents:
        e.append(i)
    for n in colabevents:
        e.append(n)
    return json.dumps([z.__dict__ for z in e])

def collab_user(username, id):
    shared_event = Events.get(id)
    if shared_event is None:
        return error("Event doesn't exist")
    if username == 'owner':
        return error("Already own event")
    Events.add_user(id, username)
    return json.dumps({"success": True})

@app.route('/api/event', methods=["POST"])
def create_event():
    if not request.is_json: return error("invalid req")
    data = request.json
    
    if 'username' not in session:
        return error("not logged in")
    
    owner = session['username']
    
    # data[]
    
    # validate event data into an event object
    if 'name' not in data:
        return error("Event Name doesn't exist")
    if 'start' not in data:
        return error("start doesn't exist")
    if 'end' not in data:
        return error("end doesn't exist")
    if 'location_lat' not in data:
        return error("Location (latitude) doesn't exist")
    if 'location_lon' not in data:
        return error("Location (longitude) doesn't exist")
    if data['start'] <= 0 or data['end'] <= 0:
        return error("Not a valid date")
    if data['start'] >= data['end']: return error("invalid start/end distro")
    if not (-90 <= data['location_lat'] <= 90):
        return error("Not a valid latitude")
    if not (-180 <= data['location_lon'] <= 180):
        return error("Not a valid longitude")

    
    event = Events(-1, data['name'], owner, data['start'], data['end'], data['location_lat'], data['location_lon'])
    event.create()
    
    return json.dumps(event.__dict__)

@app.route("/public/<path:path>", methods=['GET'])
def serve_public(path):
    return send_from_directory('../public', path)

@app.route('/', defaults={'path': ''})


@app.route('/<path:path>')
def serve_page(path):
    return app.send_static_file("index.html")

