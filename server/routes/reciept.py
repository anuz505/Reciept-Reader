from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.preprocess import preprocess,extract_text,ai_extract

reciept_bp = Blueprint('reciept',__name__)
@reciept_bp.route('/newEntry',methods = ["POST"])
@jwt_required()
def upload():
    db = reciept_bp.db
    fs = reciept_bp.fs
    if 'image' not in request.files:
        return 'no file'
    file = request.files['image']  
    if file.filename == '':
        return "No selected file"
    
    image_data = file.read()
    fileID = fs.put(image_data, filename=file.filename)
    print(image_data)
    if not image_data:
        return 'Empty file'
    img = preprocess(image_data)
    extracted_txt = extract_text(img)
    json = ai_extract(extracted_txt)
    if db is not None:  # Use `is not None` instead of `if db`
        try:
            db.inventory.insert_one(json)
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
        db = reciept_bp.db
        
        return list(db.inventory.find({}))
    except Exception as e:
        return jsonify({"error": str(e)})
    
@reciept_bp.route('/deleteEntry',methods = ["DELETE"])
@jwt_required()
def deleteEntry():
    try:
        db = reciept_bp.db
        id = request.args.get('id')
        db.inventory.delete_one({"_id":id})
        return jsonify({"message": "Deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)})
    
@reciept_bp.route('/selectEntry',methods = ["GET"])
@jwt_required()
def selectEntry():
    try:
        db = reciept_bp.db
        id = request.args.get('id')
        return db.inventory.find_one({"_id":id})
    except Exception as e:
        return jsonify({"error": str(e)})
        