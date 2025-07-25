# Trading Assistant - AI-Powered Trading Platform

A modern, AI-powered trading assistance platform that provides real-time market data, advanced charting, and intelligent trading insights.

## 🚀 Features

### 📊 **Advanced Charting**
- Real-time price updates with simulated market data
- Multiple chart types: Candlestick, Line, Area
- Interactive trading interface with multiple timeframes (1H, 4H, 1D, 1W)
- Professional-grade technical analysis tools

### 🤖 **AI Trading Assistant**
- Intelligent chat-based trading advice
- Context-aware responses with market data integration
- Powered by Google Gemini AI (with mock responses as fallback)
- Session-based conversation history

### 💼 **Trading Interface**
- Symbol search with auto-suggestions
- Real-time price monitoring
- Cryptocurrency, stock, and forex symbols support
- Responsive design for all devices

### 🔄 **Real-time Data**
- Simulated live price updates
- WebSocket-style data streaming
- Automatic chart updates
- Price change indicators

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd trading_assistance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment (optional)**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=5000
   ```
   *Note: The app works with mock responses if no API key is provided*

4. **Start the application**
   ```bash
   # Start both frontend and backend
   npm start
   
   # Or start individually:
   npm run start:dev    # Frontend only (port 5173)
   npm run start:server # Backend only (port 5000)
   ```

5. **Access the application**
   - **Main App**: http://localhost:5173/src/app/
   - **Landing Page**: http://localhost:5173/
   - **API Health Check**: http://localhost:5000/health

## 📁 Project Structure

```
trading_assistance/
├── public/
│   └── styles/           # CSS styling files
├── src/
│   ├── app/
│   │   └── index.html    # Main trading application
│   ├── components/
│   │   ├── Chart.js      # Chart component with multiple chart types
│   │   └── ChatBot.js    # AI chat interface component
│   ├── services/
│   │   ├── chart.js      # Chart service utilities
│   │   └── gemini.js     # AI service integration
│   ├── server/
│   │   ├── server.js     # Express backend server
│   │   ├── geminiChat.js # Gemini AI chat handler
│   │   └── binanceWebSocket.js # Real-time data simulation
│   └── main.js           # Main application entry point
├── index.html            # Landing page
├── package.json          # Dependencies and scripts
└── vite.config.js        # Vite configuration
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key for AI responses | Mock responses |
| `PORT` | Backend server port | 5000 |
| `CORS_ORIGIN` | Frontend URL for CORS | http://localhost:5173 |

### API Endpoints

- `GET /health` - Service health check
- `POST /gemini-chat` - AI chat interface
- `GET /bitcoin-data` - Real-time market data
- `GET /ws-status` - WebSocket connection status
- `POST /reset-chat` - Reset chat session

## 💡 Usage

### Trading Interface
1. **Symbol Search**: Type in the search box to find trading pairs
2. **Timeframe Selection**: Choose from 1H, 4H, 1D, 1W timeframes
3. **Chart Types**: Switch between candlestick, line, and area charts
4. **Real-time Updates**: Prices update automatically every 3-5 seconds

### AI Assistant
1. **Ask Questions**: Type trading-related questions in the chat
2. **Market Analysis**: Get insights based on current market data
3. **Trading Tips**: Receive AI-powered trading advice
4. **Session Memory**: Conversations are maintained per session

### Example Chat Queries
- "What's the current BTC trend?"
- "Should I buy ETH now?"
- "Explain support and resistance levels"
- "What are the best trading strategies?"

## 🔄 How It Works

### Frontend (Vite + Vanilla JS)
- **Vite** for fast development and building
- **Lightweight Charts** for professional charting
- **Vanilla JavaScript** for clean, dependency-free code
- **CSS3** with modern styling and animations

### Backend (Node.js + Express)
- **Express.js** for API routes
- **Google Generative AI** for intelligent responses
- **Simulated WebSocket** for real-time data
- **CORS enabled** for cross-origin requests

### Data Flow
1. Frontend requests real-time data from backend
2. Backend simulates market data with realistic fluctuations
3. AI assistant processes queries with market context
4. Charts update automatically with new price data

## 🚨 Development Notes

### Mock Data
- The application uses simulated market data for demonstration
- Real Binance WebSocket integration is stubbed for development
- Price movements are generated with realistic volatility

### AI Integration
- Gemini AI provides intelligent responses when API key is configured
- Fallback to mock responses when API key is not available
- Context-aware responses include current market data

### Performance
- Efficient chart rendering with canvas-based charts
- Debounced real-time updates to prevent overload
- Responsive design optimized for all screen sizes

## 🛡️ Security

- Environment variables for sensitive data
- CORS configuration for secure cross-origin requests
- Input validation for all API endpoints
- No sensitive data exposed to frontend

## 📱 Responsive Design

The application is fully responsive and works on:
- 💻 Desktop (1200px+)
- 📱 Tablet (768px - 1200px)
- 📱 Mobile (< 768px)

## 🔧 Troubleshooting

### Common Issues

1. **Port conflicts**: Change PORT in .env or use different ports
2. **Dependencies**: Run `npm install` to ensure all packages are installed
3. **API errors**: Check if backend server is running on port 5000
4. **Chart not displaying**: Ensure container element exists and has dimensions

### Development Tips

- Use `npm run start:dev` for frontend-only development
- Use `npm run start:server` for backend-only testing
- Check browser console for any JavaScript errors
- Monitor network tab for API request/response debugging

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Happy Trading! 📈💰** 