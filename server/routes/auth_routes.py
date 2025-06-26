from flask import Blueprint,jsonify,request,make_response,redirect,url_for
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token,jwt_required,get_jwt_identity
from bson import ObjectId
from authlib.integrations.flask_client import OAuth
import os
import traceback

auth_bp  = Blueprint('auth',__name__)

oauth =OAuth()

google = oauth.register(
    name="google",
    client_id=os.getenv("CLIENT_ID"),
    client_secret=os.getenv("CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile',  # Add more scopes as needed
        'access_type': 'offline',
        'include_granted_scopes': 'true',
        'prompt': 'consent'
    }
)

def init_oauth(app):
    oauth.init_app(app)

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
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "Missing request data"}), 400
            
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"message": "Email and password are required"}), 400
        
        user = db.users.find_one({"email": email})
        if not user:
            return jsonify({"message": "Invalid credentials"}), 401
            
        if not check_password_hash(user['password'], password):
            return jsonify({"message": "Invalid credentials"}), 401
        
        # Generate JWT token
        access_token = create_access_token(
            identity=str(user["_id"]),
            expires_delta=None  # You can set expiration time here
        )
        
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
            samesite="None",
            max_age=2592000,  # 30 days
            secure=True,
            path='/',
            partitioned=True         
        )
        
        return response
        
    except Exception as e:
        return jsonify({"message": f"Login error: {str(e)}"}), 500



@auth_bp.route('/logout', methods=["POST"])
@jwt_required()
def logout():
    # Create a JSON response
    response = jsonify({"message": "Logout successful"})
    
    # Clear the cookie
    response.set_cookie('access_token', '', 
                        expires=0, 
                        httponly=True,
                        samesite="None",
                        secure=True,
                        path='/',
                        partitioned=True)
    
    # Return success status code
    return response, 200

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

@auth_bp.route("/login/google")
def googlelogin():
    redirect_uri = url_for("auth.google_authorize",_external=True)
    return google.authorize_redirect(redirect_uri)


@auth_bp.route("/login/google/callback")
def google_authorize():
    try:
        db = auth_bp.db
        token = google.authorize_access_token()
        granted_scopes = token.get('scope', '').split(' ')

        resp = google.get("userinfo")
        user_info = resp.json()

        email = user_info['email']
        existing_user = db.users.find_one({"email": email})

        if existing_user:
            user_id = str(existing_user['_id'])
        else:
            new_user = {
                    "username": user_info.get("name", email.split("@")[0]),
                    "email": email,
                    "password": None,
                    "auth_provider": "google",
                    "google_id": user_info.get('id'),
                    "profile_picture": user_info.get('picture'),
                    "granted_scopes": granted_scopes  # Store granted scopes
                }
            result = db.users.insert_one(new_user)
            user_id = str(result.inserted_id)

        access_token = create_access_token(identity=user_id)
        response = make_response(redirect("http://localhost:5173/auth/login"))
       
        response.set_cookie(
            'access_token', 
            access_token, 
            httponly=True, 
            samesite="None",
            max_age=2592000,  # 30 days
            secure=True,
            path='/',
            partitioned=True         
        )
            
        return response
    except Exception as e:
        print(f"Google OAuth error: {str(e)}")
        # Improve this to log the full exception details
        traceback.print_exc()  # Print full stack trace
        return redirect(f"http://localhost:5173/auth/login?error={str(e)}")