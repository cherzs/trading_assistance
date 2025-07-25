import { sendMessage, resetChatHistory } from '../services/gemini.js';

export class ChatBot {
    constructor(containerId = 'chatContainer', options = {}) {
        this.messages = [];
        this.isLoading = false;
        this.sessionId = Date.now().toString();
        this.options = {
            title: options.title || 'AI Trading Assistant',
            subtitle: options.subtitle || 'Get instant trading insights and tips powered by AI.',
            placeholder: options.placeholder || 'e.g. "Show ETH prediction"',
            containerClass: options.containerClass || ''
        };
        
        console.log(`Initializing ChatBot with container: ${containerId}`);
        
        // Get the existing container
        this.chatContainer = document.getElementById(containerId);
        if (this.chatContainer) {
            console.log('Chat container found, initializing UI...');
            this.chatContainer.className = `chat-container ${this.options.containerClass}`;
            this.initializeChatUI();
            
            // Event listeners
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            this.input.addEventListener('input', (e) => this.handleInput(e));
            this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
            
            // Add initial message
            this.addMessage("Hello! I'm your AI Trading Assistant. What do you want to know about trading today?", 'ai');
            console.log('ChatBot initialized successfully');
        } else {
            console.error(`Container with id ${containerId} not found`);
        }
    }

    initializeChatUI() {
        // Clear any existing content
        this.chatContainer.innerHTML = '';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'chat-header';
        header.innerHTML = `
            <h1 class="chat-title">${this.options.title}</h1>
            <div class="chat-subtitle">${this.options.subtitle}</div>
        `;
        
        // Create messages container
        this.messagesContainer = document.createElement('div');
        this.messagesContainer.className = 'messages';
        
        // Create form
        this.form = document.createElement('form');
        this.form.className = 'chat-form';
        
        this.input = document.createElement('input');
        this.input.placeholder = this.options.placeholder;
        this.input.className = 'chat-input';
        this.input.type = 'text';
        this.input.autocomplete = 'off';
        
        this.submitButton = document.createElement('button');
        this.submitButton.type = 'submit';
        this.submitButton.textContent = 'Send';
        this.submitButton.className = 'chat-submit';
        
        this.form.appendChild(this.input);
        this.form.appendChild(this.submitButton);
        
        // Assemble chat container
        this.chatContainer.appendChild(header);
        this.chatContainer.appendChild(this.messagesContainer);
        this.chatContainer.appendChild(this.form);
        
        console.log('Chat UI elements created and assembled');
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    formatMessage(text) {
        // Enhanced text formatting for better readability
        let formattedText = text;
        
        // Convert **text** to bold
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert *text* to italic
        formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert • to proper bullet points
        formattedText = formattedText.replace(/•/g, '•');
        
        // Handle numbered lists (1. 2. 3.)
        formattedText = formattedText.replace(/(\d+\.\s)/g, '<br><strong>$1</strong>');
        
        // Handle bullet points that start lines
        formattedText = formattedText.replace(/\n•\s/g, '<br>• ');
        formattedText = formattedText.replace(/^•\s/g, '• ');
        
        // Convert \n\n to proper paragraph breaks
        formattedText = formattedText.replace(/\n\n/g, '</p><p>');
        
        // Convert single \n to line breaks
        formattedText = formattedText.replace(/\n/g, '<br>');
        
        // Wrap in paragraph tags if not already
        if (!formattedText.includes('<p>')) {
            formattedText = `<p>${formattedText}</p>`;
        }
        
        // Fix empty paragraphs
        formattedText = formattedText.replace(/<p><\/p>/g, '');
        formattedText = formattedText.replace(/<p><br>/g, '<p>');
        
        // Handle price formatting ($123,456.78)
        formattedText = formattedText.replace(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, '<code>$$$1</code>');
        
        // Handle percentage formatting (±12.34%)
        formattedText = formattedText.replace(/([\+\-]?\d+\.?\d*%)/g, '<strong>$1</strong>');
        
        return formattedText;
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        if (sender === 'ai') {
            // Format AI messages with better structure
            messageDiv.innerHTML = this.formatMessage(text);
        } else {
            // User messages remain as plain text
            messageDiv.textContent = text;
        }
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        console.log(`Message added: ${sender} - ${text.substring(0, 50)}...`);
    }

    setLoading(loading) {
        this.isLoading = loading;
        this.input.disabled = loading;
        this.submitButton.disabled = loading;
        this.submitButton.textContent = loading ? 'Sending...' : 'Send';
        
        if (loading) {
            if (!this.loadingDiv) {
                const loadingDiv = document.createElement('div');
                loadingDiv.className = 'message ai';
                loadingDiv.innerHTML = '<div class="typing-indicator">AI is thinking... <span class="chat-loading-spinner"></span></div>';
                this.messagesContainer.appendChild(loadingDiv);
                this.loadingDiv = loadingDiv;
                this.scrollToBottom();
            }
        } else if (this.loadingDiv) {
            this.loadingDiv.remove();
            this.loadingDiv = null;
        }
    }

    handleInput(e) {
        this.input.value = e.target.value;
    }

    handleKeyDown(e) {
        // Allow Enter to submit, but Shift+Enter for new line
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleSubmit(e);
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const userMessage = this.input.value.trim();
        if (!userMessage || this.isLoading) return;
        
        console.log(`Sending message: ${userMessage}`);
        this.input.value = '';
        this.setLoading(true);
        this.addMessage(userMessage, 'user');
        
        try {
            const data = await sendMessage(userMessage, this.sessionId);
            this.addMessage(data.response, 'ai');
        } catch (error) {
            console.error('Chat error:', error);
            this.addMessage('Sorry, there was an error in communication with AI. Please try again.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async fetchBitcoinData() {
        try {
            const response = await fetch('/api/bitcoin-data');
            const data = await response.json();
            this.updateBitcoinDisplay(data);
        } catch (error) {
            console.error('Error fetching Bitcoin data:', error);
        }
    }

    updateBitcoinDisplay(data) {
        if (this.bitcoinDataDiv && data) {
            this.bitcoinDataDiv.innerHTML = `
                <div class="grid grid-cols-4 gap-4 text-sm">
                    <div>Price: $${data.price || 'N/A'}</div>
                    <div>24h High: $${data.high_24h || 'N/A'}</div>
                    <div>24h Low: $${data.low_24h || 'N/A'}</div>
                    <div>Volume: ${data.volume || 'N/A'} BTC</div>
                </div>
            `;
        }
    }

    resetChat() {
        // Clear chat UI
        this.messagesContainer.innerHTML = '';
        // Reset chat history in service
        resetChatHistory();
        // Add welcome message
        this.addMessage("Hello! I'm your AI Trading Assistant. What do you want to know about trading today?", 'ai');
        console.log('Chat reset completed');
    }
} 