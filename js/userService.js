// User service for managing user data and operations
class UserService {
    constructor() {
        this.users = [];
        this.originalUsers = [];
        this.filteredUsers = [];
        this.currentSort = {
            field: CONFIG.DATA.DEFAULT_SORT.FIELD,
            order: CONFIG.DATA.DEFAULT_SORT.ORDER
        };
        this.currentFilters = {};
        this.searchQuery = '';
    }

    // Load all users from API
    async loadUsers() {
        try {
            uiService.showLoading();
            uiService.hideError();

            const users = await apiService.getUsers();
            this.users = users;
            this.originalUsers = [...users];
            this.applyFiltersAndSearch();
            
            uiService.hideLoading();
            return users;
        } catch (error) {
            console.error('Error loading users:', error);
            uiService.showError(error.message);
            throw error;
        }
    }

    // Get user by ID
    getUserById(id) {
        return this.users.find(user => user.id === parseInt(id));
    }

    // Create new user
    async createUser(userData) {
        try {
            // Convert form data to API format
            const apiUserData = this.formatUserDataForAPI(userData);
            
            // Call API to create user
            const newUser = await apiService.createUser(apiUserData);
            
            // Add to local users array
            this.users.push(newUser);
            this.originalUsers.push(newUser);
            
            // Reapply filters and search
            this.applyFiltersAndSearch();
            
            uiService.showSuccess(CONFIG.MESSAGES.SUCCESS.USER_CREATED);
            return newUser;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    // Update existing user
    async updateUser(id, userData) {
        try {
            // Convert form data to API format
            const apiUserData = this.formatUserDataForAPI(userData);
            
            // Call API to update user
            const updatedUser = await apiService.updateUser(id, apiUserData);
            
            // Update in local users array
            const userIndex = this.users.findIndex(user => user.id === parseInt(id));
            if (userIndex !== -1) {
                this.users[userIndex] = updatedUser;
            }
            
            const originalIndex = this.originalUsers.findIndex(user => user.id === parseInt(id));
            if (originalIndex !== -1) {
                this.originalUsers[originalIndex] = updatedUser;
            }
            
            // Reapply filters and search
            this.applyFiltersAndSearch();
            
            uiService.showSuccess(CONFIG.MESSAGES.SUCCESS.USER_UPDATED);
            return updatedUser;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    // Delete user
    async deleteUser(id) {
        try {
            // Call API to delete user
            await apiService.deleteUser(id);
            
            // Remove from local users arrays
            this.users = this.users.filter(user => user.id !== parseInt(id));
            this.originalUsers = this.originalUsers.filter(user => user.id !== parseInt(id));
            
            // Reapply filters and search
            this.applyFiltersAndSearch();
            
            uiService.showSuccess(CONFIG.MESSAGES.SUCCESS.USER_DELETED);
            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    // Format form data for API
    formatUserDataForAPI(formData) {
        return {
            name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
            username: formData.username.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            website: formData.website.trim(),
            company: {
                name: formData.department.trim() || 'Not specified'
            },
            address: {
                street: '',
                suite: '',
                city: '',
                zipcode: '',
                geo: {
                    lat: '0',
                    lng: '0'
                }
            }
        };
    }

    // Extract form data from user object
    extractFormDataFromUser(user) {
        const nameParts = user.name.split(' ');
        return {
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            username: user.username || '',
            email: user.email || '',
            phone: user.phone || '',
            website: user.website || '',
            department: user.company?.name || ''
        };
    }

    // Apply search functionality
    applySearch(query) {
        this.searchQuery = query.toLowerCase().trim();
        this.applyFiltersAndSearch();
    }

    // Apply filters
    applyFilters(filters) {
        this.currentFilters = { ...filters };
        this.applyFiltersAndSearch();
    }

    // Clear all filters
    clearFilters() {
        this.currentFilters = {};
        this.searchQuery = '';
        this.applyFiltersAndSearch();
        uiService.showSuccess(CONFIG.MESSAGES.SUCCESS.FILTERS_CLEARED);
    }

    // Apply both filters and search
    applyFiltersAndSearch() {
        let filtered = [...this.users];

        // Apply search
        if (this.searchQuery) {
            filtered = filtered.filter(user => {
                const searchFields = [
                    user.name,
                    user.username,
                    user.email,
                    user.company?.name || ''
                ].map(field => field.toLowerCase());

                return searchFields.some(field => field.includes(this.searchQuery));
            });
        }

        // Apply filters
        if (Object.keys(this.currentFilters).length > 0) {
            filtered = filtered.filter(user => {
                const nameParts = user.name.split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';
                const department = user.company?.name || '';

                return Object.entries(this.currentFilters).every(([key, value]) => {
                    if (!value.trim()) return true; // Skip empty filters

                    const filterValue = value.toLowerCase().trim();
                    
                    switch (key) {
                        case 'firstName':
                            return firstName.toLowerCase().includes(filterValue);
                        case 'lastName':
                            return lastName.toLowerCase().includes(filterValue);
                        case 'email':
                            return user.email.toLowerCase().includes(filterValue);
                        case 'department':
                            return department.toLowerCase().includes(filterValue);
                        default:
                            return true;
                    }
                });
            });
        }

        // Apply sorting
        filtered = this.sortUsers(filtered);

        this.filteredUsers = filtered;
        
        // Notify pagination service
        if (window.paginationService) {
            paginationService.updateData(filtered);
        }

        return filtered;
    }

    // Sort users
    sortUsers(users, field = null, order = null) {
        const sortField = field || this.currentSort.field;
        const sortOrder = order || this.currentSort.order;

        if (field && order) {
            this.currentSort = { field, order };
        }

        return [...users].sort((a, b) => {
            let aValue, bValue;

            switch (sortField) {
                case 'id':
                    aValue = a.id;
                    bValue = b.id;
                    break;
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'email':
                    aValue = a.email.toLowerCase();
                    bValue = b.email.toLowerCase();
                    break;
                case 'username':
                    aValue = a.username.toLowerCase();
                    bValue = b.username.toLowerCase();
                    break;
                default:
                    aValue = a[sortField];
                    bValue = b[sortField];
            }

            if (aValue < bValue) {
                return sortOrder === CONFIG.DATA.SORT_ORDERS.ASC ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortOrder === CONFIG.DATA.SORT_ORDERS.ASC ? 1 : -1;
            }
            return 0;
        });
    }

    // Toggle sort order
    toggleSortOrder() {
        const newOrder = this.currentSort.order === CONFIG.DATA.SORT_ORDERS.ASC 
            ? CONFIG.DATA.SORT_ORDERS.DESC 
            : CONFIG.DATA.SORT_ORDERS.ASC;
        
        this.currentSort.order = newOrder;
        this.applyFiltersAndSearch();
        
        return newOrder;
    }

    // Get current sort info
    getCurrentSort() {
        return { ...this.currentSort };
    }

    // Get statistics
    getStatistics() {
        return {
            total: this.originalUsers.length,
            filtered: this.filteredUsers.length,
            showing: this.filteredUsers.length
        };
    }

    // Validate user data for duplicates
    validateUserData(formData, excludeUserId = null) {
        const usersForValidation = this.originalUsers.filter(user => 
            excludeUserId ? user.id !== parseInt(excludeUserId) : true
        );

        return validationService.validateForm(formData, usersForValidation, excludeUserId);
    }

    // Get all users for validation
    getAllUsers() {
        return [...this.originalUsers];
    }

    // Get filtered users
    getFilteredUsers() {
        return [...this.filteredUsers];
    }

    // Reset to original data
    reset() {
        this.users = [...this.originalUsers];
        this.currentFilters = {};
        this.searchQuery = '';
        this.currentSort = {
            field: CONFIG.DATA.DEFAULT_SORT.FIELD,
            order: CONFIG.DATA.DEFAULT_SORT.ORDER
        };
        this.applyFiltersAndSearch();
    }
}

// Create a singleton instance
const userService = new UserService();

// Make it globally available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserService;
} else {
    window.userService = userService;
}