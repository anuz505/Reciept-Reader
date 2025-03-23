import cv2
import pytesseract
import google.generativeai as genai
from dotenv import load_dotenv
import os
import numpy as np
load_dotenv()
import json

def preprocess(img):
    if isinstance(img, bytes):
        np_img = np.frombuffer(img, np.uint8)
        if np_img.size == 0:
            raise ValueError("Empty image data")
        image = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError("Failed to decode image")
    else:
        image = img    
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Apply threshold
    _, threshold = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return threshold

def extract_text(img):
    return pytesseract.image_to_string(img)

genai.configure(api_key=os.getenv("API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

def ai_extract(text):
    prompt = """ You are a reciept parser AI. I am going to provide you with text from a reciept and I want you to extract the following information in the this structure: {'total','bussiness','items':[{'name','price','quantity'}],'address'} also if you cannot extract the requested information from the provided text then respond with something short. """
    response = model.generate_content(prompt + text)
    response_text = response.text.strip().replace("```json","").strip().replace("```","")
    try:
        response_json = json.loads(response_text)
    except json.JSONDecodeError as e:
        print(f"error Decoding JSON {e}")
        response_json = {"error": "Failed to parse AI response and"+ response.text}
    return response_json



