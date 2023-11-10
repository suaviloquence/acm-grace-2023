#!/usr/bin/env python3

from flask import Flask

app = Flask(__name__)

@app.route("/")
def serve_index():
    return """
    <p>:3</p>
    """
