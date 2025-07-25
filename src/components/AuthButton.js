import authService from '../services/auth.js';

export class AuthButton {
    constructor(containerId = 'authButton') {
        this.container = document.getElementById(containerId);
        this.isAuthenticated = false;
        this.user = null;
        
        if (this.container) {
            // Expose instance globally immediately
            window.authButtonInstance = this;
            this.init();
            this.setupEventListeners();
        } else {
            console.error(`Auth container with id ${containerId} not found`);
        }
    }

    init() {
        this.isAuthenticated = authService.isAuthenticated;
        this.user = authService.user;
        this.render();
    }

    setupEventListeners() {
        // Listen for auth state changes
        window.addEventListener('authStateChange', (event) => {
            this.isAuthenticated = event.detail.isAuthenticated;
            this.user = event.detail.user;
            this.render();
        });
    }

    render() {
        if (this.isAuthenticated && this.user) {
            this.renderUserProfile();
        } else {
            this.renderLoginButton();
        }
    }

    renderLoginButton() {
        this.container.innerHTML = `
            <button class="auth-login-btn" onclick="window.authButtonInstance.handleLogin()">
                <i class="fas fa-sign-in-alt"></i>
                Login with Google
            </button>
        `;
        
        // Ensure instance is available globally
        window.authButtonInstance = this;
    }

    renderUserProfile() {
        this.container.innerHTML = `
            <div class="user-profile">
                <div class="user-avatar" onclick="window.authButtonInstance.toggleDropdown()">
                    <img src="${this.user.picture || '/default-avatar.png'}" alt="${this.user.name}" />
                    <span class="user-name">${this.user.name || this.user.email}</span>
                    <i class="fas fa-chevron-down dropdown-arrow"></i>
                </div>
                <div class="user-dropdown" id="userDropdown" style="display: none;">
                    <div class="dropdown-header">
                        <img src="${this.user.picture || '/default-avatar.png'}" alt="${this.user.name}" />
                        <div class="user-info">
                            <div class="user-name">${this.user.name || 'User'}</div>
                            <div class="user-email">${this.user.email}</div>
                        </div>
                    </div>
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item" onclick="window.authButtonInstance.viewProfile()">
                        <i class="fas fa-user"></i>
                        Profile
                    </button>
                    <button class="dropdown-item" onclick="window.authButtonInstance.viewChatHistory()">
                        <i class="fas fa-history"></i>
                        Chat History
                    </button>
                    <button class="dropdown-item" onclick="window.authButtonInstance.viewSettings()">
                        <i class="fas fa-cog"></i>
                        Settings
                    </button>
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item logout" onclick="window.authButtonInstance.handleLogout()">
                        <i class="fas fa-sign-out-alt"></i>
                        Logout
                    </button>
                </div>
            </div>
        `;

        // Ensure instance is available globally
        window.authButtonInstance = this;

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('userDropdown');
            const userProfile = this.container.querySelector('.user-profile');
            
            if (dropdown && userProfile && !userProfile.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }

    toggleDropdown() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        }
    }

    async handleLogin() {
        try {
            console.log('🔐 Initiating login...');
            await authService.login();
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed. Please try again.');
        }
    }

    async handleLogout() {
        try {
            console.log('🔐 Initiating logout...');
            await authService.logout();
            // Close dropdown
            const dropdown = document.getElementById('userDropdown');
            if (dropdown) {
                dropdown.style.display = 'none';
            }
        } catch (error) {
            console.error('Logout failed:', error);
            alert('Logout failed. Please try again.');
        }
    }

    viewProfile() {
        console.log('View profile clicked');
        // You can implement a profile modal here
        alert('Profile feature coming soon!');
    }

    async viewChatHistory() {
        try {
            const history = await authService.getChatHistory();
            console.log('Chat history:', history);
            // You can implement a chat history modal here
            alert(`You have ${history.length} chat sessions. Feature coming soon!`);
        } catch (error) {
            console.error('Failed to load chat history:', error);
            alert('Failed to load chat history.');
        }
    }

    viewSettings() {
        console.log('View settings clicked');
        // You can implement a settings modal here
        alert('Settings feature coming soon!');
    }
} 