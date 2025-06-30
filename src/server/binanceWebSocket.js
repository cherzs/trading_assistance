// BinanceWebSocket stub: tidak konek ke WebSocket Binance, hanya return data dummy

export default class BinanceWebSocket {
    constructor() {
        this.connected = true;
        this.latestData = {
            price: 117,
            high_24h: 125,
            low_24h: 92.5,
            volume: 1234.56
        };
    }

    connect() {
        // Tidak melakukan apa-apa
        this.connected = true;
    }

    getLatestData() {
        return this.latestData;
    }
} 