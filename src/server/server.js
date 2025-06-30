import express from 'express';
import cors from 'cors';
import BinanceWebSocket from './binanceWebSocket.js';
import GeminiChat from './geminiChat.js';

const app = express();
app.use(cors());
app.use(express.json());

// Inisialisasi Binance WebSocket (stub)
const binanceWs = new BinanceWebSocket();
binanceWs.connect();

// Inisialisasi Gemini Chat (stub)
const geminiChat = new GeminiChat();

// Endpoint chat
app.post('/gemini-chat', async (req, res) => {
    try {
        const { message, sessionId = 'default' } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message not found' });
        }
        const bitcoinData = binanceWs.getLatestData();
        const response = await geminiChat.getChatResponse(message, sessionId, bitcoinData);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        binanceConnected: binanceWs.connected,
        latestData: binanceWs.getLatestData()
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 