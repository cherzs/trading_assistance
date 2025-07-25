export class SymbolSearch {
    constructor(containerId, onSymbolSelected) {
        this.container = document.getElementById(containerId);
        this.onSymbolSelected = onSymbolSelected;
        this.symbols = [];
        this.filteredSymbols = [];
        this.selectedIndex = -1;
        this.isOpen = false;
        
        this.init();
        this.loadSymbols();
    }

    init() {
        if (!this.container) {
            console.error('Symbol search container not found');
            return;
        }

        this.container.innerHTML = `
            <div class="symbol-search-container">
                <div class="symbol-search-wrapper">
                    <div class="symbol-search-input-container">
                        <i class="fas fa-search search-icon"></i>
                        <input 
                            type="text" 
                            class="symbol-search-input" 
                            placeholder="Search symbols (e.g., BTCUSD, AAPL...)"
                            autocomplete="off"
                            spellcheck="false"
                        />
                        <div class="search-spinner" style="display: none;">
                            <i class="fas fa-spinner fa-spin"></i>
                        </div>
                    </div>
                    
                    <div class="symbol-dropdown" style="display: none;">
                        <div class="dropdown-header">
                            <div class="dropdown-tabs">
                                <button class="dropdown-tab active" data-category="crypto">Crypto</button>
                                <button class="dropdown-tab" data-category="stocks">Stocks</button>
                                <button class="dropdown-tab" data-category="forex">Forex</button>
                                <button class="dropdown-tab" data-category="commodities">Commodities</button>
                            </div>
                        </div>
                        
                        <div class="dropdown-content">
                            <div class="symbol-list"></div>
                            <div class="dropdown-footer">
                                <div class="results-count">0 symbols found</div>
                                <div class="powered-by">Powered by CoinMarketCap</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const input = this.container.querySelector('.symbol-search-input');
        const dropdown = this.container.querySelector('.symbol-dropdown');
        const symbolList = this.container.querySelector('.symbol-list');
        const tabs = this.container.querySelectorAll('.dropdown-tab');

        // Input events
        input.addEventListener('input', this.handleInput.bind(this));
        input.addEventListener('focus', this.handleFocus.bind(this));
        input.addEventListener('keydown', this.handleKeyDown.bind(this));
        input.addEventListener('blur', this.handleBlur.bind(this));

        // Tab switching
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchCategory(tab.dataset.category);
            });
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.closeDropdown();
            }
        });

        // Symbol list events
        symbolList.addEventListener('click', this.handleSymbolClick.bind(this));
        symbolList.addEventListener('mouseover', this.handleSymbolHover.bind(this));
    }

    async loadSymbols() {
        try {
            this.showSpinner();
            
            const response = await fetch('/api/symbols');
            if (response.ok) {
                const data = await response.json();
                this.symbols = data.symbols || [];
                console.log(`✅ Loaded ${this.symbols.length} symbols for search`);
            } else {
                throw new Error('Failed to fetch symbols');
            }
        } catch (error) {
            console.warn('⚠️ Using fallback symbols:', error.message);
            this.symbols = this.getFallbackSymbols();
        } finally {
            this.hideSpinner();
        }
    }

    getFallbackSymbols() {
        return [
            { symbol: 'BTC/USD', full_name: 'CMC:BTC/USD', name: 'Bitcoin', type: 'crypto', rank: 1, price: 115000, category: 'crypto' },
            { symbol: 'ETH/USD', full_name: 'CMC:ETH/USD', name: 'Ethereum', type: 'crypto', rank: 2, price: 3600, category: 'crypto' },
            { symbol: 'USDT/USD', full_name: 'CMC:USDT/USD', name: 'Tether', type: 'crypto', rank: 3, price: 1.0, category: 'crypto' },
            { symbol: 'BNB/USD', full_name: 'CMC:BNB/USD', name: 'BNB', type: 'crypto', rank: 4, price: 350, category: 'crypto' },
            { symbol: 'SOL/USD', full_name: 'CMC:SOL/USD', name: 'Solana', type: 'crypto', rank: 5, price: 120, category: 'crypto' },
            { symbol: 'XRP/USD', full_name: 'CMC:XRP/USD', name: 'XRP', type: 'crypto', rank: 7, price: 3.0, category: 'crypto' },
            
            // Add some forex pairs for demo
            { symbol: 'EUR/USD', full_name: 'FX:EURUSD', name: 'Euro vs US Dollar', type: 'forex', price: 1.0850, category: 'forex' },
            { symbol: 'GBP/USD', full_name: 'FX:GBPUSD', name: 'British Pound vs US Dollar', type: 'forex', price: 1.2650, category: 'forex' },
            { symbol: 'USD/JPY', full_name: 'FX:USDJPY', name: 'US Dollar vs Japanese Yen', type: 'forex', price: 149.50, category: 'forex' },
            
            // Add some stocks for demo
            { symbol: 'AAPL', full_name: 'NASDAQ:AAPL', name: 'Apple Inc', type: 'stock', price: 192.50, category: 'stocks' },
            { symbol: 'GOOGL', full_name: 'NASDAQ:GOOGL', name: 'Alphabet Inc', type: 'stock', price: 140.25, category: 'stocks' },
            { symbol: 'MSFT', full_name: 'NASDAQ:MSFT', name: 'Microsoft Corporation', type: 'stock', price: 420.15, category: 'stocks' },
            
            // Add commodities
            { symbol: 'GOLD', full_name: 'COMEX:GC1!', name: 'Gold Futures', type: 'commodity', price: 2025.50, category: 'commodities' },
            { symbol: 'OIL', full_name: 'NYMEX:CL1!', name: 'Crude Oil Futures', type: 'commodity', price: 78.25, category: 'commodities' }
        ];
    }

    handleInput(e) {
        const query = e.target.value.trim();
        this.filterSymbols(query);
        this.selectedIndex = -1;
        
        if (query.length > 0) {
            this.openDropdown();
        } else {
            this.showDefaultSymbols();
        }
    }

    handleFocus() {
        this.openDropdown();
        if (this.filteredSymbols.length === 0) {
            this.showDefaultSymbols();
        }
    }

    handleBlur() {
        // Delay closing to allow clicks on dropdown items
        setTimeout(() => {
            this.closeDropdown();
        }, 200);
    }

    handleKeyDown(e) {
        if (!this.isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredSymbols.length - 1);
                this.updateSelection();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                this.updateSelection();
                break;
            case 'Enter':
                e.preventDefault();
                if (this.selectedIndex >= 0 && this.filteredSymbols[this.selectedIndex]) {
                    this.selectSymbol(this.filteredSymbols[this.selectedIndex]);
                }
                break;
            case 'Escape':
                this.closeDropdown();
                break;
        }
    }

    handleSymbolClick(e) {
        const symbolItem = e.target.closest('.symbol-item');
        if (symbolItem) {
            const index = parseInt(symbolItem.dataset.index);
            if (this.filteredSymbols[index]) {
                this.selectSymbol(this.filteredSymbols[index]);
            }
        }
    }

    handleSymbolHover(e) {
        const symbolItem = e.target.closest('.symbol-item');
        if (symbolItem) {
            this.selectedIndex = parseInt(symbolItem.dataset.index);
            this.updateSelection();
        }
    }

    filterSymbols(query, category = 'crypto') {
        if (!query) {
            this.filteredSymbols = this.symbols
                .filter(s => (s.category || 'crypto') === category)
                .slice(0, 20);
        } else {
            const searchLower = query.toLowerCase();
            this.filteredSymbols = this.symbols
                .filter(symbol => {
                    const categoryMatch = (symbol.category || 'crypto') === category;
                    const symbolMatch = symbol.symbol.toLowerCase().includes(searchLower);
                    const nameMatch = symbol.name && symbol.name.toLowerCase().includes(searchLower);
                    const baseMatch = symbol.symbol.split('/')[0].toLowerCase() === searchLower;
                    
                    return categoryMatch && (symbolMatch || nameMatch || baseMatch);
                })
                .sort((a, b) => {
                    // Prioritize exact matches
                    const aExact = a.symbol.toLowerCase().startsWith(searchLower) ? 1000 : 0;
                    const bExact = b.symbol.toLowerCase().startsWith(searchLower) ? 1000 : 0;
                    const rankBonus = (a.rank || 999999) < (b.rank || 999999) ? 100 : 0;
                    
                    return (bExact + rankBonus) - (aExact + rankBonus);
                })
                .slice(0, 50);
        }
        
        this.renderSymbols();
        this.updateResultsCount();
    }

    switchCategory(category) {
        // Update active tab
        this.container.querySelectorAll('.dropdown-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });

        // Filter symbols by category
        const input = this.container.querySelector('.symbol-search-input');
        this.filterSymbols(input.value, category);
    }

    showDefaultSymbols() {
        this.filterSymbols('', 'crypto');
    }

    renderSymbols() {
        const symbolList = this.container.querySelector('.symbol-list');
        
        if (this.filteredSymbols.length === 0) {
            symbolList.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <div>No symbols found</div>
                    <div class="suggestion">Try searching for BTC, ETH, or AAPL</div>
                </div>
            `;
            return;
        }

        symbolList.innerHTML = this.filteredSymbols.map((symbol, index) => `
            <div class="symbol-item" data-index="${index}">
                <div class="symbol-info">
                    <div class="symbol-main">
                        <span class="symbol-code">${symbol.symbol}</span>
                        ${symbol.rank ? `<span class="symbol-rank">#${symbol.rank}</span>` : ''}
                    </div>
                    <div class="symbol-name">${symbol.name || symbol.symbol.split('/')[0]}</div>
                    <div class="symbol-exchange">${this.getExchangeLabel(symbol)}</div>
                </div>
                <div class="symbol-price">
                    ${symbol.price ? `<span class="price">$${this.formatPrice(symbol.price)}</span>` : ''}
                    <i class="fas fa-plus add-icon"></i>
                </div>
            </div>
        `).join('');
    }

    getExchangeLabel(symbol) {
        const typeMap = {
            'crypto': 'Cryptocurrency',
            'stock': 'Stock',
            'forex': 'Forex',
            'commodity': 'Commodity'
        };
        return typeMap[symbol.type || symbol.category] || 'CMC';
    }

    formatPrice(price) {
        if (typeof price !== 'number') price = parseFloat(price);
        
        if (price < 1) {
            return price.toFixed(6).replace(/\.?0+$/, '');
        } else if (price < 100) {
            return price.toFixed(2);
        } else {
            return price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }
    }

    updateSelection() {
        this.container.querySelectorAll('.symbol-item').forEach((item, index) => {
            item.classList.toggle('selected', index === this.selectedIndex);
        });

        // Scroll selected item into view
        if (this.selectedIndex >= 0) {
            const selectedItem = this.container.querySelector(`.symbol-item[data-index="${this.selectedIndex}"]`);
            if (selectedItem) {
                selectedItem.scrollIntoView({ block: 'nearest' });
            }
        }
    }

    updateResultsCount() {
        const counter = this.container.querySelector('.results-count');
        if (counter) {
            const count = this.filteredSymbols.length;
            counter.textContent = `${count} symbol${count !== 1 ? 's' : ''} found`;
        }
    }

    openDropdown() {
        const dropdown = this.container.querySelector('.symbol-dropdown');
        dropdown.style.display = 'block';
        this.isOpen = true;
        
        // Add animation class
        setTimeout(() => dropdown.classList.add('open'), 10);
    }

    closeDropdown() {
        const dropdown = this.container.querySelector('.symbol-dropdown');
        dropdown.classList.remove('open');
        
        setTimeout(() => {
            dropdown.style.display = 'none';
            this.isOpen = false;
        }, 200);
    }

    selectSymbol(symbol) {
        const input = this.container.querySelector('.symbol-search-input');
        input.value = symbol.symbol;
        this.closeDropdown();
        
        if (this.onSymbolSelected) {
            this.onSymbolSelected(symbol);
        }
    }

    showSpinner() {
        const spinner = this.container.querySelector('.search-spinner');
        const icon = this.container.querySelector('.search-icon');
        if (spinner && icon) {
            spinner.style.display = 'block';
            icon.style.display = 'none';
        }
    }

    hideSpinner() {
        const spinner = this.container.querySelector('.search-spinner');
        const icon = this.container.querySelector('.search-icon');
        if (spinner && icon) {
            spinner.style.display = 'none';
            icon.style.display = 'block';
        }
    }

    getCurrentSymbol() {
        const input = this.container.querySelector('.symbol-search-input');
        return input ? input.value : '';
    }

    setSymbol(symbolCode) {
        const input = this.container.querySelector('.symbol-search-input');
        if (input) {
            input.value = symbolCode;
        }
    }
} 