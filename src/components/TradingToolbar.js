export class TradingToolbar {
    constructor(containerId, chartInstance) {
        this.container = document.getElementById(containerId);
        this.chart = chartInstance;
        this.activeCategory = 'chartTypes';
        this.activeDrawingTool = null;
        this.activeIndicators = new Set();
        
        this.init();
    }

    init() {
        if (!this.container) {
            console.error('Trading toolbar container not found');
            return;
        }

        this.container.innerHTML = this.getToolbarHTML();
        this.setupEventListeners();
    }

    getToolbarHTML() {
        return `
            <div class="trading-toolbar">
                <!-- Main Toolbar -->
                <div class="toolbar-main">
                    <!-- Chart Types -->
                    <div class="toolbar-section chart-types">
                        <div class="section-header">
                            <i class="fas fa-chart-bar"></i>
                            <span>Charts</span>
                        </div>
                        <div class="section-content">
                            ${this.getChartTypesHTML()}
                        </div>
                    </div>

                    <!-- Drawing Tools -->
                    <div class="toolbar-section drawing-tools">
                        <div class="section-header">
                            <i class="fas fa-pencil-alt"></i>
                            <span>Draw</span>
                            <i class="fas fa-chevron-down expand-icon"></i>
                        </div>
                        <div class="section-content" style="display: none;">
                            ${this.getDrawingToolsHTML()}
                        </div>
                    </div>

                    <!-- Technical Indicators -->
                    <div class="toolbar-section indicators">
                        <div class="section-header">
                            <i class="fas fa-chart-line"></i>
                            <span>Indicators</span>
                            <i class="fas fa-chevron-down expand-icon"></i>
                        </div>
                        <div class="section-content" style="display: none;">
                            ${this.getIndicatorsHTML()}
                        </div>
                    </div>

                    <!-- Timeframes -->
                    <div class="toolbar-section timeframes">
                        <div class="section-header">
                            <i class="fas fa-clock"></i>
                            <span>Timeframe</span>
                        </div>
                        <div class="section-content">
                            ${this.getTimeframesHTML()}
                        </div>
                    </div>

                    <!-- Chart Settings -->
                    <div class="toolbar-section settings">
                        <div class="section-header">
                            <i class="fas fa-cog"></i>
                            <span>Settings</span>
                            <i class="fas fa-chevron-down expand-icon"></i>
                        </div>
                        <div class="section-content" style="display: none;">
                            ${this.getSettingsHTML()}
                        </div>
                    </div>

                    <!-- Templates -->
                    <div class="toolbar-section templates">
                        <div class="section-header">
                            <i class="fas fa-save"></i>
                            <span>Templates</span>
                            <i class="fas fa-chevron-down expand-icon"></i>
                        </div>
                        <div class="section-content" style="display: none;">
                            ${this.getTemplatesHTML()}
                        </div>
                    </div>

                    <!-- Alerts -->
                    <div class="toolbar-section alerts">
                        <div class="section-header">
                            <i class="fas fa-bell"></i>
                            <span>Alerts</span>
                        </div>
                        <div class="section-content">
                            ${this.getAlertsHTML()}
                        </div>
                    </div>
                </div>

                <!-- Active Tool Info -->
                <div class="active-tool-info" style="display: none;">
                    <div class="tool-name"></div>
                    <div class="tool-options"></div>
                    <button class="tool-cancel">
                        <i class="fas fa-times"></i>
                        Cancel
                    </button>
                </div>

                <!-- Indicator Panel -->
                <div class="indicator-panel" style="display: none;">
                    <div class="panel-header">
                        <h3>Add Indicator</h3>
                        <button class="panel-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="panel-content">
                        ${this.getIndicatorPanelHTML()}
                    </div>
                </div>
            </div>
        `;
    }

    getChartTypesHTML() {
        const chartTypes = [
            { id: 'candlestick', icon: 'fas fa-chart-bar', name: 'Candlestick', active: true },
            { id: 'line', icon: 'fas fa-chart-line', name: 'Line' },
            { id: 'area', icon: 'fas fa-chart-area', name: 'Area' },
            { id: 'hollow_candles', icon: 'far fa-chart-bar', name: 'Hollow Candles' },
            { id: 'heikin_ashi', icon: 'fas fa-bars', name: 'Heikin Ashi' },
            { id: 'renko', icon: 'fas fa-th', name: 'Renko' },
            { id: 'point_figure', icon: 'fas fa-times', name: 'Point & Figure' }
        ];

        return chartTypes.map(type => `
            <button class="chart-type-btn ${type.active ? 'active' : ''}" data-type="${type.id}" title="${type.name}">
                <i class="${type.icon}"></i>
                <span>${type.name}</span>
            </button>
        `).join('');
    }

    getDrawingToolsHTML() {
        const drawingTools = [
            { 
                category: 'Lines',
                tools: [
                    { id: 'trend_line', icon: 'fas fa-slash', name: 'Trend Line' },
                    { id: 'horizontal_line', icon: 'fas fa-minus', name: 'Horizontal Line' },
                    { id: 'vertical_line', icon: 'fas fa-grip-lines-vertical', name: 'Vertical Line' },
                    { id: 'ray', icon: 'fas fa-arrow-right', name: 'Ray' },
                    { id: 'extended_line', icon: 'fas fa-arrows-alt-h', name: 'Extended Line' }
                ]
            },
            {
                category: 'Fibonacci',
                tools: [
                    { id: 'fib_retracement', icon: 'fas fa-project-diagram', name: 'Fibonacci Retracement' },
                    { id: 'fib_extension', icon: 'fas fa-expand-arrows-alt', name: 'Fibonacci Extension' },
                    { id: 'fib_fan', icon: 'fas fa-fan', name: 'Fibonacci Fan' },
                    { id: 'fib_arc', icon: 'fas fa-circle-notch', name: 'Fibonacci Arc' }
                ]
            },
            {
                category: 'Shapes',
                tools: [
                    { id: 'rectangle', icon: 'far fa-square', name: 'Rectangle' },
                    { id: 'circle', icon: 'far fa-circle', name: 'Circle' },
                    { id: 'triangle', icon: 'fas fa-play', name: 'Triangle' },
                    { id: 'parallelogram', icon: 'fas fa-shapes', name: 'Parallelogram' }
                ]
            },
            {
                category: 'Channels',
                tools: [
                    { id: 'parallel_channel', icon: 'fas fa-equals', name: 'Parallel Channel' },
                    { id: 'disjoint_channel', icon: 'fas fa-not-equal', name: 'Disjoint Channel' },
                    { id: 'regression_trend', icon: 'fas fa-chart-line', name: 'Regression Trend' }
                ]
            },
            {
                category: 'Patterns',
                tools: [
                    { id: 'head_shoulders', icon: 'fas fa-mountain', name: 'Head & Shoulders' },
                    { id: 'abcd', icon: 'fas fa-font', name: 'ABCD Pattern' },
                    { id: 'gartley', icon: 'fas fa-star', name: 'Gartley' },
                    { id: 'butterfly', icon: 'fas fa-leaf', name: 'Butterfly' }
                ]
            },
            {
                category: 'Annotations',
                tools: [
                    { id: 'text', icon: 'fas fa-font', name: 'Text' },
                    { id: 'note', icon: 'fas fa-sticky-note', name: 'Note' },
                    { id: 'arrow', icon: 'fas fa-arrow-up', name: 'Arrow' },
                    { id: 'flag', icon: 'fas fa-flag', name: 'Flag' }
                ]
            }
        ];

        return drawingTools.map(category => `
            <div class="tool-category">
                <div class="category-header">${category.category}</div>
                <div class="category-tools">
                    ${category.tools.map(tool => `
                        <button class="drawing-tool-btn" data-tool="${tool.id}" title="${tool.name}">
                            <i class="${tool.icon}"></i>
                            <span>${tool.name}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    getIndicatorsHTML() {
        const indicators = [
            {
                category: 'Trend',
                items: [
                    { id: 'ema', name: 'EMA', full: 'Exponential Moving Average' },
                    { id: 'sma', name: 'SMA', full: 'Simple Moving Average' },
                    { id: 'bollinger', name: 'Bollinger Bands', full: 'Bollinger Bands' },
                    { id: 'parabolic_sar', name: 'Parabolic SAR', full: 'Parabolic SAR' },
                    { id: 'ichimoku', name: 'Ichimoku', full: 'Ichimoku Cloud' }
                ]
            },
            {
                category: 'Momentum',
                items: [
                    { id: 'rsi', name: 'RSI', full: 'Relative Strength Index' },
                    { id: 'macd', name: 'MACD', full: 'Moving Average Convergence Divergence' },
                    { id: 'stochastic', name: 'Stochastic', full: 'Stochastic Oscillator' },
                    { id: 'cci', name: 'CCI', full: 'Commodity Channel Index' },
                    { id: 'williams_r', name: 'Williams %R', full: 'Williams %R' }
                ]
            },
            {
                category: 'Volume',
                items: [
                    { id: 'volume', name: 'Volume', full: 'Volume' },
                    { id: 'obv', name: 'OBV', full: 'On Balance Volume' },
                    { id: 'vwap', name: 'VWAP', full: 'Volume Weighted Average Price' },
                    { id: 'ad_line', name: 'A/D Line', full: 'Accumulation/Distribution Line' }
                ]
            },
            {
                category: 'Volatility',
                items: [
                    { id: 'atr', name: 'ATR', full: 'Average True Range' },
                    { id: 'volatility', name: 'Volatility', full: 'Volatility' },
                    { id: 'chaikin', name: 'Chaikin Volatility', full: 'Chaikin Volatility' }
                ]
            }
        ];

        return indicators.map(category => `
            <div class="indicator-category">
                <div class="category-header">${category.category}</div>
                <div class="category-indicators">
                    ${category.items.map(indicator => `
                        <button class="indicator-btn" data-indicator="${indicator.id}" title="${indicator.full}">
                            <span class="indicator-name">${indicator.name}</span>
                            <span class="indicator-full">${indicator.full}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    getTimeframesHTML() {
        const timeframes = [
            { id: '1m', name: '1m' },
            { id: '5m', name: '5m' },
            { id: '15m', name: '15m' },
            { id: '30m', name: '30m' },
            { id: '1H', name: '1H', active: true },
            { id: '4H', name: '4H' },
            { id: '1D', name: '1D' },
            { id: '1W', name: '1W' },
            { id: '1M', name: '1M' }
        ];

        return timeframes.map(tf => `
            <button class="timeframe-btn ${tf.active ? 'active' : ''}" data-timeframe="${tf.id}">
                ${tf.name}
            </button>
        `).join('');
    }

    getSettingsHTML() {
        return `
            <div class="settings-group">
                <div class="setting-item">
                    <label>Theme</label>
                    <select class="setting-select" data-setting="theme">
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                    </select>
                </div>
                
                <div class="setting-item">
                    <label>Grid</label>
                    <input type="checkbox" class="setting-checkbox" data-setting="grid" checked>
                </div>
                
                <div class="setting-item">
                    <label>Crosshair</label>
                    <input type="checkbox" class="setting-checkbox" data-setting="crosshair" checked>
                </div>
                
                <div class="setting-item">
                    <label>Price Scale</label>
                    <select class="setting-select" data-setting="priceScale">
                        <option value="normal">Normal</option>
                        <option value="percentage">Percentage</option>
                        <option value="logarithmic">Logarithmic</option>
                    </select>
                </div>
                
                <div class="setting-item">
                    <label>Timezone</label>
                    <select class="setting-select" data-setting="timezone">
                        <option value="UTC">UTC</option>
                        <option value="EST">EST</option>
                        <option value="JST">JST</option>
                    </select>
                </div>
            </div>
        `;
    }

    getTemplatesHTML() {
        return `
            <div class="templates-group">
                <button class="template-btn save-template">
                    <i class="fas fa-save"></i>
                    Save Current Layout
                </button>
                
                <button class="template-btn load-template">
                    <i class="fas fa-folder-open"></i>
                    Load Template
                </button>
                
                <div class="saved-templates">
                    <div class="template-item">
                        <span>Default Layout</span>
                        <div class="template-actions">
                            <button class="load-btn" title="Load">
                                <i class="fas fa-play"></i>
                            </button>
                            <button class="delete-btn" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getAlertsHTML() {
        return `
            <div class="alerts-group">
                <button class="alert-btn add-alert">
                    <i class="fas fa-plus"></i>
                    Add Alert
                </button>
                
                <div class="alert-list">
                    <!-- Active alerts will appear here -->
                </div>
            </div>
        `;
    }

    getIndicatorPanelHTML() {
        return `
            <div class="indicator-search">
                <input type="text" placeholder="Search indicators..." class="indicator-search-input">
            </div>
            
            <div class="indicator-categories">
                <div class="category-tabs">
                    <button class="category-tab active" data-category="all">All</button>
                    <button class="category-tab" data-category="trend">Trend</button>
                    <button class="category-tab" data-category="momentum">Momentum</button>
                    <button class="category-tab" data-category="volume">Volume</button>
                    <button class="category-tab" data-category="volatility">Volatility</button>
                </div>
                
                <div class="indicator-list">
                    <!-- Indicators will be populated here -->
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Section toggles
        this.container.querySelectorAll('.section-header').forEach(header => {
            header.addEventListener('click', this.toggleSection.bind(this));
        });

        // Chart type buttons
        this.container.querySelectorAll('.chart-type-btn').forEach(btn => {
            btn.addEventListener('click', this.handleChartTypeChange.bind(this));
        });

        // Drawing tool buttons
        this.container.querySelectorAll('.drawing-tool-btn').forEach(btn => {
            btn.addEventListener('click', this.handleDrawingToolSelect.bind(this));
        });

        // Indicator buttons
        this.container.querySelectorAll('.indicator-btn').forEach(btn => {
            btn.addEventListener('click', this.handleIndicatorSelect.bind(this));
        });

        // Timeframe buttons
        this.container.querySelectorAll('.timeframe-btn').forEach(btn => {
            btn.addEventListener('click', this.handleTimeframeChange.bind(this));
        });

        // Settings controls
        this.container.querySelectorAll('.setting-select, .setting-checkbox').forEach(control => {
            control.addEventListener('change', this.handleSettingChange.bind(this));
        });

        // Tool cancel button
        const cancelBtn = this.container.querySelector('.tool-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', this.cancelActiveTool.bind(this));
        }

        // Alert button
        const addAlertBtn = this.container.querySelector('.add-alert');
        if (addAlertBtn) {
            addAlertBtn.addEventListener('click', this.addAlert.bind(this));
        }
    }

    toggleSection(e) {
        const header = e.currentTarget;
        const content = header.nextElementSibling;
        const expandIcon = header.querySelector('.expand-icon');
        
        if (content && expandIcon) {
            const isOpen = content.style.display !== 'none';
            content.style.display = isOpen ? 'none' : 'block';
            expandIcon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        }
    }

    handleChartTypeChange(e) {
        const button = e.currentTarget;
        const chartType = button.dataset.type;
        
        // Update active state
        this.container.querySelectorAll('.chart-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        // Apply to chart
        if (this.chart && this.chart.changeChartType) {
            this.chart.changeChartType(chartType);
        }
        
        console.log(`Chart type changed to: ${chartType}`);
    }

    handleDrawingToolSelect(e) {
        const button = e.currentTarget;
        const tool = button.dataset.tool;
        
        // Set active drawing tool
        this.activeDrawingTool = tool;
        
        // Update UI
        this.container.querySelectorAll('.drawing-tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        // Show active tool info
        this.showActiveToolInfo(tool);
        
        console.log(`Drawing tool selected: ${tool}`);
    }

    handleIndicatorSelect(e) {
        const button = e.currentTarget;
        const indicator = button.dataset.indicator;
        
        // Toggle indicator
        if (this.activeIndicators.has(indicator)) {
            this.activeIndicators.delete(indicator);
            button.classList.remove('active');
        } else {
            this.activeIndicators.add(indicator);
            button.classList.add('active');
        }
        
        // Apply to chart
        this.applyIndicator(indicator, this.activeIndicators.has(indicator));
        
        console.log(`Indicator ${indicator} ${this.activeIndicators.has(indicator) ? 'added' : 'removed'}`);
    }

    handleTimeframeChange(e) {
        const button = e.currentTarget;
        const timeframe = button.dataset.timeframe;
        
        // Update active state
        this.container.querySelectorAll('.timeframe-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        // Apply to chart
        if (this.chart && this.chart.changeInterval) {
            this.chart.changeInterval(timeframe);
        }
        
        console.log(`Timeframe changed to: ${timeframe}`);
    }

    handleSettingChange(e) {
        const control = e.currentTarget;
        const setting = control.dataset.setting;
        const value = control.type === 'checkbox' ? control.checked : control.value;
        
        // Apply setting
        this.applySetting(setting, value);
        
        console.log(`Setting ${setting} changed to:`, value);
    }

    showActiveToolInfo(tool) {
        const toolInfo = this.container.querySelector('.active-tool-info');
        const toolName = this.container.querySelector('.tool-name');
        
        if (toolInfo && toolName) {
            toolName.textContent = this.getToolDisplayName(tool);
            toolInfo.style.display = 'flex';
        }
    }

    getToolDisplayName(tool) {
        const names = {
            'trend_line': 'Trend Line',
            'horizontal_line': 'Horizontal Line',
            'vertical_line': 'Vertical Line',
            'fib_retracement': 'Fibonacci Retracement',
            'rectangle': 'Rectangle',
            'circle': 'Circle',
            'text': 'Text Annotation'
        };
        
        return names[tool] || tool.replace('_', ' ').toUpperCase();
    }

    cancelActiveTool() {
        this.activeDrawingTool = null;
        
        // Hide tool info
        const toolInfo = this.container.querySelector('.active-tool-info');
        if (toolInfo) {
            toolInfo.style.display = 'none';
        }
        
        // Remove active states
        this.container.querySelectorAll('.drawing-tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        console.log('Active drawing tool cancelled');
    }

    applyIndicator(indicator, add) {
        // This would integrate with the chart library to add/remove indicators
        console.log(`${add ? 'Adding' : 'Removing'} indicator: ${indicator}`);
        
        // Example implementation for different indicators
        switch (indicator) {
            case 'rsi':
                // Add RSI indicator
                break;
            case 'macd':
                // Add MACD indicator
                break;
            case 'bollinger':
                // Add Bollinger Bands
                break;
            default:
                console.log(`Indicator ${indicator} not implemented yet`);
        }
    }

    applySetting(setting, value) {
        // Apply chart settings
        switch (setting) {
            case 'theme':
                this.changeTheme(value);
                break;
            case 'grid':
                this.toggleGrid(value);
                break;
            case 'crosshair':
                this.toggleCrosshair(value);
                break;
            default:
                console.log(`Setting ${setting} not implemented yet`);
        }
    }

    changeTheme(theme) {
        // Implementation depends on chart library
        console.log(`Changing theme to: ${theme}`);
    }

    toggleGrid(show) {
        // Implementation depends on chart library
        console.log(`Grid ${show ? 'enabled' : 'disabled'}`);
    }

    toggleCrosshair(show) {
        // Implementation depends on chart library
        console.log(`Crosshair ${show ? 'enabled' : 'disabled'}`);
    }

    addAlert() {
        // Show alert creation dialog
        console.log('Adding new price alert');
        
        // This would open a modal for alert configuration
        this.showAlertDialog();
    }

    showAlertDialog() {
        // Implementation for alert creation dialog
        const alertPrice = prompt('Enter alert price:');
        if (alertPrice) {
            console.log(`Alert set for price: ${alertPrice}`);
            this.addAlertToList(alertPrice);
        }
    }

    addAlertToList(price) {
        const alertList = this.container.querySelector('.alert-list');
        if (alertList) {
            const alertItem = document.createElement('div');
            alertItem.className = 'alert-item';
            alertItem.innerHTML = `
                <div class="alert-info">
                    <span class="alert-price">$${price}</span>
                    <span class="alert-symbol">BTC/USD</span>
                </div>
                <button class="alert-remove" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            `;
            alertList.appendChild(alertItem);
        }
    }

    getActiveDrawingTool() {
        return this.activeDrawingTool;
    }

    getActiveIndicators() {
        return Array.from(this.activeIndicators);
    }
} 