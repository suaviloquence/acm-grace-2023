#!/usr/bin/env python3

from flask import Flask
from dataclasses import dataclass
from db import DB
from user import UsersSlay


app = Flask(__name__)

db = DB()

@app.route("/api/user/<username>")
def get_user(username):
    """ get the user from the database """
    UsersSlay.get(db, username)
    


@app.route("/")
def serve_index():
    return """
    <p>:3</p>
    """
