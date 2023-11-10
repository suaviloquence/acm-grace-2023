#!/usr/bin/env python3
import json

from flask import Flask, request, session
from dataclasses import dataclass
from db import get_db
from user import UsersSlay
import bcrypt
import os.path


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
        return json.dumps(user)
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
    if data['age'] >=100 or data['age'] <= 0:
        return error("This is not a real age")
    age = data['age']
    if data['year'] > 2040 or data['year'] < 2022:
        return error("This is not a valid graduation year")
    year = data['year']

    user = UsersSlay(username, hashed, name, age, year, 0, None)
    
    user.create()
    print(UsersSlay.get(username))
    
    return json.dumps({"success": True})

@app.route("/api/login", methods=['POST'])
def login():
    if 'username' in session:
        return get_self()
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
    return json.dumps({"success":  True})
    


@app.route("/public/<path:path>", methods=['GET'])
def serve_public(path):
    return send_from_directory('../public', path)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_page(path):
    return app.send_static_file("index.html")

