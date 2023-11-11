#!/usr/bin/env python3
import json

from flask import Flask, request, session
from dataclasses import dataclass
from db import get_db
from user import UsersSlay
import bcrypt
import os.path
from events import Events


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
            'age': user.age,
            'year': user.year,
        })
    else:
        return error("user not found")
    
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

    user = UsersSlay(username, hashed, name, pronouns, age, year, 0, None)
    
    user.create()
    
    return json.dumps({"success": True})

@app.route("/api/user", methods=["PUT"])
def update_user():
    if not request.is_json:
        # return error invalid request
        return error("Invalid request :pensive:")

    data = request.json

    if 'username' not in session: return error("not logged in")
    username = session['username'];
    
    user = UsersSlay.get(username)
    
    if user is None:
        return error("User doesnt exists :()")

    if 'name' in data:
        user.name = data['name']
    
    user.pronouns = None
    if 'pronouns' in data:
        user.pronouns = data['pronouns']

    user.age = None
    
    if 'age' in data:
        age = data['age']
        if data['age'] >=100 or data['age'] <= 0:
            return error("This is not a real age")
        user.age = age
    
    user.year = None
    if 'year' in data:
        if data['year'] > 2040 or data['year'] < 2022:
            return error("This is not a valid graduation year")
        user.year = data['year']

    user.update()
    
    return json.dumps({"success": True})

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
    
@app.route('/api/user/<username>/events')
def get_users_Events(username):
    userevents = Events.get(username)
    e = []
    if userevents is not None:
        for i in userevents:
            e.append(i)
    return json.dumps(e)


@app.route('/api/events', methods=["POST"])
def create_event():
    if not request.is_json: return error("invalid req")
    data = request.json
    
    if 'username' not in session:
        return error("not logged in")
    
    owner = session['username']
    
    data[]
    
    # validate event data into an event object
    
    event = ... # TODO
    event.create()
    
    return json.dumps({"success": True})


@app.route("/public/<path:path>", methods=['GET'])
def serve_public(path):
    return send_from_directory('../public', path)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_page(path):
    return app.send_static_file("index.html")



