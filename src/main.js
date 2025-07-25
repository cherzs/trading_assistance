import { TradingViewChart } from './components/TradingViewChart.js';
import { ChatBot } from './components/ChatBot.js';
import { AuthButton } from './components/AuthButton.js';
import { SymbolSearch } from './components/SymbolSearch.js';
import { TradingToolbar } from './components/TradingToolbar.js';
import authService from './services/auth.js';

class App {
    constructor() {
        console.log('Initializing Trading App...');
        this.priceUpdateInterval = null;
        this.init();
    }

    async init() {
        this.initializeAuth();
        this.initializeComponents();
        this.initializeTradingComponents();
        this.setupChartControls();
        this.startPriceUpdates();
        console.log('✅ Trading App initialization complete');
    }

    initializeAuth() {
        console.log('🔐 Initializing Authentication...');
        this.authButton = new AuthButton('authButton');
        console.log('✅ Authentication initialized successfully');
    }

    initializeComponents() {
        console.log('📊 Initializing TradingView Chart Component...');
        // Initialize TradingView chart
        const chartContainer = document.getElementById('chartContainer');
        if (chartContainer) {
            
            this.chart = new TradingViewChart('chartContainer');
            
            // Expose chart component globally for button handlers
            window.chartComponent = this.chart;
            console.log('✅ TradingView Chart component initialized successfully');
        } else {
            console.error('❌ Chart container not found!');
        }

        console.log('💬 Initializing Chat Component...');
        // Initialize chatbot
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            console.log('Chat container found:', chatContainer);
            
            const chatTitle = authService.isAuthenticated 
                ? `Welcome ${authService.user?.name || 'User'}!`
                : 'AI Trading Assistant';
                
            this.chatbot = new ChatBot('chatContainer', {
                title: chatTitle,
                subtitle: 'Get instant trading insights and tips powered by AI.',
                placeholder: 'e.g. "Show ETH prediction"'
            });
            console.log('✅ Chat component initialized successfully');
        } else {
            console.error('❌ Chat container not found!');
        }

