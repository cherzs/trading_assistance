import google.generativeai as genai
from flask import Blueprint, request, jsonify
import os
import traceback
import logging
from dotenv import load_dotenv
import websocket
import json
import time
import threading
import ssl
from app import latest_bitcoin_data  

gemini_bp = Blueprint('gemini', __name__)
load_dotenv()

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Gemini
try:
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in .env file")
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-pro")
    logger.info("Gemini API successfully initialized")
except Exception as e:
    logger.error(f"Failed to initialize Gemini API: {str(e)}")
    raise

chat_sessions = {}

@gemini_bp.route('/gemini-chat', methods=['POST'])
def chat_endpoint():
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.json
        if not data or 'message' not in data:
            return jsonify({'error': 'Message not found'}), 400
            
        message = data.get('message')
        session_id = data.get('session_id', 'default')
        
        # Initialize chat without system role
        if session_id not in chat_sessions:
            chat_sessions[session_id] = model.start_chat()
        
        # Tambahkan data Bitcoin ke dalam prompt
        bitcoin_context = f"""
        Data Bitcoin Real-time:
        Harga: ${latest_bitcoin_data['price']}
        24h Tertinggi: ${latest_bitcoin_data['high_24h']}
        24h Terendah: ${latest_bitcoin_data['low_24h']}
        Volume: {latest_bitcoin_data['volume']} BTC
        
        Gunakan data di atas untuk memberikan analisis yang lebih akurat.
        """
        
        # Gabungkan pesan user dengan context
        enhanced_message = f"{bitcoin_context}\n\nUser question: {message}"
        
        chat = chat_sessions[session_id]
        response = chat.send_message(enhanced_message)
        
        return jsonify({
            'response': response.text,
            'session_id': session_id,
            'bitcoin_data': latest_bitcoin_data  # Kirim data Bitcoin ke frontend
        })
        
    except Exception as e:
        error_msg = f"Error: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_msg)
        return jsonify({'error': str(e)}), 500 