import { ChartComponent } from './components/Chart.js';
import { ChatBot } from './components/ChatBot.js';

// Inisialisasi chart
document.addEventListener('DOMContentLoaded', () => {
    const chartContainer = document.getElementById('chartContainer');
    if (chartContainer) {
        console.log('Initializing chart...'); // Debug
        const chart = new ChartComponent(chartContainer);
    } else {
        console.error('Chart container not found!'); // Debug
    }

    // Inisialisasi chatbot
    new ChatBot();

    // Symbol search logic
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

    let currentSymbol = symbolList[0]; // default BTC/USDT

    if (symbolInput && suggestionsBox && lastPriceSpan) {
        symbolInput.addEventListener('input', function() {
            const val = symbolInput.value.toUpperCase();
            if (!val) {
                suggestionsBox.style.display = 'none';
                return;
            }
            const filtered = symbolList.filter(s => s.symbol.includes(val));
            suggestionsBox.innerHTML = filtered.map(s => `<li>${s.symbol}</li>`).join('');
            suggestionsBox.style.display = filtered.length ? 'block' : 'none';

            // Pilih symbol dari suggestion
            Array.from(suggestionsBox.children).forEach((li, idx) => {
                li.onclick = () => {
                    selectSymbol(filtered[idx]);
                    suggestionsBox.style.display = 'none';
                };
            });
        });

        function selectSymbol(symbolObj) {
            currentSymbol = symbolObj;
            symbolInput.value = symbolObj.symbol;
            lastPriceSpan.textContent = `Last Price: $${symbolObj.price}`;
            // TODO: update chart data sesuai symbolObj.symbol
            // Misal: chartComponent.setSymbol(symbolObj.symbol);
        }

        // Optional: klik di luar suggestion, tutup box
        document.addEventListener('click', (e) => {
            if (!symbolInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
                suggestionsBox.style.display = 'none';
            }
        });
    }
}); 