import { createChart } from 'lightweight-charts';

export class ChartComponent {
    constructor(container) {
        this.container = container;
        this.symbol = 'BTC/USDT';
        this.timeframe = '1H';
        
        // Chart options with improved styling
        const chartOptions = {
            layout: {
                background: { type: 'solid', color: 'transparent' },
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 0.2)' },
                horzLines: { color: 'rgba(42, 46, 57, 0.2)' }
            },
            rightPriceScale: {
                borderColor: 'rgba(42, 46, 57, 0.3)',
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
            },
            timeScale: {
                borderColor: 'rgba(42, 46, 57, 0.3)',
                timeVisible: true,
                secondsVisible: false,
            },
            crosshair: {
                vertLine: {
                    color: 'rgba(0, 247, 255, 0.1)',
                    width: 1,
                    style: 1,
                },
                horzLine: {
                    color: 'rgba(0, 247, 255, 0.1)',
                    width: 1,
                    style: 1,
                }
            },
            width: container.clientWidth,
            height: container.clientHeight || 400,
        };

        this.chart = createChart(container, chartOptions);

        // Create different series for different chart types
        this.candlestickSeries = this.chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderUpColor: '#26a69a',
            borderDownColor: '#ef5350',
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350'
        });

        this.lineSeries = this.chart.addLineSeries({
            color: '#00f7ff',
            lineWidth: 2,
            visible: false
        });

        this.areaSeries = this.chart.addAreaSeries({
            topColor: 'rgba(0, 247, 255, 0.4)',
            bottomColor: 'rgba(0, 247, 255, 0.0)',
            lineColor: '#00f7ff',
            lineWidth: 2,
            visible: false
        });

        // Set initial data
        this.setInitialData();
        
        // Handle container resize
        this.setupResize();
        
        // Current chart type
        this.currentChartType = 'candlestick';
    }

    setInitialData() {
        const basePrice = 43500;
        const data = [];
        
        // Generate data starting from 100 days ago
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 100);
        
        // Generate realistic sample data with proper time ordering
        for (let i = 0; i < 100; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            // Use YYYY-MM-DD format for daily data, which lightweight-charts expects
            const timeString = currentDate.toISOString().split('T')[0];
            
            // Generate realistic price movement
            const dayProgress = i / 100;
            const volatility = 0.02; // 2% daily volatility
            const trend = Math.sin(dayProgress * Math.PI * 4) * 0.1; // Some trending movement
            const randomChange = (Math.random() - 0.5) * volatility;
            
            const priceMultiplier = 1 + trend + randomChange;
            const baseCurrentPrice = basePrice * (1 + dayProgress * 0.1) * priceMultiplier;
            
            // Generate OHLC data
            const open = i === 0 ? basePrice : data[i - 1].close;
            const volatilityRange = open * 0.05; // 5% intraday range
            
            const high = open + Math.random() * volatilityRange;
            const low = open - Math.random() * volatilityRange;
            const close = low + Math.random() * (high - low);
            
            data.push({
                time: timeString,
                open: Math.round(open * 100) / 100,
                high: Math.round(high * 100) / 100,
                low: Math.round(low * 100) / 100,
                close: Math.round(close * 100) / 100
            });
        }
        
        // Sort data by time to ensure proper ordering (though it should already be ordered)
        data.sort((a, b) => new Date(a.time) - new Date(b.time));
        
        console.log('Generated chart data:', data.slice(0, 3), '...', data.slice(-2));
        
        // Set data for all series
        this.candlestickSeries.setData(data);
        
        // Convert to line data for other chart types
        const lineData = data.map(item => ({
            time: item.time,
            value: item.close
        }));
        
        this.lineSeries.setData(lineData);
        this.areaSeries.setData(lineData);
        
        // Store last price for updates
        this.lastPrice = data[data.length - 1].close;
        
        this.chart.timeScale().fitContent();
    }

    changeChartType(type) {
        // Hide all series first
        this.candlestickSeries.applyOptions({ visible: false });
        this.lineSeries.applyOptions({ visible: false });
        this.areaSeries.applyOptions({ visible: false });
        
        // Show selected series
        switch (type) {
            case 'line':
                this.lineSeries.applyOptions({ visible: true });
                break;
            case 'area':
                this.areaSeries.applyOptions({ visible: true });
                break;
            case 'candlestick':
            default:
                this.candlestickSeries.applyOptions({ visible: true });
                break;
        }
        
        this.currentChartType = type;
        console.log(`Chart type changed to: ${type}`);
    }

    setSymbol(symbol) {
        this.symbol = symbol;
        console.log(`Chart symbol changed to: ${symbol}`);
        // In a real implementation, this would fetch new data
        this.setInitialData();
    }

    setTimeframe(timeframe) {
        this.timeframe = timeframe;
        console.log(`Chart timeframe changed to: ${timeframe}`);
        // In a real implementation, this would fetch new data for different timeframe
        this.setInitialData();
    }

    updatePrice(newPrice) {
        // Update with new price data
        const now = new Date();
        const timeString = now.toISOString().split('T')[0];
        
        // For real-time updates, we should update the last candle or add a new one
        // For demo purposes, we'll simulate adding a new data point
        try {
            if (this.currentChartType === 'candlestick') {
                this.candlestickSeries.update({
                    time: timeString,
                    open: this.lastPrice || newPrice,
                    high: Math.max(this.lastPrice || newPrice, newPrice + 10),
                    low: Math.min(this.lastPrice || newPrice, newPrice - 10),
                    close: newPrice
                });
            } else {
                const updateData = {
                    time: timeString,
                    value: newPrice
                };
                this.lineSeries.update(updateData);
                this.areaSeries.update(updateData);
            }
            this.lastPrice = newPrice;
        } catch (error) {
            console.log('Price update skipped (duplicate time):', error.message);
        }
    }

    setupResize() {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                this.chart.applyOptions({
                    width: width,
                    height: height
                });
            }
        });
        
        resizeObserver.observe(this.container);
        
        // Also handle window resize
        window.addEventListener('resize', () => {
            this.chart.applyOptions({
                width: this.container.clientWidth,
                height: this.container.clientHeight
            });
        });
    }

    destroy() {
        this.chart.remove();
    }
} 