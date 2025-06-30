import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

export default class GeminiChat {
    constructor() {
        this.chatSessions = new Map();
        this.apiKey = process.env.GEMINI_API_KEY;
        this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }

    async getChatResponse(message, sessionId = 'default', bitcoinData) {
        try {
            let chat = this.chatSessions.get(sessionId);
            if (!chat) {
                chat = await this.ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: "Hello, how can I help you today?",
                });
                this.chatSessions.set(sessionId, chat);
            }
            const bitcoinContext = `
                Data Bitcoin Real-time:
                Harga: $${bitcoinData.price}
                24h Tertinggi: $${bitcoinData.high_24h}
                24h Terendah: $${bitcoinData.low_24h}
                Volume: ${bitcoinData.volume} BTC

                Gunakan data di atas untuk memberikan analisis yang lebih akurat.
            `;
            const enhancedMessage = `${bitcoinContext}\n\nUser question: ${message}`;
            const response = await this.ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: enhancedMessage,
            });
            return {
                response: response.text,
                sessionId,
                bitcoinData
            };
        } catch (error) {
            console.error('Error in Gemini chat:', error);
            return {
                response: 'Sorry, there was an error with the AI service.',
                sessionId,
                bitcoinData
            };
        }
    }
} 