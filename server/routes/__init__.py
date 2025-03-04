from flask import Blueprint
from .reciept import reciept_bp
from .auth_routes import auth_bp
def register_blueprints(app,db,fs):
    app.register_blueprint(reciept_bp, url_prefix='/reciepts')
    reciept_bp.db = db
    reciept_bp.fs = fs
    app.register_blueprint(auth_bp, url_prefix='/auth')
    auth_bp.db =db
    
