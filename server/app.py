from flask import Flask,jsonify
from config import Config
from utils.db import init_db, db, fs
from flask_cors import CORS
from routes import register_blueprints
from flask_jwt_extended import JWTManager

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    # Initialize the database
    db, fs = init_db(app)

    jwt = JWTManager(app)

    register_blueprints(app,db,fs)
    @app.route('/home')
    def home():
        return jsonify({"message": "Welcome to the Receipt Reader API"})
    return app