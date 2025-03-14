from flask import Blueprint,jsonify,request,make_response,redirect,url_for
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token,jwt_required,get_jwt_identity
from bson import ObjectId

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
    
    if db.users.find_one({"email": email}):
        return jsonify({"message": " User already exists"}),400
    
    password_hash = generate_password_hash(password)
    new_user = {
        "username" :username,
        "email" : email,
        "password" :password_hash
    }
    db.users.insert_one(new_user)

    return jsonify({"message": "User registered sucessfullly"}),201


@auth_bp.route('/login', methods=["POST"])
def login():
    db = auth_bp.db
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = db.users.find_one({"email": email})
    if user and check_password_hash(user['password'], password):
        access_token = create_access_token(identity=str(user["_id"]))
        
        # Create response with user data
        response = make_response(jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "id": str(user['_id']),
            "username": user['username'],
            "email": user['email']
        }))
        
        # Set cookie with proper attributes for cross-origin requests
        response.set_cookie(
            'access_token', 
            access_token, 
            httponly=True, 
            samesite="None",  # Less strict than 'Strict', allows some cross-site requests
            max_age=2592000,  # 30 days
            secure=True,   # Enable in production with HTTPS
            path='/',
            partitioned=True         
            )
        
        return response
    else:
        return jsonify({"message": "Invalid credentials"}), 401



@auth_bp.route('/logout',methods = ["POST"])
@jwt_required()
def logout():
    response = make_response(redirect(url_for('home')))
    response.set_cookie('access_token', '', expires=0)
    return response


@auth_bp.route('/checkAuth',methods = ["GET"])
@jwt_required()
def get_current_user():
    try:
        db = auth_bp.db
        userID  = get_jwt_identity()
        user = db.users.find_one({"_id" : ObjectId(userID) })

        if not user:
            return jsonify({"msg" : " User not found"}),404
        
        
        return jsonify({
            "id": str(user['_id']),
            "username": user['username'],
            "email": user['email'],
        }), 200
    except Exception as e:
        return jsonify({"msg": f"Authentication error: {str(e)}"}), 401


    