#!/usr/bin/env python3
import json

from flask import Flask, request
from dataclasses import dataclass
from db import DB
from user import UsersSlay


app = Flask(__name__)

db = DB()

def error(message):
    return json.dumps({"error": message})

@app.route("/api/user/<username>")
def get_user(username):
    """ get the user from the database """
    user = UsersSlay.get(db, username)
    if user != None:
        return(json.dumps(user))
    else:
        return error("user not found")
    
@app.route("/api/user/<username>", methods=["POST"])
def create_user(username):
    user = UsersSlay.get(db, username)
    # make sure is none, otherwise return error

    if not request.is_json():
        # return error invalid request
        error("This user already exists")
    
    data = request.json
    if data['username'] in db:
        return error("This username is already in use")
    else:
        username = data['username']
    password = data['password']
    name = data['name']
    if data['age'] >=100 or data['age'] <= 0:
        return error("This is not a real age")
    else:
        age = data['age']
    if data['year'] > 2040 or data['year'] < 2022:
        return error("This is not a valid graduation year")
    else:
        year = data['year']

    user = UsersSlay(username, password, name, age, year)  # TODO
    
    user.create()


@app.route("/")
def serve_index():
    return """
    <p>:3</p>
    """