        // Listen for auth changes to update chat title
        window.addEventListener('authStateChange', (event) => {
            if (this.chatbot) {
                const newTitle = event.detail.isAuthenticated 
                    ? `Welcome ${event.detail.user?.name || 'User'}!`
                    : 'AI Trading Assistant';
                    
                // Update chat title
                const chatTitle = document.querySelector('.chat-title');
                if (chatTitle) {
                    chatTitle.textContent = newTitle;
                }
            }
        });
    }

    initializeTradingComponents() {
        console.log('🔧 Initializing Trading Components...');
        
        // Initialize Trading Toolbar
        this.tradingToolbar = new TradingToolbar('tradingToolbar', this.chart);
        console.log('✅ Trading Toolbar initialized');
        
        // Initialize Symbol Search
        this.symbolSearch = new SymbolSearch('symbolSearchContainer', (symbol) => {
            this.handleSymbolSelection(symbol);
        });
        console.log('✅ Advanced Symbol Search initialized');
        
        // Fix interfering dropdowns after initialization
        setTimeout(() => {
            this.hideInterferingDropdowns();
        }, 500);
    }

    hideInterferingDropdowns() {
        console.log('🔧 Hiding interfering dropdowns...');
        
        // Force hide all section content dropdowns
        const dropdowns = document.querySelectorAll('.section-content');
        dropdowns.forEach(dropdown => {
            dropdown.style.display = 'none';
            dropdown.style.visibility = 'hidden';
            dropdown.style.opacity = '0';
            dropdown.style.pointerEvents = 'none';
        });
        
        // Remove hover effects that show dropdowns
        const sections = document.querySelectorAll('.toolbar-section');
        sections.forEach(section => {
            section.addEventListener('mouseenter', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
            
            section.addEventListener('click', (e) => {
                const content = section.querySelector('.section-content');
                if (content) {
                    e.preventDefault();
                    e.stopPropagation();
                    content.style.display = 'none';
                }
            });
        });
        
        // Hide alert elements specifically
        const alertElements = document.querySelectorAll('.add-alert, .alert-item, .alerts-group');
        alertElements.forEach(el => {
            if (el) {
                el.style.display = 'none';
            }
        });
        
        // Fix symbol dropdown behavior
        const symbolDropdown = document.querySelector('.symbol-dropdown');
        if (symbolDropdown) {
            symbolDropdown.style.display = 'none';
        }
        
        console.log('✅ Interfering dropdowns hidden');
    }

    handleSymbolSelection(symbol) {
        console.log('📈 Symbol selected:', symbol);
        
        // Update current symbol
        this.currentSymbol = symbol;
        
        // Update chart
        if (this.chart && symbol.full_name) {
            this.chart.changeSymbol(symbol.full_name);
        }
        
        // Update price display
        if (symbol.price) {
            this.updatePriceDisplay(symbol.price);
        }
        
        // Update active timeframe display
        const activeTimeframe = document.getElementById('activeTimeframe');
        if (activeTimeframe) {
            activeTimeframe.textContent = this.getCurrentTimeframe();
        }
        
        console.log(`Symbol changed to: ${symbol.symbol} (${symbol.full_name})`);
    }

    selectSymbol(symbolObj, elements) {
        const { symbolInput, lastPriceSpan, suggestionsBox } = elements;
        symbolInput.value = symbolObj.symbol;
        suggestionsBox.style.display = 'none';
        
        this.currentSymbol = symbolObj;
        this.updatePriceDisplay(symbolObj.price);
        
        if (this.chart && symbolObj.full_name) {
            this.chart.changeSymbol(symbolObj.full_name);
        }
        
        console.log(`Selected symbol: ${symbolObj.symbol} (${symbolObj.full_name})`);
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
                    this.chart.changeInterval(tf);
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
                
                // TradingView charts update automatically via datafeed
                // No manual price updates needed
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
        
        // TradingView charts update automatically via datafeed streaming
    }

    updatePriceDisplay(price) {
        const lastPriceSpan = document.getElementById('lastPrice');
        if (lastPriceSpan) {
            const prevPrice = this.lastDisplayedPrice || price;
            const isUp = price > prevPrice;
            const arrow = isUp ? '▲' : '▼';
            const priceClass = isUp ? 'price-up' : 'price-down';
            const changePercent = prevPrice ? (((price - prevPrice) / prevPrice) * 100).toFixed(2) : '0.00';
            
            lastPriceSpan.innerHTML = `
                <span class="status-indicator online"></span>
                Last Price: $${price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })} 
                <span class="${priceClass}" data-tooltip="${changePercent}% change">${arrow}</span>
            `;
            
            // Enhanced animation with scale effect
            lastPriceSpan.classList.add('price-update');
            setTimeout(() => {
                lastPriceSpan.classList.remove('price-update');
            }, 1000);
            
            this.lastDisplayedPrice = price;
        }
    }

    showErrorState(container, message, details = '') {
        if (!container) return;
        
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Connection Error</h3>
                <p>${message}</p>
                ${details ? `<small style="color: var(--text-gray); opacity: 0.8;">${details}</small>` : ''}
                <button class="retry-btn" onclick="window.location.reload()">
                    <i class="fas fa-refresh"></i>
                    Retry Connection
                </button>
            </div>
        `;
    }

    showLoadingState(container, message = 'Loading...') {
        if (!container) return;
        
        container.innerHTML = `
            <div class="chart-loading">
                <div class="loading-skeleton chart-loading-skeleton"></div>
                <div style="display: flex; align-items: center; gap: 0.8rem; margin-top: 1rem;">
                    <span class="status-indicator loading"></span>
                    <span style="color: var(--text-gray);">${message}</span>
                </div>
            </div>
        `;
    }

    setupChartControls() {
        console.log('🎛️ Setting up Chart Controls...');
        
        // Fullscreen control
        const fullscreenBtn = document.querySelector('.fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', this.toggleFullscreen.bind(this));
        }
        
        // Screenshot control
        const screenshotBtn = document.querySelector('.screenshot-btn');
        if (screenshotBtn) {
            screenshotBtn.addEventListener('click', this.takeScreenshot.bind(this));
        }
        
        // Zoom controls
        const zoomInBtn = document.querySelector('.zoom-in-btn');
        const zoomOutBtn = document.querySelector('.zoom-out-btn');
        const resetZoomBtn = document.querySelector('.reset-zoom-btn');
        
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => this.handleZoom('in'));
        }
        
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => this.handleZoom('out'));
        }
        
        if (resetZoomBtn) {
            resetZoomBtn.addEventListener('click', () => this.handleZoom('reset'));
        }
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Setup right-click context menu
        this.setupContextMenu();
        
        // Make sure chart tools work
        this.enableChartTools();
        
        console.log('✅ Chart controls setup complete');
    }

    enableChartTools() {
        console.log('🔧 Enabling chart tools...');
        
        // Make timeframe buttons work
        const timeframeBtns = document.querySelectorAll('.timeframe-btn');
        timeframeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Remove active from all
                timeframeBtns.forEach(b => b.classList.remove('active'));
                
                // Add active to clicked
                btn.classList.add('active');
                
                const timeframe = btn.dataset.timeframe || btn.textContent.trim();
                
                // Update chart
                if (this.chart && this.chart.changeInterval) {
                    this.chart.changeInterval(timeframe);
                }
                
                // Update display
                const activeTimeframe = document.getElementById('activeTimeframe');
                if (activeTimeframe) {
                    activeTimeframe.textContent = timeframe;
                }
                
                console.log(`Timeframe changed to: ${timeframe}`);
            });
        });
        
        // Make chart type buttons work
        const chartTypeBtns = document.querySelectorAll('.chart-type-btn');
        chartTypeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Remove active from all
                chartTypeBtns.forEach(b => b.classList.remove('active'));
                
                // Add active to clicked
                btn.classList.add('active');
                
                const chartType = btn.dataset.type;
                
                // Update chart
                if (this.chart && this.chart.changeChartType) {
                    this.chart.changeChartType(chartType);
                }
                
                console.log(`Chart type changed to: ${chartType}`);
            });
        });
        
        // Make drawing tools work (simplified)
        const drawingBtns = document.querySelectorAll('.drawing-tool-btn');
        drawingBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Remove active from all
                drawingBtns.forEach(b => b.classList.remove('active'));
                
                // Add active to clicked
                btn.classList.add('active');
                
                const tool = btn.dataset.tool;
                console.log(`Drawing tool selected: ${tool}`);
                
                // Show notification
                this.showNotification(`Drawing tool "${tool}" selected. Click on chart to use.`, 'info');
            });
        });
        
        console.log('✅ Chart tools enabled');
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Prevent default for our shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 's':
                        e.preventDefault();
                        this.takeScreenshot();
                        break;
                    case 'f':
                        e.preventDefault();
                        document.querySelector('.symbol-search-input')?.focus();
                        break;
                }
            }
            
            // Function keys and other shortcuts
            switch (e.key) {
                case 'F11':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
                case '+':
                case '=':
                    if (e.target.tagName !== 'INPUT') {
                        e.preventDefault();
                        this.handleZoom('in');
                    }
                    break;
                case '-':
                    if (e.target.tagName !== 'INPUT') {
                        e.preventDefault();
                        this.handleZoom('out');
                    }
                    break;
                case 'r':
                case 'R':
                    if (e.target.tagName !== 'INPUT') {
                        e.preventDefault();
                        this.handleZoom('reset');
                    }
                    break;
                case 'Escape':
                    // Close any open dropdowns
                    document.querySelectorAll('.symbol-dropdown, .section-content').forEach(el => {
                        if (el.style.display !== 'none') {
                            el.style.display = 'none';
                        }
                    });
                    break;
            }
        });
        
        console.log('⌨️ Keyboard shortcuts enabled');
    }

    setupContextMenu() {
        const chartContainer = document.getElementById('chartContainer');
        if (!chartContainer) return;
        
        chartContainer.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e.clientX, e.clientY);
        });
        
        // Close context menu when clicking elsewhere
        document.addEventListener('click', () => {
            this.hideContextMenu();
        });
    }

    showContextMenu(x, y) {
        // Remove existing context menu
        this.hideContextMenu();
        
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.id = 'chartContextMenu';
        
        contextMenu.innerHTML = `
            <div class="context-menu-item" data-action="screenshot">
                <i class="fas fa-camera"></i>
                Take Screenshot
            </div>
            <div class="context-menu-item" data-action="fullscreen">
                <i class="fas fa-expand"></i>
                Toggle Fullscreen
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item" data-action="zoom-in">
                <i class="fas fa-search-plus"></i>
                Zoom In
            </div>
            <div class="context-menu-item" data-action="zoom-out">
                <i class="fas fa-search-minus"></i>
                Zoom Out
            </div>
            <div class="context-menu-item" data-action="reset-zoom">
                <i class="fas fa-home"></i>
                Reset Zoom
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item" data-action="copy-price">
                <i class="fas fa-copy"></i>
                Copy Current Price
            </div>
        `;
        
        // Position context menu
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        
        // Add event listeners
        contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = item.dataset.action;
                this.handleContextMenuAction(action);
                this.hideContextMenu();
            });
        });
        
        document.body.appendChild(contextMenu);
        
        // Adjust position if menu goes off screen
        const rect = contextMenu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            contextMenu.style.left = (x - rect.width) + 'px';
        }
        if (rect.bottom > window.innerHeight) {
            contextMenu.style.top = (y - rect.height) + 'px';
        }
    }

    hideContextMenu() {
        const existingMenu = document.getElementById('chartContextMenu');
        if (existingMenu) {
            existingMenu.remove();
        }
    }

    handleContextMenuAction(action) {
        switch (action) {
            case 'screenshot':
                this.takeScreenshot();
                break;
            case 'fullscreen':
                this.toggleFullscreen();
                break;
            case 'zoom-in':
                this.handleZoom('in');
                break;
            case 'zoom-out':
                this.handleZoom('out');
                break;
            case 'reset-zoom':
                this.handleZoom('reset');
                break;
            case 'copy-price':
                this.copyCurrentPrice();
                break;
        }
    }

    copyCurrentPrice() {
        const priceElement = document.getElementById('lastPrice');
        if (priceElement) {
            const priceText = priceElement.textContent.match(/\$[\d,]+\.?\d*/);
            if (priceText) {
                navigator.clipboard.writeText(priceText[0]).then(() => {
                    this.showNotification('Price copied to clipboard!', 'success');
                }).catch(() => {
                    this.showNotification('Failed to copy price', 'error');
                });
            }
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? 'rgba(0, 255, 136, 0.1)' : 
                       type === 'error' ? 'rgba(255, 0, 85, 0.1)' : 'rgba(0, 247, 255, 0.1)',
            border: `1px solid ${type === 'success' ? 'var(--success-color)' : 
                                type === 'error' ? 'var(--danger-color)' : 'var(--primary-color)'}`,
            borderRadius: '8px',
            padding: '1rem 1.5rem',
            color: 'var(--text-light)',
            zIndex: '10000',
            animation: 'slideInRight 0.3s ease-out'
        });
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }

    toggleFullscreen() {
        const chartSection = document.querySelector('.chart-section');
        if (!chartSection) return;
        
        if (!document.fullscreenElement) {
            chartSection.requestFullscreen().catch(err => {
                console.error('Error entering fullscreen:', err);
            });
        } else {
            document.exitFullscreen().catch(err => {
                console.error('Error exiting fullscreen:', err);
            });
        }
    }

    takeScreenshot() {
        // Implementation would depend on the chart library
        console.log('📸 Taking screenshot...');
        
        // For TradingView, you might use chart.takeScreenshot()
        if (this.chart && this.chart.takeScreenshot) {
            this.chart.takeScreenshot();
        } else {
            // Fallback: use html2canvas or similar library
            console.log('Screenshot feature not available for current chart library');
        }
    }

    handleZoom(action) {
        console.log(`🔍 Zoom ${action}...`);
        
        // Implementation depends on chart library
        if (this.chart) {
            switch (action) {
                case 'in':
                    if (this.chart.zoomIn) this.chart.zoomIn();
                    break;
                case 'out':
                    if (this.chart.zoomOut) this.chart.zoomOut();
                    break;
                case 'reset':
                    if (this.chart.resetZoom) this.chart.resetZoom();
                    break;
            }
        }
    }

    getCurrentTimeframe() {
        // Get current timeframe from toolbar or default
        if (this.tradingToolbar) {
            const activeTimeframe = document.querySelector('.timeframe-btn.active');
            return activeTimeframe ? activeTimeframe.textContent : '1H';
        }
        return '1H';
    }

    destroy() {
        if (this.priceUpdateInterval) {
            clearInterval(this.priceUpdateInterval);
        }
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        console.log('🧹 App cleanup completed');
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