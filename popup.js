document.addEventListener('DOMContentLoaded', function () {
    const statusMessage = document.getElementById('statusMessage');
    const mainContent = document.getElementById('mainContent');
    const errorElement = document.getElementById('error');
    const logoutButton = document.getElementById('logoutButton');
    
    // Login form elements
    const paidUsernameInput = document.getElementById('paidUsername');
    const paidPasswordInput = document.getElementById('paidPassword');
    const paidLoginButton = document.getElementById('paidLoginButton');

    const API_BASE_URL = 'https://neoai.projectkit.shop';
    const SESSION_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

    // Tab Functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Function to refresh all tabs
    function refreshAllTabs() {
        chrome.tabs.query({}, function(tabs) {
            for (let tab of tabs) {
                chrome.tabs.reload(tab.id);
            }
        });
    }

    // Helper Functions
    function showError(message, duration = 5000) {
        errorElement.innerText = message;
        errorElement.classList.remove('hidden');
        setTimeout(() => {
            errorElement.innerText = '';
            errorElement.classList.add('hidden');
        }, duration);
    }

    function showLoggedInState(username) {
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('accountSection').classList.remove('hidden');
        document.getElementById('accountUsername').textContent = username;
    }

    // Verify token is still valid with /api/auth/me
    async function verifySession() {
        try {
            const { accessToken } = await chrome.storage.local.get(['accessToken']);
            
            if (!accessToken) {
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('Token invalid or expired, logging out...');
                    logoutUser();
                    showError('Your session has expired. Please login again.', 5000);
                }
                return;
            }
            
            const data = await response.json();
            if (data.username) {
                document.getElementById('accountUsername').textContent = data.username;
            }
        } catch (error) {
            console.error('Error verifying session:', error);
        }
    }

    function showLoggedOutState() {
        document.getElementById('loginSection').classList.remove('hidden');
        document.getElementById('accountSection').classList.add('hidden');
    }

    function checkSessionExpiration() {
        chrome.storage.local.get(['loginTimestamp'], function(data) {
            if (data.loginTimestamp) {
                const currentTime = Date.now();
                if (currentTime - data.loginTimestamp > SESSION_DURATION) {
                    logoutUser();
                    showError('Your session has expired. Please log in again.', 5000);
                }
            }
        });
    }

    function logoutUser() {
        const authKeys = ['loggedIn', 'username', 'accessToken', 'loginTimestamp'];
        chrome.storage.local.remove(authKeys);
        showLoggedOutState();
        refreshAllTabs();
    }

    // Add storage change listener
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local') {
            if ((changes.accessToken && changes.accessToken.newValue === undefined) ||
                (changes.loggedIn && changes.loggedIn.newValue === false)) {
                showLoggedOutState();
                showError('You have been logged out', 3000);
                
                chrome.storage.local.remove(['accessToken', 'loggedIn', 'username']);
            }
        }
    });

    // Check login status and session expiration on popup open
    chrome.storage.local.get(['loggedIn', 'username', 'loginTimestamp'], function (data) {
        if (data.loggedIn && data.username) {
            const currentTime = Date.now();
            if (data.loginTimestamp && currentTime - data.loginTimestamp > SESSION_DURATION) {
                logoutUser();
                showError('Your session has expired. Please log in again.', 5000);
            } else {
                showLoggedInState(data.username);
                verifySession(); // Verify token is still valid
            }
        } else {
            showLoggedOutState();
        }
    });

    // Run a session check when popup opens
    checkSessionExpiration();

    // Username field: press Enter to move to password field
    if (paidUsernameInput && paidPasswordInput) {
        paidUsernameInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                paidPasswordInput.focus();
            }
        });
    }
    
    // Password field: press Enter to submit login
    if (paidPasswordInput && paidLoginButton) {
        paidPasswordInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                paidLoginButton.click();
            }
        });
    }

    // Prevent multiple rapid login attempts
    let lastLoginAttempt = 0;
    const LOGIN_COOLDOWN = 2000;

    // Login button handler
    if (paidLoginButton) {
        paidLoginButton.addEventListener('click', async function () {
            const now = Date.now();
            if (now - lastLoginAttempt < LOGIN_COOLDOWN) {
                showError('Please wait a moment before trying again');
                return;
            }
            lastLoginAttempt = now;

            const username = document.getElementById('paidUsername').value.trim();
            const password = document.getElementById('paidPassword').value;
        
            if (!username || !password) {
                showError('Please enter both username and password');
                return;
            }
        
            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username,
                        password
                    })
                });
        
                const data = await response.json();
        
                if (data.success && data.token) {
                    const loginTimestamp = Date.now();

                    await chrome.storage.local.set({
                        loggedIn: true,
                        username: data.user.username,
                        accessToken: data.token,
                        loginTimestamp: loginTimestamp
                    });
        
                    showLoggedInState(data.user.username);
                    
                    document.getElementById('paidUsername').value = '';
                    document.getElementById('paidPassword').value = '';
                    
                    showError('Logged in successfully!', 2000);
                } else {
                    showError(data.message || 'Login failed');
                }
        
            } catch (error) {
                console.error('Login error:', error);
                showError('An error occurred during login. Please try again.');
            }
        });
    }
    
    // Logout button handler
    logoutButton.addEventListener('click', async function () {
        try {
            logoutUser();
            showError('Logged out successfully', 3000);
        } catch (error) {
            console.error('Logout error:', error);
            showError('An error occurred during logout. Please try again.');
        }
    });
    
    // Error handling for network issues
    window.addEventListener('offline', () => {
        showError('No internet connection. Please check your network.');
    });

    // Add input validation for username
    if (paidUsernameInput) {
        paidUsernameInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^a-zA-Z0-9_-]/g, '');
        });
    }

    // Handle extension install/update
    chrome.runtime.onInstalled.addListener(function(details) {
        if (details.reason === 'install') {
            chrome.storage.local.clear();
            showLoggedOutState();
        }
    });
});
