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
        # return ererr invalid request
        return ...
    
    data = request.json
    data['username']
    user = UsersSlay(...) # TODO
    
    user.create()


@app.route("/")
def serve_index():
    return """
    <p>:3</p>
    """
