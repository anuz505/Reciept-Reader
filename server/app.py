from flask import Flask
from config import Config
from utils.db import init_db, db, fs
from flask_cors import CORS
from routes import register_blueprints

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    # Initialize the database
    db, fs = init_db(app)

    register_blueprints(app,db,fs)

    return app