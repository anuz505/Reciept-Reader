from flask import Flask,jsonify
from config import Config
from utils.db import init_db, db, fs
from flask_cors import CORS
from routes import register_blueprints,auth_bp
from flask_jwt_extended import JWTManager


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)


    app.secret_key = app.config["FLASK_SECRET_KEY"]

    CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}}, supports_credentials=True)
    CORS(auth_bp, origins=["http://localhost:5173"], supports_credentials=True)


    # Initialize the database
    try:
        db, fs = init_db(app)
    except Exception as e:
        print("Database connection error \n",e)


    jwt = JWTManager(app)
    auth_bp.db = db
    register_blueprints(app,db,fs)
    
    return app