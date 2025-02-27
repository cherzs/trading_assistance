import websocket
import json
import time
import threading
import ssl
from flask import Flask
from flask_cors import CORS
from gemini_chat import gemini_bp

class BinanceWebSocket:
    def __init__(self):
        self.ws = None
        self.connected = False
        self.last_ping = 0
        
    def connect(self):
        websocket.enableTrace(True)  # Untuk debugging
        
        # Gunakan endpoint alternatif dan tambahkan opsi SSL
        self.ws = websocket.WebSocketApp(
            "wss://data-stream.binance.vision/ws",  # Endpoint alternatif
            on_message=self.on_message,
            on_error=self.on_error,
            on_close=self.on_close,
            on_open=self.on_open,
            on_ping=self.on_ping,
            on_pong=self.on_pong
        )
        
        # Tambahkan opsi SSL
        ws_thread = threading.Thread(target=lambda: self.ws.run_forever(
            sslopt={"cert_reqs": ssl.CERT_NONE}
        ))
        ws_thread.daemon = True
        ws_thread.start()

    def on_message(self, ws, message):
        try:
            data = json.loads(message)
            # Handle different types of messages
            if "e" in data:
                if data["e"] == "trade":
                    self.handle_trade(data)
                elif data["e"] == "24hrMiniTicker":
                    self.handle_mini_ticker(data)
                elif data["e"] == "kline":
                    self.handle_kline(data)
        except Exception as e:
            print(f"Error processing message: {e}")

    def handle_trade(self, data):
        print(f"""
Trade Event:
Symbol: {data['s']}
Price: {data['p']}
Quantity: {data['q']}
Time: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(data['T']/1000))}
        """)

    def handle_mini_ticker(self, data):
        print(f"""
24hr Mini Ticker:
Symbol: {data['s']}
Close Price: {data['c']}
Open Price: {data['o']}
High Price: {data['h']}
Low Price: {data['l']}
        """)

    def handle_kline(self, data):
        k = data['k']
        print(f"""
Kline/Candlestick:
Symbol: {data['s']}
Interval: {k['i']}
Open: {k['o']}
High: {k['h']}
Low: {k['l']}
Close: {k['c']}
Volume: {k['v']}
        """)

    def on_error(self, ws, error):
        print(f"WebSocket Error Details:")
        print(f"Error Type: {type(error)}")
        print(f"Error Message: {str(error)}")
        if hasattr(error, 'errno'):
            print(f"Error Number: {error.errno}")
        if hasattr(error, 'strerror'):
            print(f"Error String: {error.strerror}")

    def on_close(self, ws, close_status_code, close_msg):
        print("WebSocket Connection Closed")
        self.connected = False

    def on_open(self, ws):
        print("WebSocket Connection Opened")
        self.connected = True
        self.subscribe_streams()

    def on_ping(self, ws, message):
        print("Ping received")
        self.last_ping = time.time()
        # Send pong back immediately
        ws.send_pong(message)

    def on_pong(self, ws, message):
        print("Pong received")

    def subscribe_streams(self):
        # Subscribe to multiple streams
        subscribe_message = {
            "method": "SUBSCRIBE",
            "params": [
                "btcusdt@trade",        # Trade stream
                "btcusdt@miniTicker",   # 24hr Mini Ticker
                "btcusdt@kline_1m"      # 1 minute kline/candlestick
            ],
            "id": 1
        }
        self.ws.send(json.dumps(subscribe_message))

    def unsubscribe_streams(self):
        if self.connected:
            unsubscribe_message = {
                "method": "UNSUBSCRIBE",
                "params": [
                    "btcusdt@trade",
                    "btcusdt@miniTicker",
                    "btcusdt@kline_1m"
                ],
                "id": 2
            }
            self.ws.send(json.dumps(unsubscribe_message))

    def close(self):
        if self.connected:
            self.unsubscribe_streams()
            self.ws.close()

app = Flask(__name__)
CORS(app)  # Tambahkan ini untuk menangani CORS

app.register_blueprint(gemini_bp)

if __name__ == '__main__':
    app.run(debug=True, port=5000)