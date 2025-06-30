import { createChart } from 'lightweight-charts';

export class ChartService {
    constructor(container) {
        this.container = container;
        this.symbol = 'BTC/USDT';
        this.timeframe = '1H';
        this.lastPrice = 117;
        this.priceCallback = null;
        this.chartOptions = {
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
            }
        };
        this.chart = createChart(container, this.chartOptions);
        this.candlestickSeries = this.chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderUpColor: '#26a69a',
            borderDownColor: '#ef5350',
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350'
        });
        this.setInitialData();
        this.simulateLivePrice();
    }

    setInitialData() {
        // Dummy data, can be replaced with real API
        const data = [
            { time: '2024-01-01', open: 100.0, high: 105.0, low: 96.0, close: 103.0 },
            { time: '2024-01-02', open: 103.0, high: 107.0, low: 95.0, close: 101.0 },
            { time: '2024-01-03', open: 101.0, high: 110.0, low: 98.0, close: 105.0 },
            { time: '2024-01-04', open: 105.0, high: 108.0, low: 103.0, close: 107.0 },
            { time: '2024-01-05', open: 107.0, high: 115.0, low: 105.0, close: 113.0 },
            { time: '2024-01-06', open: 113.0, high: 117.0, low: 109.0, close: 110.0 },
            { time: '2024-01-07', open: 110.0, high: 112.0, low: 106.0, close: 109.0 },
            { time: '2024-01-08', open: 109.0, high: 114.0, low: 107.0, close: 112.0 },
            { time: '2024-01-09', open: 112.0, high: 119.0, low: 110.0, close: 118.0 },
            { time: '2024-01-10', open: 118.0, high: 120.0, low: 116.0, close: 117.0 }
        ];
        this.candlestickSeries.setData(data);
        this.chart.timeScale().fitContent();
        this.lastPrice = data[data.length - 1].close;
        this.updatePriceDisplay();
    }

    setSymbol(symbol) {
        this.symbol = symbol;
        // TODO: fetch new data for symbol
        this.setInitialData();
    }

    setTimeframe(timeframe) {
        this.timeframe = timeframe;
        // TODO: fetch new data for timeframe
        this.setInitialData();
    }

    onPriceUpdate(callback) {
        this.priceCallback = callback;
    }

    simulateLivePrice() {
        setInterval(() => {
            // Simulate price change
            const change = (Math.random() - 0.5) * 2;
            const newPrice = Math.max(90, Math.round((this.lastPrice + change) * 100) / 100);
            if (newPrice !== this.lastPrice) {
                this.lastPrice = newPrice;
                // Animate price update
                this.animatePriceChange();
                if (this.priceCallback) this.priceCallback(newPrice);
            }
        }, 3000);
    }

    animatePriceChange() {
        const priceSpan = document.getElementById('lastPrice');
        if (priceSpan) {
            priceSpan.classList.remove('price-animate');
            void priceSpan.offsetWidth; // trigger reflow
            priceSpan.classList.add('price-animate');
        }
    }

    updatePriceDisplay() {
        const priceSpan = document.getElementById('lastPrice');
        if (priceSpan) {
            priceSpan.innerHTML = `<span class="live-dot"></span>Last Price: $${this.lastPrice} <span class="price-up">▲</span>`;
        }
    }

    resize() {
        this.chart.applyOptions({
            width: this.container.clientWidth,
            height: this.container.clientHeight
        });
    }

    destroy() {
        this.chart.remove();
    }
}

export function createChartService(container) {
    return new ChartService(container);
} 