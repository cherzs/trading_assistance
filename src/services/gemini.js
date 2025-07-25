export async function sendMessage(message, sessionId) {
    try {
        const response = await fetch('/api/gemini-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                sessionId: sessionId
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.response) {
            throw new Error('Invalid response format from server');
        }

        return data;
    } catch (error) {
        console.error('Error sending message:', error);
        
        // Provide fallback response when server is unavailable
        if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
            return {
                response: "I'm sorry, but I'm currently unable to connect to the AI service. This might be because the server is not running or there's a network issue. Please make sure the backend server is started and try again.",
                sessionId: sessionId,
                isOffline: true
            };
        }
        
        throw error;
    }
}

export function resetChatHistory() {
    // This could be extended to call the server's reset endpoint
    try {
        fetch('/api/reset-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId: 'default' })
        }).catch(err => {
            console.log('Could not reset chat on server (offline mode)');
        });
    } catch (error) {
        console.log('Reset chat history called (offline mode)');
    }
    
    return true;
} 