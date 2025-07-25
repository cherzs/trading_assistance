import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import BinanceWebSocket from './binanceWebSocket.js';
import GeminiChat from './geminiChat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

// Initialize Binance WebSocket
const binanceWs = new BinanceWebSocket();
binanceWs.connect();

// Initialize Gemini Chat
const geminiChat = new GeminiChat();

// Endpoint for Gemini chat
app.post('/gemini-chat', async (req, res) => {
    try {
        const { message, sessionId = 'default' } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const bitcoinData = binanceWs.getLatestData();
        const response = await geminiChat.getChatResponse(message, sessionId, bitcoinData);
        
        res.json(response);
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// Endpoint for real-time Bitcoin data
app.get('/bitcoin-data', (req, res) => {
    try {
        const data = binanceWs.getLatestData();
        res.json(data);
    } catch (error) {
        console.error('Bitcoin data error:', error);
        res.status(500).json({ error: 'Failed to fetch Bitcoin data' });
    }
});

// WebSocket endpoint simulation for real-time updates
app.get('/ws-status', (req, res) => {
    res.json(binanceWs.getConnectionStatus());
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            binanceConnected: binanceWs.connected,
            geminiReady: !!geminiChat,
            latestPrice: binanceWs.getLatestData().price
        }
    });
});

// Reset chat session
app.post('/reset-chat', (req, res) => {
    try {
        const { sessionId = 'default' } = req.body;
        geminiChat.resetChatSession(sessionId);
        res.json({ success: true, message: 'Chat session reset' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset chat session' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Binance WebSocket: ${binanceWs.connected ? 'Connected' : 'Disconnected'}`);
    console.log(`🤖 Gemini Chat: Ready`);
    console.log(`💡 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    binanceWs.disconnect();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    binanceWs.disconnect();
    process.exit(0);
}); 