// BinanceWebSocket stub: tidak konek ke WebSocket Binance, hanya return data dummy

export default class BinanceWebSocket {
    constructor() {
        this.connected = false;
        this.latestData = {
            symbol: 'BTCUSDT',
            price: 43500 + Math.random() * 5000, // Random starting price
            high_24h: 48000,
            low_24h: 42000,
            volume: 1234.56,
            change_24h: 2.5,
            timestamp: Date.now()
        };
        this.priceUpdateInterval = null;
        this.subscribers = new Set();
    }

    connect() {
        try {
            this.connected = true;
            console.log('Binance WebSocket connected (simulated)');
            
            // Start price simulation
            this.startPriceSimulation();
            return true;
        } catch (error) {
            console.error('Failed to connect to Binance WebSocket:', error);
            this.connected = false;
            return false;
        }
    }

    disconnect() {
        this.connected = false;
        if (this.priceUpdateInterval) {
            clearInterval(this.priceUpdateInterval);
            this.priceUpdateInterval = null;
        }
        console.log('Binance WebSocket disconnected');
    }

    startPriceSimulation() {
        // Update price every 2-5 seconds with realistic fluctuations
        this.priceUpdateInterval = setInterval(() => {
            this.simulatePriceUpdate();
        }, 2000 + Math.random() * 3000);
    }

    simulatePriceUpdate() {
        // Simulate realistic price movements
        const changePercent = (Math.random() - 0.5) * 0.02; // ±1% change
        const newPrice = this.latestData.price * (1 + changePercent);
        
        // Update data
        this.latestData = {
            ...this.latestData,
            price: Math.round(newPrice * 100) / 100,
            high_24h: Math.max(this.latestData.high_24h, newPrice),
            low_24h: Math.min(this.latestData.low_24h, newPrice),
            volume: this.latestData.volume + Math.random() * 10,
            change_24h: ((newPrice - 43000) / 43000) * 100,
            timestamp: Date.now()
        };

        // Notify subscribers
        this.notifySubscribers(this.latestData);
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    notifySubscribers(data) {
        this.subscribers.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error notifying subscriber:', error);
            }
        });
    }

    getLatestData() {
        return this.latestData;
    }

    // Method to change symbol (for future expansion)
    changeSymbol(symbol) {
        this.latestData.symbol = symbol;
        // In a real implementation, this would subscribe to a different stream
        console.log(`Changed symbol to ${symbol}`);
    }

    getConnectionStatus() {
        return {
            connected: this.connected,
            symbol: this.latestData.symbol,
            lastUpdate: this.latestData.timestamp
        };
    }
} 