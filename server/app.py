from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from dotenv import load_dotenv
import os
from preprocess import preprocess,extract_text,ai_extract
import gridfs
app = Flask(__name__)



try:
    app.config['MONGO_URI'] = os.getenv('MONGO_URI')
    mongo = PyMongo(app)
    db = mongo.db  
    fs = gridfs.GridFS(db)
    print("MongoDB connection successful")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    db = None  

@app.route('/')
def hello():
    return "<h1>Welcome to Reciept Reader </h1>"
    
@app.route('/newEntry', methods=['POST'])
def upload():
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
    
    

    
   
    


if __name__ == "__main__":
    app.run(debug=True)
