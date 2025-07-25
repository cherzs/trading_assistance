import { parseFullSymbol, apiKey, makeApiRequest } from './helpers.js';

// CoinMarketCap doesn't have free WebSocket, so we'll use polling
let pollingIntervals = new Map();
const channelToSubscription = new Map();

// Start polling for price updates
function startPolling(channelString, subscriptionItem) {
    if (pollingIntervals.has(channelString)) {
        console.log('[TradingView Streaming] Polling already started for:', channelString);
        return;
    }

    console.log('[TradingView Streaming] Starting polling for:', channelString);

    // Poll every 10 seconds (CoinMarketCap free plan has rate limits)
    const intervalId = setInterval(async () => {
        try {
            await pollPriceUpdate(subscriptionItem);
        } catch (error) {
            console.error('[TradingView Streaming] Polling error:', error);
        }
    }, 10000);

    pollingIntervals.set(channelString, intervalId);

    // Initial poll
    setTimeout(() => pollPriceUpdate(subscriptionItem), 1000);
}

// Poll for price updates from CoinMarketCap
async function pollPriceUpdate(subscriptionItem) {
    try {
        const { parsedSymbol, lastDailyBar } = subscriptionItem;
        
        const data = await makeApiRequest('cryptocurrency/quotes/latest', {
            id: parsedSymbol.id,
            convert: parsedSymbol.toSymbol
        });

        if (!data || !data.data || !data.data[parsedSymbol.id]) {
            console.warn('[TradingView Streaming] No data received for polling');
            return;
        }

        const quote = data.data[parsedSymbol.id].quote[parsedSymbol.toSymbol];
        const currentPrice = quote.price;
        const currentTime = Date.now();

        // Create or update bar
        const bar = createOrUpdateBarFromPrice(subscriptionItem, currentPrice, currentTime);
        
        if (bar) {
            // Update the cached bar
            subscriptionItem.lastDailyBar = bar;
            
            // Send data to all subscribers
            subscriptionItem.handlers.forEach((handler) => {
                try {
                    handler.callback(bar);
                } catch (error) {
                    console.error('[TradingView Streaming] Error in callback:', error);
                }
            });
        }

    } catch (error) {
        // Log error but don't stop polling
        console.warn('[TradingView Streaming] Polling request failed:', error.message);
    }
}

// Note: CoinMarketCap polling replaces WebSocket streaming
// Real-time updates are handled through periodic API calls

// Create or update bar data based on current price
function createOrUpdateBarFromPrice(subscriptionItem, currentPrice, currentTime) {
    const { lastDailyBar, resolution } = subscriptionItem;
    
    if (!lastDailyBar) {
        // Create first bar
        const barTime = getBarTime(currentTime / 1000, resolution);
        return {
            time: barTime,
            open: currentPrice,
            high: currentPrice,
            low: currentPrice,
            close: currentPrice,
            volume: 0,
        };
    }

    const barTime = getBarTime(currentTime / 1000, resolution);
    const nextBarTime = getNextBarTime(lastDailyBar.time, resolution);

    // Check if we need to create a new bar
    if (currentTime >= nextBarTime) {
        console.log('[TradingView Streaming] Creating new bar for time:', new Date(barTime));
        return {
            time: barTime,
            open: currentPrice,
            high: currentPrice,
            low: currentPrice,
            close: currentPrice,
            volume: 0,
        };
    } else {
        // Update existing bar - only update close price for polling
        // Keep the existing open, and update high/low only if current price is outside range
        const updatedHigh = Math.max(lastDailyBar.high, currentPrice);
        const updatedLow = Math.min(lastDailyBar.low, currentPrice);
        
        // Only trigger update if price actually changed
        if (currentPrice !== lastDailyBar.close || 
            updatedHigh !== lastDailyBar.high || 
            updatedLow !== lastDailyBar.low) {
            
            console.log('[TradingView Streaming] Updating existing bar with price:', currentPrice);
            return {
                ...lastDailyBar,
                high: updatedHigh,
                low: updatedLow,
                close: currentPrice,
            };
        }
    }
    
    return null; // No update needed
}

