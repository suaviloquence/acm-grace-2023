#!/usr/bin/env python3

from flask import Flask
from dataclasses import dataclass

app = Flask(__name__)

users = {
    "lavilia": "Manuel"
}

@dataclass
class UsersSlay(object):
    username: str
    password: str
    name: str
    age: int
    associations: str
    job: str = "Student at UCSC"


@app.route("/api/user/<username>")
def get_user(username):
    """ get the user from the database """
    username = username.lower()
    if username not in users:
        return "Error user not found"

    return users[username]


@app.route("/")
def serve_index():
    return """
    <p>:3</p>
    """
