from flask import Blueprint, request, jsonify

from services.preprocess import preprocess,extract_text,ai_extract

reciept_bp = Blueprint('reciept',__name__)
@reciept_bp.route('/newEntry',methods = ["POST"])
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
def getAllEntries():
    try:
        db = reciept_bp.db
        
        return list(db.inventory.find({}))
    except Exception as e:
        return jsonify({"error": str(e)})
        