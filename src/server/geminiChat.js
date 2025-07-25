import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

export default class GeminiChat {
    constructor() {
        this.chatSessions = new Map();
        this.apiKey = process.env.GEMINI_API_KEY;
        
        if (!this.apiKey) {
            console.log('⚠️  No valid Gemini API key found. Using mock trading responses.');
            this.useMockResponses = true;
        } else {
            try {
                // Initialize the new Gemini API client
                this.ai = new GoogleGenAI({});
                this.useMockResponses = false;
                console.log('✅ Gemini AI configured successfully with model: gemini-2.5-flash');
            } catch (error) {
                console.log('⚠️  Error configuring Gemini AI:', error.message);
                this.useMockResponses = true;
            }
        }
    }

    async getChatResponse(message, sessionId = 'default', bitcoinData) {
        try {
            if (this.useMockResponses) {
                return this.getMockResponse(message, sessionId, bitcoinData);
            }

            // Get or create chat history for this session
            let chatHistory = this.chatSessions.get(sessionId) || [];
            
            // Build context with market data and chat history
            const marketContext = bitcoinData ? `
Current Market Data:
- Bitcoin Price: $${bitcoinData.price.toLocaleString()}
- 24h Change: ${bitcoinData.change_24h.toFixed(2)}%
- 24h High: $${bitcoinData.high_24h.toLocaleString()}
- 24h Low: $${bitcoinData.low_24h.toLocaleString()}
- Volume: ${bitcoinData.volume.toFixed(2)} BTC

` : '';

            const systemPrompt = `You are an expert AI Trading Assistant specializing in cryptocurrency and financial markets. 

${marketContext}

Your role:
- Provide professional trading analysis and insights
- Use current market data in your responses when relevant
- Give practical, actionable advice
- Focus on risk management and education
- Keep responses concise but informative
- Never provide financial advice as investment recommendations

Previous conversation context:
${chatHistory.slice(-4).map(h => `${h.role}: ${h.content}`).join('\n')}

User's current question: ${message}`;

            // Generate response using the new API
            const response = await this.ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: systemPrompt,
                config: {
                    thinkingConfig: {
                        thinkingBudget: 0, // Disable thinking for faster responses
                    },
                    temperature: 0.7,
                    maxOutputTokens: 500,
                }
            });

            const aiResponse = response.text;
            
