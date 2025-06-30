import { ChartComponent } from './components/Chart.js';
import { ChatBot } from './components/ChatBot.js';

class App {
    constructor() {
        this.initializeComponents();
        this.initializeSymbolSearch();
        this.initializeTimeframeSelector();
    }

    initializeComponents() {
        // Initialize chart
        const chartContainer = document.getElementById('chartContainer');
        if (chartContainer) {
            this.chart = new ChartComponent(chartContainer);
        } else {
            console.error('Chart container not found!');
        }
        // Initialize chatbot
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            this.chatbot = new ChatBot('chatContainer', {
                title: 'AI Trading Assistant 🚀',
                subtitle: 'Get instant trading insights and tips powered by AI.',
                placeholder: 'e.g. "Show ETH prediction"'
            });
        } else {
            console.error('Chat container not found!');
        }
    }

    initializeSymbolSearch() {
        const symbolList = [
            { symbol: 'BTC/USDT', price: 117, type: 'crypto' },
            { symbol: 'ETH/USDT', price: 3200, type: 'crypto' },
            { symbol: 'BNB/USDT', price: 500, type: 'crypto' },
            { symbol: 'AAPL', price: 180, type: 'stock' },
            { symbol: 'EUR/USD', price: 1.09, type: 'forex' }
        ];
        const symbolInput = document.getElementById('symbolSearchInput');
        const suggestionsBox = document.getElementById('symbolSuggestions');
        const lastPriceSpan = document.getElementById('lastPrice');
        if (!symbolInput || !suggestionsBox || !lastPriceSpan) {
            console.error('Symbol search elements not found!');
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
            suggestionsBox.innerHTML = filtered.map(s => `<li>${s.symbol}</li>`).join('');
            suggestionsBox.style.display = filtered.length ? 'block' : 'none';
            Array.from(suggestionsBox.children).forEach((li, idx) => {
                li.onclick = () => {
                    this.selectSymbol(filtered[idx], { symbolInput, lastPriceSpan, suggestionsBox });
                };
            });
        });
        document.addEventListener('click', (e) => {
            if (!symbolInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
                suggestionsBox.style.display = 'none';
            }
        });
    }

    selectSymbol(symbolObj, elements) {
        const { symbolInput, lastPriceSpan, suggestionsBox } = elements;
        symbolInput.value = symbolObj.symbol;
        lastPriceSpan.textContent = `Last Price: $${symbolObj.price}`;
        suggestionsBox.style.display = 'none';
        if (this.chart) {
            this.chart.setSymbol(symbolObj.symbol);
        }
    }

    initializeTimeframeSelector() {
        const timeframes = ['1H', '4H', '1D', '1W'];
        timeframes.forEach(tf => {
            const btn = document.querySelector(`.timeframe-selector button:contains('${tf}')`);
            if (btn) {
                btn.onclick = () => {
                    document.querySelectorAll('.timeframe-selector button').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    if (this.chart) this.chart.setTimeframe(tf);
                };
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
}); 