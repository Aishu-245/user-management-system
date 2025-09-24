// API service for handling HTTP requests to JSONPlaceholder
class ApiService {
    constructor() {
        this.baseUrl = CONFIG.API.BASE_URL;
        this.timeout = CONFIG.API.TIMEOUT;
        this.retryAttempts = CONFIG.API.RETRY_ATTEMPTS;
        this.retryDelay = CONFIG.API.RETRY_DELAY;
    }

    // Generic HTTP request method with retry logic
    async request(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const requestOptions = {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        let lastError;
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                clearTimeout(timeoutId);
                
                const response = await fetch(url, requestOptions);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                lastError = error;
                
                // Don't retry on certain errors
                if (error.name === 'AbortError') {
                    throw new Error(CONFIG.MESSAGES.ERRORS.TIMEOUT_ERROR);
                }
                
                if (attempt === this.retryAttempts) {
                    break;
                }
                
                // Wait before retrying
                await this.delay(this.retryDelay * attempt);
            }
        }

        // Handle specific error types
        if (lastError.message.includes('Failed to fetch') || lastError.message.includes('NetworkError')) {
            throw new Error(CONFIG.MESSAGES.ERRORS.NETWORK_ERROR);
        } else if (lastError.message.includes('5')) {
            throw new Error(CONFIG.MESSAGES.ERRORS.SERVER_ERROR);
        } else {
            throw new Error(CONFIG.MESSAGES.ERRORS.UNKNOWN_ERROR);
        }
    }

    // Utility method for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // GET request
    async get(endpoint) {
        const url = `${this.baseUrl}${endpoint}`;
        return await this.request(url, { method: 'GET' });
    }

    // POST request
    async post(endpoint, data) {
        const url = `${this.baseUrl}${endpoint}`;
        return await this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data) {
        const url = `${this.baseUrl}${endpoint}`;
        return await this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
        const url = `${this.baseUrl}${endpoint}`;
        return await this.request(url, { method: 'DELETE' });
    }

    // Get all users
    async getUsers() {
        try {
            return await this.get(CONFIG.API.ENDPOINTS.USERS);
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    // Get user by ID
    async getUserById(id) {
        try {
            const endpoint = CONFIG.API.ENDPOINTS.USER_BY_ID.replace('{id}', id);
            return await this.get(endpoint);
        } catch (error) {
            console.error(`Error fetching user ${id}:`, error);
            throw error;
        }
    }

    // Create new user
    async createUser(userData) {
        try {
            // JSONPlaceholder will simulate creating a user with ID 11
            const response = await this.post(CONFIG.API.ENDPOINTS.USERS, userData);
            
            // Since JSONPlaceholder doesn't actually create the user,
            // we'll return a simulated response with a new ID
            return {
                ...userData,
                id: response.id || Date.now() // Use timestamp as fallback ID
            };
        } catch (error) {
            console.error('Error creating user:', error);
            throw new Error(CONFIG.MESSAGES.ERRORS.CREATE_ERROR);
        }
    }

    // Update existing user
    async updateUser(id, userData) {
        try {
            const endpoint = CONFIG.API.ENDPOINTS.USER_BY_ID.replace('{id}', id);
            const response = await this.put(endpoint, userData);
            
            // Return the updated user data
            return {
                ...userData,
                id: parseInt(id)
            };
        } catch (error) {
            console.error(`Error updating user ${id}:`, error);
            throw new Error(CONFIG.MESSAGES.ERRORS.UPDATE_ERROR);
        }
    }

    // Delete user
    async deleteUser(id) {
        try {
            const endpoint = CONFIG.API.ENDPOINTS.USER_BY_ID.replace('{id}', id);
            await this.delete(endpoint);
            return { success: true, id: parseInt(id) };
        } catch (error) {
            console.error(`Error deleting user ${id}:`, error);
            throw new Error(CONFIG.MESSAGES.ERRORS.DELETE_ERROR);
        }
    }
}

// Create a singleton instance
const apiService = new ApiService();

// Make it globally available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
} else {
    window.apiService = apiService;
}