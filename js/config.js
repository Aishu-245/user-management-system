// Configuration settings for the User Management System
const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: 'https://jsonplaceholder.typicode.com',
        ENDPOINTS: {
            USERS: '/users',
            USER_BY_ID: '/users/{id}'
        },
        TIMEOUT: 10000, // 10 seconds
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000 // 1 second
    },

    // Pagination Configuration
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 10,
        PAGE_SIZES: [10, 25, 50, 100],
        MAX_VISIBLE_PAGES: 5
    },

    // UI Configuration
    UI: {
        DEBOUNCE_DELAY: 300, // milliseconds for search input
        ANIMATION_DURATION: 300,
        SUCCESS_MESSAGE_DURATION: 3000, // 3 seconds
        MODAL_TRANSITION_DURATION: 300
    },

    // Validation Configuration
    VALIDATION: {
        MIN_NAME_LENGTH: 2,
        MAX_NAME_LENGTH: 50,
        MAX_EMAIL_LENGTH: 100,
        MAX_PHONE_LENGTH: 20,
        MAX_WEBSITE_LENGTH: 200,
        MAX_DEPARTMENT_LENGTH: 50,
        EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE_PATTERN: /^[\+]?[1-9][\d]{0,15}$/,
        URL_PATTERN: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
    },

    // Error Messages
    MESSAGES: {
        ERRORS: {
            NETWORK_ERROR: 'Network error occurred. Please check your internet connection.',
            SERVER_ERROR: 'Server error occurred. Please try again later.',
            TIMEOUT_ERROR: 'Request timed out. Please try again.',
            UNKNOWN_ERROR: 'An unknown error occurred. Please try again.',
            USER_NOT_FOUND: 'User not found.',
            VALIDATION_ERROR: 'Please fix the validation errors and try again.',
            DELETE_ERROR: 'Failed to delete user. Please try again.',
            CREATE_ERROR: 'Failed to create user. Please try again.',
            UPDATE_ERROR: 'Failed to update user. Please try again.'
        },
        SUCCESS: {
            USER_CREATED: 'User created successfully!',
            USER_UPDATED: 'User updated successfully!',
            USER_DELETED: 'User deleted successfully!',
            FILTERS_APPLIED: 'Filters applied successfully!',
            FILTERS_CLEARED: 'Filters cleared successfully!'
        },
        VALIDATION: {
            REQUIRED_FIELD: 'This field is required.',
            INVALID_EMAIL: 'Please enter a valid email address.',
            INVALID_PHONE: 'Please enter a valid phone number.',
            INVALID_URL: 'Please enter a valid website URL.',
            MIN_LENGTH: 'Must be at least {min} characters long.',
            MAX_LENGTH: 'Must be no more than {max} characters long.',
            DUPLICATE_USERNAME: 'Username already exists.',
            DUPLICATE_EMAIL: 'Email already exists.'
        }
    },

    // Feature Flags
    FEATURES: {
        ENABLE_SEARCH: true,
        ENABLE_FILTERING: true,
        ENABLE_SORTING: true,
        ENABLE_PAGINATION: true,
        ENABLE_VALIDATION: true,
        ENABLE_RESPONSIVE_CARDS: true,
        ENABLE_ANIMATIONS: true,
        ENABLE_RETRY_MECHANISM: true
    },

    // Data Processing
    DATA: {
        SORT_ORDERS: {
            ASC: 'asc',
            DESC: 'desc'
        },
        DEFAULT_SORT: {
            FIELD: 'id',
            ORDER: 'asc'
        }
    }
};

// Utility function to get nested configuration values
CONFIG.get = function(path, defaultValue = null) {
    return path.split('.').reduce((obj, key) => {
        return obj && obj[key] !== undefined ? obj[key] : defaultValue;
    }, this);
};

// Utility function to format error messages with placeholders
CONFIG.formatMessage = function(messageKey, replacements = {}) {
    let message = this.get(messageKey, messageKey);
    
    Object.keys(replacements).forEach(key => {
        message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), replacements[key]);
    });
    
    return message;
};

// Make CONFIG globally available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}