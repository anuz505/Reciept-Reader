from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required,get_jwt_identity
from services.preprocess import preprocess,extract_text,ai_extract
from bson import ObjectId
import base64

reciept_bp = Blueprint('reciept',__name__)
@reciept_bp.route('/newEntry',methods = ["POST"])
@jwt_required()
def upload():
    db = reciept_bp.db
    fs = reciept_bp.fs
    userID  = get_jwt_identity()

    if 'image' not in request.files:
        return 'no file'
    file = request.files['image']  
    if file.filename == '':
        return "No selected file"
    
    image_data = file.read()
    fileID = fs.put(image_data, filename=file.filename)
    if not image_data:
        return 'Empty file'
    try:
        img = preprocess(image_data)
        extracted_txt = extract_text(img)
        extracted_data = ai_extract(extracted_txt)  
        print(extracted_data)
        
    except Exception as e:
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500

   

    if "error" in extracted_data:
                return (extracted_data),400

    response_data = {
        "data": extracted_data,
        "fileID": ObjectId(fileID),
        "user_id": ObjectId(userID)  
        }

    

    if db is not None:  # Use `is not None` instead of `if db`
        try:
            if "error" in response_data:
                return (response_data),400
            
            db.inventory.insert_one(response_data)
            
            return jsonify({"message": "Insertion successful"})
        except Exception as e:
            print(f"Error inserting document: {e}")
            return jsonify({"error": str(e)})
    else:
        return jsonify({"error": "Database connection error"})
    
@reciept_bp.route('/allEntries',methods = ["GET"])
@jwt_required()
def getAllEntries():
    try:
        userID = get_jwt_identity()
        db = reciept_bp.db
        
        entries = db.inventory.find({"user_id": ObjectId(userID)})
        return jsonify([entry for entry in entries])
        # return jsonify([entry for entry in db.inventory.find({})])
    except Exception as e:
        return jsonify({"error": str(e)})
    
@reciept_bp.route('/deleteEntry', methods=["DELETE"])
@jwt_required()
def deleteEntry():
    try:
        db = reciept_bp.db
        fs = reciept_bp.fs
        id = request.args.get('id')
        
        # Use find_one to get a single document instead of a cursor
        receipt = db.inventory.find_one({"_id": ObjectId(id)})
        
        if not receipt:
            return jsonify({"error": "Receipt not found"}), 404
        
        # Get the fileID from the document
        file_id = receipt.get("fileID")
        
        # Delete the document from inventory collection
        delete_result = db.inventory.delete_one({"_id": ObjectId(id)})
        
        # Now delete the file from GridFS using the fileID
        if file_id:
            fs.delete(file_id)
        
        return jsonify({
            "message": "Receipt and associated file deleted successfully",
            "deleted_count": delete_result.deleted_count
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@reciept_bp.route('/selectEntry',methods = ["GET"])
@jwt_required()
def selectEntry():
    try:
        db = reciept_bp.db
        id = request.args.get('id')
        return db.inventory.find_one({"_id":id})
    except Exception as e:
        return jsonify({"error": str(e)})
    
@reciept_bp.route("/reciept_img",methods=["GET"])
# @jwt_required()
def reciept_img():
    try:
        fs = reciept_bp.fs
        id = request.args.get('id')
        if not id:
            return jsonify({"error": "ID parameter is required"}), 400

        file = fs.get(ObjectId(id))
        if not file:
            return jsonify({"error": "File not found"}), 404
        img_data = file.read()
        encoded_image = base64.b64encode(img_data).decode('utf-8')
        return jsonify({"image": encoded_image}), 200



    except Exception as e:
        return jsonify({"error":str(e)})
        