import { ChartComponent } from './components/Chart.js';
import { ChatBot } from './components/ChatBot.js';

class App {
    constructor() {
        console.log('🚀 Initializing Trading App...');
        this.priceUpdateInterval = null;
        this.initializeComponents();
        this.initializeSymbolSearch();
        this.initializeTimeframeSelector();
        this.startPriceUpdates();
        console.log('✅ Trading App initialization complete');
    }

    initializeComponents() {
        console.log('📊 Initializing Chart Component...');
        // Initialize chart
        const chartContainer = document.getElementById('chartContainer');
        if (chartContainer) {
            
            this.chart = new ChartComponent(chartContainer);
            
            // Expose chart component globally for button handlers
            window.chartComponent = this.chart;
            console.log('✅ Chart component initialized successfully');
        } else {
            console.error('❌ Chart container not found!');
        }

        console.log('💬 Initializing Chat Component...');
        // Initialize chatbot
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            console.log('Chat container found:', chatContainer);
            
            this.chatbot = new ChatBot('chatContainer', {
                title: 'AI Trading Assistant 🚀',
                subtitle: 'Get instant trading insights and tips powered by AI.',
                placeholder: 'e.g. "Show ETH prediction"'
            });
            console.log('✅ Chat component initialized successfully');
        } else {
            console.error('❌ Chat container not found!');
        }
    }

    initializeSymbolSearch() {
        console.log('🔍 Initializing Symbol Search...');
        const symbolList = [
            { symbol: 'BTC/USDT', price: 43500, type: 'crypto' },
            { symbol: 'ETH/USDT', price: 3200, type: 'crypto' },
            { symbol: 'BNB/USDT', price: 500, type: 'crypto' },
            { symbol: 'ADA/USDT', price: 0.45, type: 'crypto' },
            { symbol: 'SOL/USDT', price: 120, type: 'crypto' },
            { symbol: 'AAPL', price: 180, type: 'stock' },
            { symbol: 'TSLA', price: 250, type: 'stock' },
            { symbol: 'EUR/USD', price: 1.09, type: 'forex' }
        ];

        const symbolInput = document.getElementById('symbolSearchInput');
        const suggestionsBox = document.getElementById('symbolSuggestions');
        const lastPriceSpan = document.getElementById('lastPrice');

        if (!symbolInput || !suggestionsBox || !lastPriceSpan) {
            console.error('❌ Symbol search elements not found!');
            console.log('symbolInput:', symbolInput);
            console.log('suggestionsBox:', suggestionsBox);
            console.log('lastPriceSpan:', lastPriceSpan);
            return;
        }

        let currentSymbol = symbolList[0];

        symbolInput.addEventListener('input', () => {
            const val = symbolInput.value.toUpperCase();
            if (!val) {
                suggestionsBox.style.display = 'none';
                return;
            }

            const filtered = symbolList.filter(s => s.symbol.includes(val));
            suggestionsBox.innerHTML = filtered.map(s => 
                `<li data-symbol="${s.symbol}" data-price="${s.price}" data-type="${s.type}">
                    <span class="symbol">${s.symbol}</span> 
                    <span class="price">$${s.price}</span>
                    <span class="type">${s.type}</span>
                 </li>`
            ).join('');
            
            suggestionsBox.style.display = filtered.length ? 'block' : 'none';

            // Add click handlers to suggestions
            Array.from(suggestionsBox.children).forEach((li) => {
                li.onclick = () => {
                    const symbol = li.dataset.symbol;
                    const price = parseFloat(li.dataset.price);
                    const type = li.dataset.type;
                    this.selectSymbol({ symbol, price, type }, { symbolInput, lastPriceSpan, suggestionsBox });
                };
            });
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!symbolInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
                suggestionsBox.style.display = 'none';
            }
        });

        // Set initial symbol
        this.currentSymbol = currentSymbol;
        symbolInput.value = currentSymbol.symbol;
        this.updatePriceDisplay(currentSymbol.price);
        console.log('✅ Symbol search initialized');
    }

    selectSymbol(symbolObj, elements) {
        const { symbolInput, lastPriceSpan, suggestionsBox } = elements;
        symbolInput.value = symbolObj.symbol;
        suggestionsBox.style.display = 'none';
        
        this.currentSymbol = symbolObj;
        this.updatePriceDisplay(symbolObj.price);
        
        if (this.chart) {
            this.chart.setSymbol(symbolObj.symbol);
        }
        
        console.log(`Selected symbol: ${symbolObj.symbol}`);
    }

    initializeTimeframeSelector() {
        console.log('⏱️ Initializing Timeframe Selector...');
        const timeframes = ['1H', '4H', '1D', '1W'];
        const timeframeButtons = document.querySelectorAll('.timeframe-selector button');
        
        console.log(`Found ${timeframeButtons.length} timeframe buttons`);
        
        timeframeButtons.forEach((btn, index) => {
            const tf = timeframes[index] || btn.textContent;
            btn.onclick = () => {
                // Remove active class from all buttons
                timeframeButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Update active timeframe display
                const activeTimeframeSpan = document.getElementById('activeTimeframe');
                if (activeTimeframeSpan) {
                    activeTimeframeSpan.textContent = tf;
                }
                
                // Update chart timeframe
                if (this.chart) {
                    this.chart.setTimeframe(tf);
                }
                
                console.log(`Selected timeframe: ${tf}`);
            };
        });
        console.log('✅ Timeframe selector initialized');
    }

    startPriceUpdates() {
        console.log('📈 Starting price updates...');
        // Simulate real-time price updates every 3-5 seconds
        this.priceUpdateInterval = setInterval(() => {
            this.fetchLatestPrice();
        }, 3000 + Math.random() * 2000);
    }

    async fetchLatestPrice() {
        try {
            const response = await fetch('/api/bitcoin-data');
            const data = await response.json();
            
            if (data && data.price) {
                this.updatePriceDisplay(data.price);
                
                // Update chart with new price
                if (this.chart) {
                    this.chart.updatePrice(data.price);
                }
            }
        } catch (error) {
            console.log('Using simulated price data (server not connected)');
            // Fallback to simulated price updates
            this.simulatePriceUpdate();
        }
    }

    simulatePriceUpdate() {
        if (!this.currentSymbol) return;
        
        // Simulate price movement (±2%)
        const changePercent = (Math.random() - 0.5) * 0.04;
        const newPrice = this.currentSymbol.price * (1 + changePercent);
        this.currentSymbol.price = Math.round(newPrice * 100) / 100;
        
        this.updatePriceDisplay(this.currentSymbol.price);
        
        if (this.chart) {
            this.chart.updatePrice(this.currentSymbol.price);
        }
    }

    updatePriceDisplay(price) {
        const lastPriceSpan = document.getElementById('lastPrice');
        if (lastPriceSpan) {
            const isUp = Math.random() > 0.5; // Random direction for demo
            const arrow = isUp ? '▲' : '▼';
            const priceClass = isUp ? 'price-up' : 'price-down';
            
            lastPriceSpan.innerHTML = `
                <span class="live-dot"></span>
                Last Price: $${price.toLocaleString()} 
                <span class="${priceClass}">${arrow}</span>
            `;
            
            // Add animation class temporarily
            lastPriceSpan.classList.add('price-update');
            setTimeout(() => {
                lastPriceSpan.classList.remove('price-update');
            }, 1000);
        }
    }

    destroy() {
        if (this.priceUpdateInterval) {
            clearInterval(this.priceUpdateInterval);
        }
        
        if (this.chart) {
            this.chart.destroy();
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 DOM loaded, starting Trading Assistant...');
    
    // Add a small delay to ensure all resources are loaded
    setTimeout(() => {
        const app = new App();
        
        // Expose app globally for debugging
        window.tradingApp = app;
    }, 100);
}); 