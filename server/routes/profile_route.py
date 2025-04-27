from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
import base64
profile_bp = Blueprint('profile',__name__)
@profile_bp.route("/",methods = ["GET"])
@jwt_required()
def my_info():
    db = profile_bp.db
    fs = profile_bp.fs
    userID = get_jwt_identity()
    try:
        user = db.users.find_one({"_id": ObjectId(userID)})
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        # Remove sensitive data before returning
        user.pop("password", None)
        
        # Convert ObjectId to string for JSON serialization
        user["_id"] = str(user["_id"])
        if "profile_pic_id" in user and user["profile_pic_id"]:
            fileID = user["profile_pic_id"]
            file = fs.get(ObjectId(fileID))
            if file:
                img_data = file.read()
                encoded_img = base64.b64encode(img_data).decode("utf-8")
                user["profile_pic"] = encoded_img
            else:
                user["profile_pic"] = None
        else:
            user["profile_pic"] = None
            
        user.pop("profile_pic_id",None)
        return jsonify(user),200
    except Exception as e:
                return jsonify({"error": str(e)})

@profile_bp.route("/profile_pic",methods = ["POST"])
@jwt_required()    
def addProfilePic():
    try:
        db = profile_bp.db
        fs = profile_bp.fs
        userID = get_jwt_identity()
        if "profile_pic" not in request.files:
            return jsonify({"error": "No file provided"}), 400
        file = request.files["profile_pic"]
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400
        
        image_data = file.read()
        if not image_data:
            return jsonify({"error": "Empty file"}), 400
        user = db.users.find_one({"_id":ObjectId(userID)})
        if not user:
             return jsonify({"error": "user not found"}),400
        # If user already has a profile picture, delete the old one
        if "profile_pic_id" in user:
            try:
                fs.delete(ObjectId(user["profile_pic_id"]))
            except Exception as e:
                # Log the error but continue with the update
                print(f"Error deleting old profile pic: {str(e)}")
        fileID = fs.put(image_data,filename = file.filename)
        result = db.users.update_one(
            {"_id": ObjectId(userID)},
            {"$set": {"profile_pic_id": ObjectId(fileID)}}
        )
        if result.modified_count == 0:
            return jsonify({"error": "Failed to update user profile"}), 500
        
        return jsonify({
             "message":"profile pic updated successfully",
             "profile_pic_id": str(fileID)
        }),200
    except Exception as e:
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500

