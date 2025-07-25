import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import { fileURLToPath } from 'url';
import BinanceWebSocket from './binanceWebSocket.js';
import GeminiChat from './geminiChat.js';
import passport, { generateToken, requireAuth, optionalAuth, prisma } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Initialize Binance WebSocket
const binanceWs = new BinanceWebSocket();
binanceWs.connect();

// Initialize Gemini Chat
const geminiChat = new GeminiChat();

// Authentication Routes
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
        try {
            const token = generateToken(req.user);
            // Redirect to frontend with token
            res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:5173'}?token=${token}&user=${encodeURIComponent(JSON.stringify({
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                picture: req.user.picture
            }))}`);
        } catch (error) {
            console.error('Callback error:', error);
            res.redirect('/login?error=auth_failed');
        }
    }
);

app.post('/auth/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

app.get('/auth/me', requireAuth, (req, res) => {
    res.json({
        user: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            picture: req.user.picture,
            lastLogin: req.user.lastLogin
        }
    });
});

// Endpoint for Gemini chat (with optional auth)
app.post('/gemini-chat', optionalAuth, async (req, res) => {
    try {
        const { message, sessionId = 'default' } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Use user-specific session if authenticated
        const actualSessionId = req.user ? `${req.user.id}-${sessionId}` : sessionId;

        const bitcoinData = binanceWs.getLatestData();
        const response = await geminiChat.getChatResponse(message, actualSessionId, bitcoinData);
        
        // Save chat session to database if user is authenticated
        if (req.user) {
            try {
                await prisma.chatSession.upsert({
                    where: { sessionId: actualSessionId },
                    update: {
                        messages: {
                            push: [
                                { role: 'user', content: message, timestamp: new Date() },
                                { role: 'assistant', content: response.response, timestamp: new Date() }
                            ]
                        },
                        updatedAt: new Date()
                    },
                    create: {
                        userId: req.user.id,
                        sessionId: actualSessionId,
                        messages: [
                            { role: 'user', content: message, timestamp: new Date() },
                            { role: 'assistant', content: response.response, timestamp: new Date() }
                        ]
                    }
                });
            } catch (dbError) {
                console.error('Database save error:', dbError);
                // Continue without failing the chat response
            }
        }
        
        res.json(response);
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// User chat history
app.get('/chat/history', requireAuth, async (req, res) => {
    try {
        const sessions = await prisma.chatSession.findMany({
            where: { userId: req.user.id },
            orderBy: { updatedAt: 'desc' },
            take: 10
        });
        
        res.json({ sessions });
    } catch (error) {
        console.error('Chat history error:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
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
            latestPrice: binanceWs.getLatestData().price,
            database: 'connected'
        }
    });
});

// CoinMarketCap symbols endpoint for frontend
app.get('/api/symbols', async (req, res) => {
    try {
        console.log('[Server] Loading symbols from CoinMarketCap API...');
        
        const apiKey = process.env.VITE_COINMARKETCAP_API_KEY || "b5d8b711-5d50-4eb4-8d50-7b89bf246372";
        
        const headers = {
            'X-CMC_PRO_API_KEY': apiKey,
            'Accept': 'application/json',
            'Accept-Encoding': 'deflate, gzip'
        };
        
        const response = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=100&convert=USD&sort=market_cap', { headers });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.data) {
            throw new Error('Invalid response from CoinMarketCap listings API');
        }

        const symbols = [];

        // Create symbols from active listings
        data.data.forEach(crypto => {
            // Main USD pair
            symbols.push({
                symbol: `${crypto.symbol}/USD`,
                full_name: `CMC:${crypto.symbol}/USD`,
                description: `${crypto.name} (${crypto.symbol})`,
                exchange: 'CMC',
                type: 'crypto',
                id: crypto.id,
                name: crypto.name,
                market_cap: crypto.quote.USD.market_cap,
                price: crypto.quote.USD.price,
                rank: crypto.cmc_rank
            });

            // Add popular quote currencies for top 20
            if (crypto.cmc_rank <= 20) {
                const quoteCurrencies = ['EUR', 'BTC', 'ETH'];
                quoteCurrencies.forEach(quote => {
                    if (quote !== crypto.symbol) {
                        symbols.push({
                            symbol: `${crypto.symbol}/${quote}`,
                            full_name: `CMC:${crypto.symbol}/${quote}`,
                            description: `${crypto.name} to ${quote}`,
                            exchange: 'CMC',
                            type: 'crypto',
                            id: crypto.id,
                            name: crypto.name,
                            rank: crypto.cmc_rank
                        });
                    }
                });
            }
        });

        // Sort by market cap rank
        symbols.sort((a, b) => (a.rank || 999999) - (b.rank || 999999));

        console.log(`[Server] Loaded ${symbols.length} symbols from CoinMarketCap`);
        
        res.json({ 
            symbols,
            count: symbols.length,
            source: 'CoinMarketCap Pro API'
        });
    } catch (error) {
        console.error('[Server] Error fetching symbols:', error);
        
        // Fallback symbols
        const fallbackSymbols = [
            { symbol: 'BTC/USD', full_name: 'CMC:BTC/USD', description: 'Bitcoin (BTC)', exchange: 'CMC', type: 'crypto', id: 1, name: 'Bitcoin', rank: 1, price: 115000 },
            { symbol: 'ETH/USD', full_name: 'CMC:ETH/USD', description: 'Ethereum (ETH)', exchange: 'CMC', type: 'crypto', id: 1027, name: 'Ethereum', rank: 2, price: 3600 },
            { symbol: 'USDT/USD', full_name: 'CMC:USDT/USD', description: 'Tether (USDT)', exchange: 'CMC', type: 'crypto', id: 825, name: 'Tether', rank: 3, price: 1.0 },
            { symbol: 'BNB/USD', full_name: 'CMC:BNB/USD', description: 'BNB (BNB)', exchange: 'CMC', type: 'crypto', id: 1839, name: 'BNB', rank: 4, price: 350 },
            { symbol: 'SOL/USD', full_name: 'CMC:SOL/USD', description: 'Solana (SOL)', exchange: 'CMC', type: 'crypto', id: 5426, name: 'Solana', rank: 5, price: 120 },
            { symbol: 'XRP/USD', full_name: 'CMC:XRP/USD', description: 'XRP (XRP)', exchange: 'CMC', type: 'crypto', id: 52, name: 'XRP', rank: 7, price: 3.0 }
        ];
        
        res.status(500).json({ 
            error: 'Failed to fetch symbols',
            symbols: fallbackSymbols,
            count: fallbackSymbols.length,
            source: 'Fallback data'
        });
    }
});

// Add legacy /symbols endpoint (redirect to /api/symbols)
app.get('/symbols', (req, res) => {
    res.redirect('/api/symbols');
});

// Basic test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Trading Assistant API is running',
        timestamp: new Date().toISOString()
    });
});

// Reset chat session (with optional auth)
app.post('/reset-chat', optionalAuth, async (req, res) => {
    try {
        const { sessionId = 'default' } = req.body;
        const actualSessionId = req.user ? `${req.user.id}-${sessionId}` : sessionId;
        
        geminiChat.resetChatSession(actualSessionId);
        
        // Clear from database if user is authenticated
        if (req.user) {
            await prisma.chatSession.deleteMany({
                where: {
                    userId: req.user.id,
                    sessionId: actualSessionId
                }
            });
        }
        
        res.json({ success: true, message: 'Chat session reset' });
    } catch (error) {
        console.error('Reset chat error:', error);
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
    console.log(`🚀Server running on port ${PORT}`);
    console.log(`📊 Binance WebSocket: ${binanceWs.connected ? 'Connected' : 'Disconnected'}`);
    console.log(`🤖 Gemini Chat: Ready`);
    console.log(`🔐 Authentication: Google OAuth Enabled`);
    console.log(`💾 Database: PostgreSQL Connected`);
    console.log(`💡 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    binanceWs.disconnect();
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    binanceWs.disconnect();
    await prisma.$disconnect();
    process.exit(0);
}); 