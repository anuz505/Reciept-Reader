from flask import Blueprint,jsonify,request,make_response,redirect,url_for
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token,jwt_required,get_jwt_identity
auth_bp  = Blueprint('auth',__name__)
@auth_bp.route('/register',methods=["POST"])
def register():
    db = auth_bp.db
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"message": " Missing the required files"}),400
    
    if db.user.find_one({"email": email}):
        return jsonify({"message": " User already exists"}),400
    
    password_hash = generate_password_hash(password)
    new_user = {
        "username" :username,
        "email" : email,
        "password" :password_hash
    }
    db.users.insert_one(new_user)

    return jsonify({"message": "User registered sucessfullly"}),201


@auth_bp.route('/login',methods = ["POST"])
def login():
    db = auth_bp.db
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = db.users.find_one({"email": email})
    if user and check_password_hash(user['password'], password):
        access_token = create_access_token(identity=email)
        response = make_response(redirect(url_for('home')))
        response.set_cookie('access_token', access_token, httponly=True)
        response.set_data(jsonify({"message": "Login successful", "access_token": access_token}).get_data())
        return response
        
    else:
        return jsonify({"message": "Invalid credentials"}), 401
