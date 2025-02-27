export async function sendMessage(message, sessionId) {
    try {
        const response = await fetch('http://localhost:5000/gemini-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                session_id: sessionId
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Network response was not ok');
        }

        const data = await response.json();
        if (!data.response) {
            throw new Error('Invalid response format from server');
        }

        return data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

export function resetChatHistory() {
    // Bisa diimplementasikan jika diperlukan untuk reset chat history
    return true;
} 