// Get bar time based on resolution
function getBarTime(tradeTime, resolution) {
    const date = new Date(tradeTime * 1000);
    
    switch (resolution) {
        case '1':
            date.setSeconds(0, 0);
            return date.getTime();
        case '5':
            date.setMinutes(Math.floor(date.getMinutes() / 5) * 5, 0, 0);
            return date.getTime();
        case '15':
            date.setMinutes(Math.floor(date.getMinutes() / 15) * 15, 0, 0);
            return date.getTime();
        case '30':
            date.setMinutes(Math.floor(date.getMinutes() / 30) * 30, 0, 0);
            return date.getTime();
        case '60':
        case '1H':
            date.setMinutes(0, 0, 0);
            return date.getTime();
        case '1D':
        default:
            date.setHours(0, 0, 0, 0);
            return date.getTime();
    }
}

// Get next bar time based on current bar time and resolution
function getNextBarTime(barTime, resolution) {
    const date = new Date(barTime);
    
    switch (resolution) {
        case '1':
            date.setMinutes(date.getMinutes() + 1);
            break;
        case '5':
            date.setMinutes(date.getMinutes() + 5);
            break;
        case '15':
            date.setMinutes(date.getMinutes() + 15);
            break;
        case '30':
            date.setMinutes(date.getMinutes() + 30);
            break;
        case '60':
        case '1H':
            date.setHours(date.getHours() + 1);
            break;
        case '1D':
        default:
            date.setDate(date.getDate() + 1);
            break;
    }
    
    return date.getTime();
}

// Subscribe to streaming data for a symbol using polling
export function subscribeOnStream(
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscriberUID,
    onResetCacheNeededCallback,
    lastDailyBar
) {
    const parsedSymbol = parseFullSymbol(symbolInfo.full_name);
    if (!parsedSymbol || !parsedSymbol.id) {
        console.error('[TradingView Streaming] Invalid symbol format or missing ID:', symbolInfo.full_name);
        return;
    }

    const channelString = `CMC_${parsedSymbol.id}_${parsedSymbol.toSymbol}`;
    console.log('[TradingView Streaming] Subscribing to polling for:', channelString);

    const handler = {
        id: subscriberUID,
        callback: onRealtimeCallback,
    };

    let subscriptionItem = channelToSubscription.get(channelString);
    
    if (subscriptionItem) {
        // Already subscribed to the channel, use the existing subscription
        subscriptionItem.handlers.push(handler);
        console.log('[TradingView Streaming] Added handler to existing subscription');
        return;
    }

    // Create new subscription
    subscriptionItem = {
        subscriberUID,
        resolution,
        lastDailyBar,
        handlers: [handler],
        parsedSymbol,
    };
    
    channelToSubscription.set(channelString, subscriptionItem);

    // Start polling for this symbol
    startPolling(channelString, subscriptionItem);
}

// Unsubscribe from streaming data
export function unsubscribeFromStream(subscriberUID) {
    console.log('[TradingView Streaming] Unsubscribing:', subscriberUID);

    // Find and remove the subscription
    for (const [channelString, subscriptionItem] of channelToSubscription.entries()) {
        const handlerIndex = subscriptionItem.handlers.findIndex(
            (handler) => handler.id === subscriberUID
        );

        if (handlerIndex !== -1) {
            // Remove the handler
            subscriptionItem.handlers.splice(handlerIndex, 1);
            console.log('[TradingView Streaming] Handler removed for channel:', channelString);

            // If no more handlers, stop polling for this channel
            if (subscriptionItem.handlers.length === 0) {
                console.log('[TradingView Streaming] Stopping polling for channel:', channelString);
                
                // Clear the polling interval
                const intervalId = pollingIntervals.get(channelString);
                if (intervalId) {
                    clearInterval(intervalId);
                    pollingIntervals.delete(channelString);
                }
                
                channelToSubscription.delete(channelString);
            }
            break;
        }
    }
}

// Get connection status
export function getStreamingStatus() {
    return {
        connected: true, // Always connected for polling
        subscriptions: channelToSubscription.size,
        channels: Array.from(channelToSubscription.keys()),
        pollingIntervals: pollingIntervals.size,
        method: 'CoinMarketCap API Polling'
    };
} 