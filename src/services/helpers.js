// CoinMarketCap API key (will be loaded from environment)
// Note: In frontend, use VITE_ prefix for environment variables
export const apiKey = import.meta.env.VITE_COINMARKETCAP_API_KEY;

// Makes requests to CoinMarketCap API
export async function makeApiRequest(endpoint, params = {}) {
    try {
        const baseUrl = 'https://pro-api.coinmarketcap.com/v1';
        const url = new URL(`${baseUrl}/${endpoint}`);
        
        // Add parameters to URL
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });
        
        console.log(`[CoinMarketCap API] Making request to: ${endpoint}`, apiKey ? '(with API key)' : '(without API key)');
        
        const headers = {
            'X-CMC_PRO_API_KEY': apiKey,
            'Accept': 'application/json',
            'Accept-Encoding': 'deflate, gzip'
        };
        
        const response = await fetch(url.toString(), { headers });
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('CoinMarketCap API key is invalid or missing');
            }
            if (response.status === 429) {
                throw new Error('CoinMarketCap API rate limit exceeded');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status && data.status.error_code !== 0) {
            throw new Error(`CoinMarketCap API error: ${data.status.error_message}`);
        }
        
        return data;
    } catch (error) {
        console.error(`CoinMarketCap request error for ${endpoint}:`, error);
        
        // Provide fallback data for development/testing
        if (error.message.includes('CORS') || error.message.includes('network') || error.message.includes('rate limit')) {
            console.warn('[CoinMarketCap API] Using fallback data due to API unavailability');
            return getFallbackData(endpoint);
        }
        
        throw new Error(`CoinMarketCap request error: ${error.message}`);
    }
}

// Fallback data for development when API is unavailable
function getFallbackData(endpoint) {
    if (endpoint.includes('cryptocurrency/listings/latest')) {
        return {
            status: { error_code: 0, error_message: null },
            data: [
                {
                    id: 1,
                    name: "Bitcoin",
                    symbol: "BTC",
                    slug: "bitcoin",
                    quote: {
                        USD: {
                            price: 45000 + Math.random() * 5000,
                            volume_24h: 28000000000,
                            percent_change_1h: (Math.random() - 0.5) * 4,
                            percent_change_24h: (Math.random() - 0.5) * 8,
                            percent_change_7d: (Math.random() - 0.5) * 15,
                            market_cap: 900000000000,
                            last_updated: new Date().toISOString()
                        }
                    }
                },
                {
                    id: 1027,
                    name: "Ethereum",
                    symbol: "ETH",
                    slug: "ethereum",
                    quote: {
                        USD: {
                            price: 3000 + Math.random() * 500,
                            volume_24h: 15000000000,
                            percent_change_1h: (Math.random() - 0.5) * 3,
                            percent_change_24h: (Math.random() - 0.5) * 6,
                            percent_change_7d: (Math.random() - 0.5) * 12,
                            market_cap: 400000000000,
                            last_updated: new Date().toISOString()
                        }
                    }
                }
            ]
        };
    }
    
    if (endpoint.includes('cryptocurrency/quotes/latest')) {
        return {
            status: { error_code: 0, error_message: null },
            data: {
                1: {
                    id: 1,
                    name: "Bitcoin",
                    symbol: "BTC",
                    quote: {
                        USD: {
                            price: 45000 + Math.random() * 5000,
                            volume_24h: 28000000000,
                            percent_change_1h: (Math.random() - 0.5) * 4,
                            percent_change_24h: (Math.random() - 0.5) * 8,
                            last_updated: new Date().toISOString()
                        }
                    }
                }
            }
        };
    }
    
    if (endpoint.includes('cryptocurrency/ohlcv/historical')) {
        // Generate sample OHLCV data for CoinMarketCap format
        const data = [];
        for (let i = 30; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const price = 45000 + Math.random() * 5000;
            
            data.push({
                time_open: date.toISOString(),
                time_close: new Date(date.getTime() + 86400000).toISOString(),
                open: price,
                high: price * 1.02,
                low: price * 0.98,
                close: price + (Math.random() - 0.5) * 1000,
                volume: Math.random() * 1000000
            });
        }
        return {
            status: { error_code: 0, error_message: null },
            data: { quotes: data }
        };
    }
    
    return { 
        status: { error_code: 1, error_message: 'Fallback data not available for this endpoint' },
        data: null 
    };
}