            // Update chat history
            chatHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: aiResponse }
            );
            
            // Keep only last 10 exchanges (20 messages)
            if (chatHistory.length > 20) {
                chatHistory = chatHistory.slice(-20);
            }
            
            this.chatSessions.set(sessionId, chatHistory);

            return {
                response: `${aiResponse}\n\n*Powered by Gemini 2.5 Flash*`,
                sessionId,
                bitcoinData
            };
            
        } catch (error) {
            console.error('Error in Gemini chat:', error);
            console.log('🔄 Falling back to mock responses due to API error');
            return this.getMockResponse(message, sessionId, bitcoinData);
        }
    }

    getMockResponse(message, sessionId, bitcoinData) {
        const lowerMessage = message.toLowerCase();
        
        // Context-aware responses based on current market data
        const currentPrice = bitcoinData ? bitcoinData.price : 43500;
        const change24h = bitcoinData ? bitcoinData.change_24h : 2.5;
        const isUp = change24h > 0;
        const trend = isUp ? 'bullish' : 'bearish';
        
        // Advanced trading analysis responses
        if (lowerMessage.includes('btc') || lowerMessage.includes('bitcoin')) {
            return {
                response: `📊 **Bitcoin Analysis**\n\nCurrent Price: $${currentPrice.toLocaleString()}\n24h Change: ${change24h.toFixed(2)}%\n\nTechnical Outlook: The ${trend} sentiment suggests ${isUp ? 'upward momentum with potential for continued gains' : 'some consolidation or correction may be due'}. Key levels to watch:\n\n• Support: $${(currentPrice * 0.95).toFixed(0)}\n• Resistance: $${(currentPrice * 1.05).toFixed(0)}\n\n⚡ **Trading Tip**: Always use proper risk management and consider dollar-cost averaging for long-term positions.\n\n🤖 *Demo Mode - Enhanced trading analysis*`,
                sessionId,
                bitcoinData
            };
        }
        
        if (lowerMessage.includes('eth') || lowerMessage.includes('ethereum')) {
            return {
                response: `🔷 **Ethereum Analysis**\n\nETH remains a cornerstone of DeFi and smart contract ecosystems. Current market dynamics:\n\n• **Fundamentals**: Strong development activity and Layer 2 adoption\n• **Technical**: Watch $3,000 support and $3,500 resistance\n• **Catalogs**: Upcoming upgrades and institutional adoption\n\n**Strategy Suggestions**:\n1. DCA for long-term exposure\n2. Monitor gas fees and network usage\n3. Consider staking rewards (4-6% APY)\n\n⚠️ Remember: Past performance doesn't guarantee future results.\n\n🤖 *Demo Mode - Professional analysis*`,
                sessionId,
                bitcoinData
            };
        }
        
        if (lowerMessage.includes('strategy') || lowerMessage.includes('how to trade')) {
            return {
                response: `📈 **Professional Trading Strategy Framework**\n\n**1. Risk Management** (Most Important)\n• Never risk more than 1-2% per trade\n• Use stop-losses religiously\n• Position sizing based on volatility\n\n**2. Technical Analysis**\n• Support/Resistance levels\n• Moving averages (20, 50, 200)\n• Volume confirmation\n• RSI and MACD signals\n\n**3. Fundamental Analysis**\n• News and market sentiment\n• On-chain metrics\n• Institutional flows\n\n**4. Psychology**\n• Stick to your plan\n• Avoid FOMO\n• Take profits systematically\n\n💡 **Pro Tip**: Start with paper trading to test your strategies!\n\n🤖 *Demo Mode - Expert guidance*`,
                sessionId,
                bitcoinData
            };
        }
        
        if (lowerMessage.includes('analysis') || lowerMessage.includes('technical')) {
            return {
                response: `📊 **Technical Analysis Insights**\n\nBased on current market conditions (BTC: $${currentPrice.toLocaleString()}):\n\n**Chart Patterns**:\n• ${isUp ? 'Ascending triangle formation' : 'Descending wedge pattern'}\n• Volume ${isUp ? 'supporting the move' : 'declining with price'}\n\n**Key Indicators**:\n• RSI: ${isUp ? 'Approaching overbought (>70)' : 'Near oversold (<30)'}\n• MACD: ${isUp ? 'Bullish crossover signal' : 'Bearish divergence forming'}\n• Moving Averages: Price ${isUp ? 'above' : 'below'} key EMAs\n\n**Actionable Levels**:\n• Entry: $${(currentPrice * (isUp ? 0.98 : 1.02)).toFixed(0)}\n• Stop: $${(currentPrice * (isUp ? 0.95 : 1.05)).toFixed(0)}\n• Target: $${(currentPrice * (isUp ? 1.08 : 0.92)).toFixed(0)}\n\n🎯 **Risk/Reward**: 1:2 ratio\n\n🤖 *Demo Mode - Technical expertise*`,
                sessionId,
                bitcoinData
            };
        }
        
        if (lowerMessage.includes('risk') || lowerMessage.includes('management')) {
            return {
                response: `🛡️ **Risk Management Essentials**\n\n**Position Sizing Rules**:\n• Max 1-2% account risk per trade\n• Diversify across 5-10 positions\n• Adjust size based on volatility\n\n**Stop Loss Strategy**:\n• Technical stops at key levels\n• Trailing stops for trend following\n• Time-based stops for swing trades\n\n**Portfolio Protection**:\n• Hedge with inverse positions\n• Cash reserves for opportunities\n• Rebalance monthly\n\n**Psychology Tips**:\n• Write down your plan BEFORE trading\n• Never average down on losing trades\n• Take profits systematically\n\n**Current Market Risk**: ${isUp ? 'Moderate (trending up)' : 'High (trending down)'}\n\n⚖️ **Remember**: Preserve capital first, profits second!\n\n🤖 *Demo Mode - Risk expertise*`,
                sessionId,
                bitcoinData
            };
        }
        
        // Enhanced general responses
        const advancedResponses = [
            `🎯 **Market Overview**\n\nCurrent Bitcoin: $${currentPrice.toLocaleString()} (${change24h.toFixed(2)}%)\n\nMarket sentiment appears ${trend} with ${isUp ? 'buyers stepping in at dips' : 'sellers maintaining pressure'}. This creates opportunities for:\n\n• ${isUp ? 'Momentum plays on breakouts' : 'Contrarian plays at support'}\n• Range trading strategies\n• DCA accumulation plans\n\nWhat specific aspect interests you most?`,
            
            `📚 **Trading Education Focus**\n\nSuccess in trading comes from mastering these core areas:\n\n1. **Technical Analysis** - Chart patterns, indicators\n2. **Risk Management** - Position sizing, stops\n3. **Psychology** - Discipline, emotional control\n4. **Market Structure** - Understanding price action\n\nCurrent market ($${currentPrice.toLocaleString()}) offers great learning opportunities. Which area would you like to explore?`,
            
            `⚡ **Real-Time Analysis**\n\nBTC Price Action: $${currentPrice.toLocaleString()}\nTrend: ${isUp ? '📈 Bullish momentum' : '📉 Bearish pressure'}\n\nKey Observations:\n• Volume: ${isUp ? 'Confirming the move' : 'Declining with price'}\n• Sentiment: ${isUp ? 'Risk-on environment' : 'Risk-off conditions'}\n• Opportunity: ${isUp ? 'Breakout potential' : 'Oversold bounce setup'}\n\nWhat's your trading question?`
        ];
        
        const randomResponse = advancedResponses[Math.floor(Math.random() * advancedResponses.length)];
        
        return {
            response: `${randomResponse}\n\n🤖 *Demo Mode - Professional trading insights*`,
            sessionId,
            bitcoinData
        };
    }

    resetChatSession(sessionId) {
        this.chatSessions.delete(sessionId);
        console.log(`🔄 Chat session ${sessionId} reset`);
    }
} 