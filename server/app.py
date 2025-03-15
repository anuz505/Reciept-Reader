from flask import Flask,jsonify
from config import Config
from utils.db import init_db, db, fs
from flask_cors import CORS
from routes import register_blueprints,auth_bp
from flask_jwt_extended import JWTManager


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)


    # Initialize the database
    db, fs = init_db(app)

    jwt = JWTManager(app)
    auth_bp.db = db
    register_blueprints(app,db,fs)
    
    @app.route('/home')
    def home():
        return jsonify({"message": "Welcome to the Receipt Reader API"})
    return app