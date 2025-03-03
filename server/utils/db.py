from flask_pymongo import PyMongo
import gridfs

mongo = PyMongo()
db = None
fs = None

def init_db(app):
    global db, fs
    mongo.init_app(app)
    db = mongo.db
    fs = gridfs.GridFS(db)
    return db, fs