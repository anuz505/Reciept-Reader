from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
app = Flask(__name__)