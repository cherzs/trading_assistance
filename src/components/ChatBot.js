import { sendMessage, resetChatHistory } from '../services/gemini.js';

export class ChatBot {
    constructor(containerId = 'chatContainer', options = {}) {
        this.messages = [];
        this.isLoading = false;
        this.sessionId = Date.now().toString();
        this.options = {
            title: options.title || 'AI Trading Assistant 🚀',
            subtitle: options.subtitle || 'Get instant trading insights and tips powered by AI.',
            placeholder: options.placeholder || 'e.g. "Show ETH prediction"',
            containerClass: options.containerClass || ''
        };
        
        // Initialize DOM elements
        this.chatContainer = document.createElement('div');
        this.chatContainer.className = `chat-container ${this.options.containerClass}`;
        this.initializeChatUI();
        
        // Event listeners
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.input.addEventListener('input', (e) => this.handleInput(e));

        // Add to specified container
        const container = document.getElementById(containerId);
        if (container) {
            container.appendChild(this.chatContainer);
        }

        // Add initial message
        this.addMessage("Hello! I'm your AI Trading Assistant. What do you want to know about trading today?", 'ai');
    }

    initializeChatUI() {
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
        
        // Create quick suggestions
        this.quickSuggestions = document.createElement('div');
        this.quickSuggestions.className = 'quick-suggestions';
        this.renderQuickSuggestions();
        
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
        this.chatContainer.appendChild(this.quickSuggestions);
        this.chatContainer.appendChild(this.form);
    }

    renderQuickSuggestions() {
        this.quickSuggestions.innerHTML = '';
        const suggestions = [
            { icon: '📈', text: 'Show BTC analysis', value: 'Show BTC analysis', color: 'primary' },
            { icon: '💡', text: 'How to set Stop Loss?', value: 'How to set Stop Loss?', color: 'info' },
            { icon: '📰', text: 'Latest News', value: 'Latest News', color: 'warning' }
        ];
        suggestions.forEach(s => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `quick-suggestion quick-suggestion-${s.color}`;
            btn.innerHTML = `<span>${s.icon}</span> <span>${s.text}</span>`;
            btn.onclick = () => this.handleQuickSuggestion(s.value);
            this.quickSuggestions.appendChild(btn);
        });
    }

    handleQuickSuggestion(value) {
        if (this.isLoading) return;
        this.input.value = value;
        this.form.requestSubmit();
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
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
                loadingDiv.innerHTML = '<div class="typing-indicator">Typing... <span class="chat-loading-spinner"></span></div>';
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

    async handleSubmit(e) {
        e.preventDefault();
        const userMessage = this.input.value.trim();
        if (!userMessage || this.isLoading) return;
        this.input.value = '';
        this.setLoading(true);
        this.addMessage(userMessage, 'user');
        try {
            const data = await sendMessage(userMessage, this.sessionId);
            this.addMessage(data.response, 'ai');
        } catch (error) {
            this.addMessage('Sorry, there was an error in communication with AI.', 'error');
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
        // Reset chat history di service
        resetChatHistory();
        // Tambahkan pesan selamat datang baru
        this.addMessage("Hello! I'm your AI Trading Assistant. What do you want to know about trading today?", 'bot');
    }
} 