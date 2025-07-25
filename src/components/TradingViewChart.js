import Datafeed from '../services/datafeed.js';

export class TradingViewChart {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.widget = null;
        this.symbol = 'Coinbase:BTC/USD';
        this.interval = '1D';
        this.isInitialized = false;
        
        if (!this.container) {
            console.error(`[TradingView Chart] Container with id ${containerId} not found`);
            return;
        }

        console.log('[TradingView Chart] Initializing TradingView widget...');
        this.initializeWidget();
    }

    initializeWidget() {
        try {
            // Check if TradingView library is loaded
            if (typeof window.TradingView === 'undefined') {
                console.warn('[TradingView Chart] TradingView library not loaded! Falling back to lightweight charts.');
                this.initializeFallbackChart();
                return;
            }

            // Widget configuration
            const widgetOptions = {
                symbol: this.symbol,
                interval: this.interval,
                container: this.containerId,
                datafeed: Datafeed,
                library_path: '/charting_library/',
                
                // Localization
                locale: 'en',
                
                // UI customization
                disabled_features: [
                    'use_localstorage_for_settings',
                    'volume_force_overlay',
                    'create_volume_indicator_by_default'
                ],
                enabled_features: [
                    'study_templates',
                    'side_toolbar_in_fullscreen_mode'
                ],
                
                // Chart options
                charts_storage_url: null,
                charts_storage_api_version: '1.1',
                client_id: 'trading_assistant',
                user_id: 'public_user',
                
                // Appearance
                fullscreen: false,
                autosize: true,
                studies_overrides: {},
                theme: 'Dark',
                
                // Trading
                trading_enabled: false,
                
                // Advanced features
                save_image: false,
                timezone: 'Etc/UTC',
                
                // Custom CSS
                custom_css_url: '/public/styles/tradingview-custom.css',
                
                // Overrides
                overrides: {
                    "paneProperties.background": "#0B1426",
                    "paneProperties.vertGridProperties.color": "#1e2a3a",
                    "paneProperties.horzGridProperties.color": "#1e2a3a",
                    "symbolWatermarkProperties.transparency": 90,
                    "scalesProperties.textColor": "#d1d4dc",
                    "scalesProperties.backgroundColor": "#0B1426",
                },
                
                // Loading screen
                loading_screen: {
                    backgroundColor: "#0B1426",
                    foregroundColor: "#00f7ff"
                },
                
                // Studies
                studies_overrides: {
                    "volume.volume.color.0": "#ef5350",
                    "volume.volume.color.1": "#26a69a",
                    "volume.volume.transparency": 70,
                    "volume.volume ma.color": "#FF6D00",
                    "volume.volume ma.transparency": 30,
                    "volume.volume ma.linewidth": 2,
                    "bollinger bands.median.color": "#33691E",
                    "bollinger bands.upper.linewidth": 2,
                    "bollinger bands.lower.linewidth": 2,
                }
            };

            console.log('[TradingView Chart] Creating widget with options:', widgetOptions);

            // Create the widget
            this.widget = new window.TradingView.widget(widgetOptions);

            // Setup event listeners
            this.setupEventListeners();

        } catch (error) {
            console.error('[TradingView Chart] Error initializing widget:', error);
            this.showInitializationError(error);
        }
    }

    setupEventListeners() {
        if (!this.widget) return;

        // Widget ready event
        this.widget.onChartReady(() => {
            console.log('[TradingView Chart] Chart is ready!');
            this.isInitialized = true;
            
            // Get the chart object
            this.chart = this.widget.chart();
            
            // Setup additional chart features
            this.setupChartFeatures();
            
            // Notify that chart is ready
            this.onChartReady();
        });

        // Symbol change event
        this.widget.subscribe('onSymbolChanged', (symbolInfo) => {
            console.log('[TradingView Chart] Symbol changed:', symbolInfo);
            this.symbol = symbolInfo.name;
        });

        // Interval change event
        this.widget.subscribe('onIntervalChanged', (interval) => {
            console.log('[TradingView Chart] Interval changed:', interval);
            this.interval = interval;
        });
    }

    setupChartFeatures() {
        if (!this.chart) return;

        try {
            // Add custom studies/indicators
            this.addDefaultStudies();
            
            // Setup price alerts (if needed)
            this.setupPriceAlerts();
            
            // Custom chart styling
            this.applyCustomStyling();

        } catch (error) {
            console.error('[TradingView Chart] Error setting up chart features:', error);
        }
    }

    addDefaultStudies() {
        // Add volume indicator
        this.chart.createStudy('Volume', false, false, [10], null, {
            'volume.volume.color.0': '#ef5350',
            'volume.volume.color.1': '#26a69a',
            'volume.volume.transparency': 70
        });

        console.log('[TradingView Chart] Default studies added');
    }

    setupPriceAlerts() {
        // This can be extended to integrate with your backend for price alerts
        console.log('[TradingView Chart] Price alerts setup completed');
    }

    applyCustomStyling() {
        // Apply additional custom styling if needed
        console.log('[TradingView Chart] Custom styling applied');
    }

    // Public methods
    changeSymbol(symbol) {
        if (!this.isInitialized) {
            console.warn('[TradingView Chart] Chart not initialized yet');
            return;
        }

        console.log('[TradingView Chart] Changing symbol to:', symbol);
        this.symbol = symbol;
        
        if (this.widget) {
            // TradingView widget method
            this.widget.setSymbol(symbol, () => {
                console.log('[TradingView Chart] Symbol changed successfully');
            });
        } else {
            // Fallback: reload data for lightweight charts
            console.log('[TradingView Chart] Symbol change not supported in fallback mode');
        }
    }

    changeInterval(interval) {
        if (!this.isInitialized) {
            console.warn('[TradingView Chart] Chart not initialized yet');
            return;
        }

        console.log('[TradingView Chart] Changing interval to:', interval);
        this.interval = interval;
        
        if (this.widget && this.chart.setResolution) {
            // TradingView widget method
            this.chart.setResolution(interval, () => {
                console.log('[TradingView Chart] Interval changed successfully');
            });
        } else {
            // Fallback: reload data for lightweight charts
            console.log('[TradingView Chart] Interval change not supported in fallback mode');
        }
    }

    changeChartType(type) {
        if (!this.isInitialized) {
            console.warn('[TradingView Chart] Chart not initialized yet');
            return;
        }

        if (this.widget && this.chart.setChartType) {
            // TradingView widget method
            const chartTypes = {
                'candlestick': 1,
                'line': 2,
                'area': 3,
                'bars': 0,
                'heiken_ashi': 8,
                'hollow_candles': 9
            };

            const chartType = chartTypes[type] !== undefined ? chartTypes[type] : 1;
            
            console.log('[TradingView Chart] Changing chart type to:', type, 'TradingView type:', chartType);
            this.chart.setChartType(chartType);
        } else {
            // Fallback: Limited chart type support for lightweight charts
            console.log('[TradingView Chart] Chart type change limited in fallback mode:', type);
            if (type === 'line' && this.candlestickSeries) {
                // Could implement line series switching here
                console.warn('[TradingView Chart] Line chart not implemented in fallback mode');
            }
        }
    }

    // Event callbacks
    onChartReady() {
        // Override this method to add custom logic when chart is ready
        console.log('[TradingView Chart] Chart ready callback');
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('tradingViewChartReady', {
            detail: { widget: this.widget, chart: this.chart }
        }));
    }

    // Fallback to lightweight charts when TradingView is not available
    async initializeFallbackChart() {
        try {
            // Dynamically import lightweight charts
            const { createChart } = await import('lightweight-charts');
            
            console.log('[TradingView Chart] Initializing fallback lightweight chart...');
            
            // Create lightweight chart
            this.chart = createChart(this.container, {
                layout: {
                    background: { type: 'solid', color: '#0B1426' },
                    textColor: '#d1d4dc',
                },
                grid: {
                    vertLines: { color: 'rgba(42, 46, 57, 0.2)' },
                    horzLines: { color: 'rgba(42, 46, 57, 0.2)' }
                },
                rightPriceScale: {
                    borderColor: 'rgba(42, 46, 57, 0.3)',
                },
                timeScale: {
                    borderColor: 'rgba(42, 46, 57, 0.3)',
                    timeVisible: true,
                },
                width: this.container.clientWidth,
                height: this.container.clientHeight || 400,
            });

            // Add candlestick series
            this.candlestickSeries = this.chart.addCandlestickSeries({
                upColor: '#26a69a',
                downColor: '#ef5350',
                borderUpColor: '#26a69a',
                borderDownColor: '#ef5350',
                wickUpColor: '#26a69a',
                wickDownColor: '#ef5350'
            });

            // Load sample data
            this.loadFallbackData();
            
            this.isInitialized = true;
            console.log('[TradingView Chart] Fallback chart initialized successfully');

            // Add notification
            this.showFallbackNotification();

        } catch (error) {
            console.error('[TradingView Chart] Error initializing fallback chart:', error);
            this.showLibraryError();
        }
    }

    loadFallbackData() {
        const data = [];
        const basePrice = 45000;
        const now = new Date();
        
        // Generate 30 days of data
        for (let i = 30; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const timeString = date.toISOString().split('T')[0];
            
            const volatility = 0.02;
            const trend = Math.sin(i / 10) * 0.1;
            const randomChange = (Math.random() - 0.5) * volatility;
            const priceMultiplier = 1 + trend + randomChange;
            const price = basePrice * priceMultiplier;
            
            const open = i === 30 ? basePrice : data[data.length - 1]?.close || price;
            const range = price * 0.05;
            const high = price + Math.random() * range;
            const low = price - Math.random() * range;
            const close = low + Math.random() * (high - low);
            
            data.push({
                time: timeString,
                open: Math.round(open * 100) / 100,
                high: Math.round(high * 100) / 100,
                low: Math.round(low * 100) / 100,
                close: Math.round(close * 100) / 100
            });
        }
        
        this.candlestickSeries.setData(data);
        this.chart.timeScale().fitContent();
    }

    showFallbackNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255, 193, 7, 0.9);
            color: #000;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            z-index: 1000;
            max-width: 200px;
        `;
        notification.textContent = 'Using fallback chart. Get TradingView library for advanced features.';
        
        this.container.style.position = 'relative';
        this.container.appendChild(notification);
        
        // Auto-hide notification after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    // Error handling
    showLibraryError() {
        if (this.container) {
            this.container.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #0B1426; color: #d1d4dc; text-align: center; padding: 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ff6b6b; margin-bottom: 20px;"></i>
                    <h3 style="margin: 0 0 10px 0; color: #ff6b6b;">TradingView Library Not Found</h3>
                    <p style="margin: 0 0 20px 0; max-width: 400px; line-height: 1.5;">
                        The TradingView Advanced Charts library is required but not loaded. 
                        Please ensure you have access to the library and it's properly included.
                    </p>
                    <div style="background: #1e2a3a; padding: 15px; border-radius: 8px; max-width: 500px;">
                        <h4 style="margin: 0 0 10px 0; color: #00f7ff;">How to get TradingView Advanced Charts:</h4>
                        <ul style="text-align: left; margin: 0; padding-left: 20px;">
                            <li>Visit <a href="https://www.tradingview.com/charting-library/" style="color: #00f7ff;">TradingView Charting Library</a></li>
                            <li>Request access to the repository</li>
                            <li>Clone the library to your project</li>
                            <li>Include the charting_library.js script</li>
                        </ul>
                    </div>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #00f7ff; color: #0B1426; border: none; border-radius: 5px; cursor: pointer;">
                        Retry
                    </button>
                </div>
            `;
        }
    }

    showInitializationError(error) {
        if (this.container) {
            this.container.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #0B1426; color: #d1d4dc; text-align: center; padding: 20px;">
                    <i class="fas fa-chart-line" style="font-size: 48px; color: #ff6b6b; margin-bottom: 20px;"></i>
                    <h3 style="margin: 0 0 10px 0; color: #ff6b6b;">Chart Initialization Error</h3>
                    <p style="margin: 0 0 15px 0;">Failed to initialize TradingView chart</p>
                    <pre style="background: #1e2a3a; padding: 10px; border-radius: 5px; font-size: 12px; max-width: 90%; overflow: auto;">${error.message}</pre>
                    <button onclick="location.reload()" style="margin-top: 15px; padding: 8px 16px; background: #00f7ff; color: #0B1426; border: none; border-radius: 4px; cursor: pointer;">
                        Reload Page
                    </button>
                </div>
            `;
        }
    }

    // Cleanup
    destroy() {
        if (this.widget) {
            try {
                this.widget.remove();
                console.log('[TradingView Chart] Widget destroyed');
            } catch (error) {
                console.error('[TradingView Chart] Error destroying widget:', error);
            }
        }
        this.widget = null;
        this.chart = null;
        this.isInitialized = false;
    }

    // Status methods
    isReady() {
        return this.isInitialized;
    }

    getSymbol() {
        return this.symbol;
    }

    getInterval() {
        return this.interval;
    }
} 