from flask import Blueprint
from .reciept import reciept_bp

def register_blueprints(app,db,fs):
    app.register_blueprint(reciept_bp, url_prefix='/reciepts')
    reciept_bp.db = db
    reciept_bp.fs = fs
