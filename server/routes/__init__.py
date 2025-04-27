from flask import Blueprint
from .reciept import reciept_bp
from .auth_routes import auth_bp
from .profile_route import profile_bp
def register_blueprints(app,db,fs):
    app.register_blueprint(reciept_bp, url_prefix='/reciepts')
    reciept_bp.db = db
    reciept_bp.fs = fs
    app.register_blueprint(auth_bp, url_prefix='/auth')
    auth_bp.db =db
    app.register_blueprint(profile_bp,url_prefix = '/profile')
    profile_bp.db = db
    profile_bp.fs = fs

    
