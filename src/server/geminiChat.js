import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default class GeminiChat {
    constructor() {
        this.chatSessions = new Map();
        this.apiKey = process.env.GEMINI_API_KEY;
        
        if (!this.apiKey) {
            console.warn('Warning: Gemini API key not found. Using mock responses.');
            this.useMockResponses = true;
        } else {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
            this.useMockResponses = false;
        }
    }

    async getChatResponse(message, sessionId = 'default', bitcoinData) {
        try {
            if (this.useMockResponses) {
                return this.getMockResponse(message, sessionId, bitcoinData);
            }

            let chat = this.chatSessions.get(sessionId);
            if (!chat) {
                chat = this.model.startChat({
                    history: [
                        {
                            role: "user",
                            parts: [{ text: "You are an AI trading assistant. Help users with trading questions and analysis." }],
                        },
                        {
                            role: "model",
                            parts: [{ text: "Hello! I'm your AI Trading Assistant. I can help you with trading analysis, market insights, and answer questions about cryptocurrencies and trading strategies. How can I assist you today?" }],
                        },
                    ],
                });
                this.chatSessions.set(sessionId, chat);
            }

            const bitcoinContext = bitcoinData ? `
                Current Market Data:
                Price: $${bitcoinData.price}
                24h High: $${bitcoinData.high_24h}
                24h Low: $${bitcoinData.low_24h}
                Volume: ${bitcoinData.volume} BTC
                24h Change: ${bitcoinData.change_24h.toFixed(2)}%

                Use this data to provide more accurate analysis.
                ` : '';

            const enhancedMessage = `${bitcoinContext}\n\nUser question: ${message}`;
            
            const result = await chat.sendMessage(enhancedMessage);
            const response = await result.response;
            
            return {
                response: response.text(),
                sessionId,
                bitcoinData
            };
        } catch (error) {
            console.error('Error in Gemini chat:', error);
            return this.getMockResponse(message, sessionId, bitcoinData);
        }
    }

    getMockResponse(message, sessionId, bitcoinData) {
        const lowerMessage = message.toLowerCase();
        
        // Context-aware responses based on current market data
        const currentPrice = bitcoinData ? bitcoinData.price : 43500;
        const change24h = bitcoinData ? bitcoinData.change_24h : 2.5;
        const isUp = change24h > 0;
        
        // Intelligent response matching
        if (lowerMessage.includes('btc') || lowerMessage.includes('bitcoin')) {
            return {
                response: `Based on current market data, Bitcoin is trading at $${currentPrice.toLocaleString()} with a ${isUp ? 'positive' : 'negative'} 24h change of ${change24h.toFixed(2)}%. ${isUp ? 'The upward momentum suggests bullish sentiment' : 'The downward pressure indicates some market caution'}. Always consider risk management and do your own research before making trading decisions.`,
                sessionId,
                bitcoinData
            };
        }
        
        if (lowerMessage.includes('eth') || lowerMessage.includes('ethereum')) {
            return {
                response: `Ethereum remains a strong fundamental play in the crypto market. With ongoing developments in Layer 2 scaling and the transition to Proof of Stake, ETH continues to be a cornerstone of DeFi. Current market trends suggest watching key support levels around $3,000-$3,200. Remember to diversify your portfolio and never invest more than you can afford to lose.`,
                sessionId,
                bitcoinData
            };
        }
        
        if (lowerMessage.includes('buy') || lowerMessage.includes('sell') || lowerMessage.includes('trade')) {
            return {
                response: `For trading decisions, I recommend considering these factors: 1) Technical analysis (support/resistance levels), 2) Market sentiment and news, 3) Risk management (stop losses, position sizing), 4) Time horizon for your trade. Currently, with Bitcoin at $${currentPrice.toLocaleString()}, watch for breakouts above recent highs or support at key levels. Always use proper risk management!`,
                sessionId,
                bitcoinData
            };
        }
        
        if (lowerMessage.includes('predict') || lowerMessage.includes('forecast') || lowerMessage.includes('future')) {
            return {
                response: `While I can't predict exact price movements, I can share some analysis: Current market conditions show ${isUp ? 'positive momentum' : 'consolidation patterns'}. Key factors to watch include: institutional adoption, regulatory news, and overall market sentiment. The crypto market is highly volatile - focus on trends rather than trying to time exact entries and exits.`,
                sessionId,
                bitcoinData
            };
        }
        
        if (lowerMessage.includes('strategy') || lowerMessage.includes('how') || lowerMessage.includes('start')) {
            return {
                response: `Here's a solid trading strategy framework: 1) Start with education - understand markets and risk, 2) Use dollar-cost averaging for long-term positions, 3) Set clear entry/exit rules, 4) Never risk more than 1-2% per trade, 5) Keep emotions in check with predetermined plans. For beginners, consider starting with major cryptocurrencies like BTC and ETH before exploring altcoins.`,
                sessionId,
                bitcoinData
            };
        }
        
        if (lowerMessage.includes('risk') || lowerMessage.includes('loss') || lowerMessage.includes('safe')) {
            return {
                response: `Risk management is crucial in trading! Key principles: 1) Never invest more than you can afford to lose, 2) Use stop-loss orders to limit downside, 3) Diversify across different assets, 4) Position sizing - keep individual trades small relative to your portfolio, 5) Avoid FOMO (fear of missing out). The crypto market can be very volatile, so preparation and discipline are essential.`,
                sessionId,
                bitcoinData
            };
        }
        
        if (lowerMessage.includes('technical') || lowerMessage.includes('analysis') || lowerMessage.includes('chart')) {
            return {
                response: `Technical analysis helps identify trends and potential entry/exit points. Key concepts: 1) Support and resistance levels, 2) Moving averages (20, 50, 200-day), 3) Volume analysis, 4) Chart patterns (triangles, flags, head & shoulders), 5) Momentum indicators (RSI, MACD). Currently, you can use the chart tools above to practice identifying these patterns on real market data.`,
                sessionId,
                bitcoinData
            };
        }
        
        // General responses for other queries
        const generalResponses = [
            `Great question! The crypto market is dynamic and always evolving. With Bitcoin currently at $${currentPrice.toLocaleString()}, we're seeing ${isUp ? 'bullish' : 'cautious'} sentiment. What specific aspect of trading would you like to explore?`,
            
            `I'm here to help with your trading questions! Whether you're interested in technical analysis, risk management, or market trends, feel free to ask. The current market data shows interesting patterns worth discussing.`,
            
            `Trading success comes from continuous learning and disciplined execution. With the current market conditions, it's a good time to review your strategy and risk management. What trading topic interests you most?`,
            
            `The cryptocurrency market offers many opportunities, but requires careful analysis. Current price action suggests ${isUp ? 'positive momentum' : 'consolidation'}. Would you like to discuss any specific trading strategies or coins?`,
            
            `Education is the foundation of successful trading. From understanding market cycles to implementing proper risk management, there's always more to learn. What aspect of trading would you like to dive deeper into?`
        ];
        
        const randomResponse = generalResponses[Math.floor(Math.random() * generalResponses.length)];
        
        return {
            response: `${randomResponse}${demoNote}`,
            sessionId,
            bitcoinData
        };
    }

    resetChatSession(sessionId) {
        this.chatSessions.delete(sessionId);
    }
} 