// Dynamic cryptocurrency mapping (will be populated from CMC API)
export let CRYPTO_MAP = {
    'BTC': { id: 1, name: 'Bitcoin', symbol: 'BTC' },
    'ETH': { id: 1027, name: 'Ethereum', symbol: 'ETH' },
    'USDT': { id: 825, name: 'Tether', symbol: 'USDT' },
    'BNB': { id: 1839, name: 'BNB', symbol: 'BNB' },
    'SOL': { id: 5426, name: 'Solana', symbol: 'SOL' },
    'USDC': { id: 3408, name: 'USD Coin', symbol: 'USDC' },
    'XRP': { id: 52, name: 'XRP', symbol: 'XRP' },
    'DOGE': { id: 74, name: 'Dogecoin', symbol: 'DOGE' },
    'ADA': { id: 2010, name: 'Cardano', symbol: 'ADA' },
    'TRX': { id: 1958, name: 'TRON', symbol: 'TRX' },
    'LTC': { id: 2, name: 'Litecoin', symbol: 'LTC' },
    'DOT': { id: 6636, name: 'Polkadot', symbol: 'DOT' },
    'MATIC': { id: 3890, name: 'Polygon', symbol: 'MATIC' },
    'AVAX': { id: 5805, name: 'Avalanche', symbol: 'AVAX' },
    'LINK': { id: 1975, name: 'Chainlink', symbol: 'LINK' }
};

// Load cryptocurrency map from CoinMarketCap API
export async function loadCryptocurrencyMap() {
    try {
        console.log('[CoinMarketCap API] Loading cryptocurrency map...');
        const data = await makeApiRequest('cryptocurrency/map', {
            listing_status: 'active',
            limit: 500 // Get top 500 cryptocurrencies
        });

        if (data && data.data) {
            const newMap = {};
            data.data.forEach(crypto => {
                newMap[crypto.symbol] = {
                    id: crypto.id,
                    name: crypto.name,
                    symbol: crypto.symbol,
                    slug: crypto.slug,
                    is_active: crypto.is_active
                };
            });
            
            // Update the CRYPTO_MAP with fresh data
            Object.assign(CRYPTO_MAP, newMap);
            console.log(`[CoinMarketCap API] Loaded ${Object.keys(newMap).length} cryptocurrencies`);
            return newMap;
        }
    } catch (error) {
        console.warn('[CoinMarketCap API] Failed to load cryptocurrency map:', error.message);
        console.log('[CoinMarketCap API] Using fallback static map');
    }
    return CRYPTO_MAP;
}

// Get cryptocurrency metadata
export async function getCryptocurrencyInfo(ids) {
    try {
        const data = await makeApiRequest('cryptocurrency/info', {
            id: Array.isArray(ids) ? ids.join(',') : ids
        });
        
        if (data && data.data) {
            return data.data;
        }
    } catch (error) {
        console.warn('[CoinMarketCap API] Failed to get cryptocurrency info:', error.message);
    }
    return null;
}

// Generates a symbol for CoinMarketCap (simplified format)
export function generateSymbol(fromSymbol, toSymbol = 'USD') {
    const short = `${fromSymbol}/${toSymbol}`;
    const full = `CMC:${fromSymbol}/${toSymbol}`;
    const cryptoInfo = CRYPTO_MAP[fromSymbol];
    
    return {
        short,
        full,
        id: cryptoInfo?.id || null,
        name: cryptoInfo?.name || fromSymbol
    };
}

// Returns symbol information from full symbol
export function parseFullSymbol(fullSymbol) {
    // Handle both "CMC:BTC/USD" and "BTC/USD" formats
    const cleanSymbol = fullSymbol.replace(/^CMC:/, '');
    const match = cleanSymbol.match(/^(\w+)\/(\w+)$/);
    
    if (!match) {
        return null;
    }
    
    const fromSymbol = match[1];
    const toSymbol = match[2];
    const cryptoInfo = CRYPTO_MAP[fromSymbol];
    
    return { 
        exchange: 'CMC',
        fromSymbol: fromSymbol, 
        toSymbol: toSymbol,
        id: cryptoInfo?.id || null,
        name: cryptoInfo?.name || fromSymbol
    };
}

// Convert TradingView resolution to CoinMarketCap interval
export function resolutionToInterval(resolution) {
    const intervalMap = {
        '1': '1m',
        '5': '5m',
        '15': '15m',
        '30': '30m',
        '60': '1h',
        '1H': '1h',
        '4H': '4h',
        '1D': '1d',
        '1W': '7d',
        '1M': '1M'
    };
    return intervalMap[resolution] || '1d';
}

// Get data count based on resolution for historical data
export function getDataCount(resolution) {
    const countMap = {
        '1': 1440,   // 1 day of 1-minute data
        '5': 288,    // 1 day of 5-minute data
        '15': 96,    // 1 day of 15-minute data
        '30': 48,    // 1 day of 30-minute data
        '60': 168,   // 1 week of hourly data
        '1H': 168,   // 1 week of hourly data
        '4H': 180,   // 30 days of 4-hour data
        '1D': 365,   // 1 year of daily data
        '1W': 52,    // 1 year of weekly data
        '1M': 24     // 2 years of monthly data
    };
    return countMap[resolution] || 365;
}

// Convert CoinMarketCap OHLCV to TradingView format
export function convertOHLCVToTradingView(cmcData) {
    if (!cmcData || !cmcData.quotes) {
        return [];
    }
    
    return cmcData.quotes.map(quote => ({
        time: new Date(quote.time_open).getTime(),
        open: quote.open || 0,
        high: quote.high || 0,
        low: quote.low || 0,
        close: quote.close || 0,
        volume: quote.volume || 0
    })).sort((a, b) => a.time - b.time);
} 