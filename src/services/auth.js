class AuthService {
    constructor() {
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        console.log('🔐 Initializing AuthService...');
        // Check for token and user data in localStorage or URL params
        this.loadFromStorage();
        this.checkUrlParams();
        console.log('🔐 AuthService initialized. Authenticated:', this.isAuthenticated);
    }

    loadFromStorage() {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
            try {
                this.token = token;
                this.user = JSON.parse(userData);
                this.isAuthenticated = true;
                this.setAuthHeader();
                console.log('🔐 Loaded auth from storage:', this.user?.name);
            } catch (error) {
                console.error('Error loading auth data:', error);
                this.clearAuth();
            }
        }
    }

    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userParam = urlParams.get('user');
        
        if (token && userParam) {
            try {
                const userData = JSON.parse(decodeURIComponent(userParam));
                this.setAuth(token, userData);
                console.log('🔐 Auth set from URL params:', userData.name);
                
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
                console.error('Error parsing URL auth data:', error);
            }
        }
    }

    setAuth(token, user) {
        this.token = token;
        this.user = user;
        this.isAuthenticated = true;
        
        // Store in localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
        
        this.setAuthHeader();
        this.onAuthChange();
        console.log('🔐 Authentication set for:', user.name);
    }

    setAuthHeader() {
        // Set authorization header for all future requests
        if (this.token) {
            // This can be used with fetch requests
            window.authToken = this.token;
        }
    }

    async login() {
        try {
            console.log('🔐 Redirecting to Google OAuth...');
            // Use the proxy route that forwards to backend
            const authUrl = '/auth/google';
            console.log('🔐 Auth URL:', authUrl);
            window.location.href = authUrl;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async logout() {
        try {
            console.log('🔐 Logging out...');
            // Call logout endpoint through proxy
            await fetch('/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            this.clearAuth();
        }
    }

    clearAuth() {
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        
        // Clear localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        
        // Clear auth header
        delete window.authToken;
        
        this.onAuthChange();
        console.log('🔐 Authentication cleared');
    }

    async fetchUserProfile() {
        if (!this.isAuthenticated) return null;
        
        try {
            const response = await fetch('/auth/me', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.user = data.user;
                localStorage.setItem('user_data', JSON.stringify(this.user));
                this.onAuthChange();
                return this.user;
            } else {
                // Token might be expired
                console.warn('🔐 Token validation failed, clearing auth');
                this.clearAuth();
                return null;
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }

    async getChatHistory() {
        if (!this.isAuthenticated) return [];
        
        try {
            const response = await fetch('/api/chat/history', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.sessions || [];
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
        
        return [];
    }

    onAuthChange() {
        // Dispatch custom event for components to listen to
        window.dispatchEvent(new CustomEvent('authStateChange', {
            detail: {
                isAuthenticated: this.isAuthenticated,
                user: this.user
            }
        }));
        console.log('🔐 Auth state changed. Authenticated:', this.isAuthenticated);
    }

    // Helper method to make authenticated requests
    async authenticatedFetch(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (this.isAuthenticated) {
            headers.Authorization = `Bearer ${this.token}`;
        }
        
        return fetch(url, {
            ...options,
            headers
        });
    }
}

// Create singleton instance
const authService = new AuthService();

export default authService; 