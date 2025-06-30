import { createChart } from 'lightweight-charts';


export class ChartComponent {
    constructor(container) {
        

        // Chart options dengan warna yang disesuaikan
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

        this.chart = createChart(container, chartOptions);

        // Candlestick series dengan warna kustom
        this.candlestickSeries = this.chart.addCandlestickSeries({
            upColor: '#26a69a',        // Warna hijau untuk candle naik
            downColor: '#ef5350',      // Warna merah untuk candle turun
            borderUpColor: '#26a69a',
            borderDownColor: '#ef5350',
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350'
        });

        // Set data awal
        this.setInitialData();
    }

    setInitialData() {
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
            { time: '2024-01-10', open: 118.0, high: 120.0, low: 116.0, close: 117.0 },
            { time: '2024-01-11', open: 117.0, high: 118.0, low: 113.0, close: 114.0 },
            { time: '2024-01-12', open: 114.0, high: 116.0, low: 110.0, close: 115.0 },
            { time: '2024-01-13', open: 115.0, high: 120.0, low: 114.0, close: 119.0 },
            { time: '2024-01-14', open: 119.0, high: 123.0, low: 117.0, close: 120.0 },
            { time: '2024-01-15', open: 120.0, high: 121.0, low: 115.0, close: 116.0 },
            { time: '2024-01-16', open: 116.0, high: 118.0, low: 113.0, close: 115.0 },
            { time: '2024-01-17', open: 115.0, high: 117.0, low: 111.0, close: 112.0 },
            { time: '2024-01-18', open: 112.0, high: 114.0, low: 110.0, close: 113.0 },
            { time: '2024-01-19', open: 113.0, high: 116.0, low: 112.0, close: 115.0 },
            { time: '2024-01-20', open: 115.0, high: 118.0, low: 114.0, close: 117.0 }
        ];
        
        this.candlestickSeries.setData(data);
        this.chart.timeScale().fitContent();
    }

} 