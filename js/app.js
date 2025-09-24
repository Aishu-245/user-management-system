// Main application controller
class App {
    constructor() {
        this.isInitialized = false;
        this.currentEditingUserId = null;
    }

    // Initialize the application
    async initialize() {
        try {
            console.log('Initializing User Management System...');
            
            // Setup UI components
            this.setupEventListeners();
            this.setupModalHandlers();
            
            // Initialize services
            paginationService.initialize();
            filteringService.initialize();
            filteringService.setupKeyboardShortcuts();
            
            // Setup responsive behavior
            uiService.initializeResponsive();
            uiService.setupModalCloseHandlers();
            
            // Load initial data
            await this.loadInitialData();
            
            this.isInitialized = true;
            console.log('User Management System initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            uiService.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    // Load initial user data
    async loadInitialData() {
        try {
            await userService.loadUsers();
            paginationService.updateData(userService.getFilteredUsers());
        } catch (error) {
            console.error('Failed to load initial data:', error);
            // Error is already handled by userService.loadUsers()
        }
    }

    // Setup main event listeners
    setupEventListeners() {
        // Add user button
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => this.openAddUserModal());
        }

        // Retry button for error state
        const retryBtn = document.getElementById('retryBtn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.retryLoadUsers());
        }

        // User form submission
        const userForm = document.getElementById('userForm');
        if (userForm) {
            userForm.addEventListener('submit', (event) => this.handleUserFormSubmit(event));
        }

        // Cancel button in user modal
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeUserModal());
        }

        // Dynamic event delegation for edit and delete buttons
        document.addEventListener('click', (event) => {
            if (event.target.closest('.edit-btn')) {
                const userId = event.target.closest('.edit-btn').dataset.userId;
                this.openEditUserModal(userId);
            } else if (event.target.closest('.delete-btn')) {
                const userId = event.target.closest('.delete-btn').dataset.userId;
                this.openDeleteConfirmation(userId);
            }
        });
    }

    // Setup modal handlers
    setupModalHandlers() {
        // User modal close handlers
        const closeUserModal = document.getElementById('closeUserModal');
        if (closeUserModal) {
            closeUserModal.addEventListener('click', () => this.closeUserModal());
        }

        // Delete modal handlers
        const closeDeleteModal = document.getElementById('closeDeleteModal');
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

        if (closeDeleteModal) {
            closeDeleteModal.addEventListener('click', () => this.closeDeleteModal());
        }

        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', () => this.closeDeleteModal());
        }

        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => this.handleDeleteConfirm());
        }
    }

    // Open add user modal
    openAddUserModal() {
        this.currentEditingUserId = null;
        uiService.populateUserForm();
        
        // Setup real-time validation
        const userForm = document.getElementById('userForm');
        if (userForm) {
            validationService.setupRealTimeValidation(userForm, userService.getAllUsers());
        }
        
        uiService.showModal('user');
    }

    // Open edit user modal
    openEditUserModal(userId) {
        const user = userService.getUserById(parseInt(userId));
        
        if (!user) {
            uiService.showError(CONFIG.MESSAGES.ERRORS.USER_NOT_FOUND);
            return;
        }

        this.currentEditingUserId = parseInt(userId);
        uiService.populateUserForm(user);
        
        // Setup real-time validation (exclude current user from duplicate checks)
        const userForm = document.getElementById('userForm');
        if (userForm) {
            validationService.setupRealTimeValidation(
                userForm, 
                userService.getAllUsers(), 
                parseInt(userId)
            );
        }
        
        uiService.showModal('user');
    }

    // Close user modal
    closeUserModal() {
        this.currentEditingUserId = null;
        validationService.clearErrors();
        uiService.hideModal('user');
    }

    // Handle user form submission
    async handleUserFormSubmit(event) {
        event.preventDefault();
        
        const formData = this.getFormData();
        const isEditing = this.currentEditingUserId !== null;

        // Validate form data
        const validation = userService.validateUserData(formData, this.currentEditingUserId);
        
        if (!validation.isValid) {
            validationService.displayErrors(validation.errors);
            return;
        }

        // Clear validation errors
        validationService.clearErrors();

        try {
            // Disable form during submission
            this.setFormSubmissionState(true);

            if (isEditing) {
                await userService.updateUser(this.currentEditingUserId, formData);
            } else {
                await userService.createUser(formData);
            }

            // Close modal and refresh data
            this.closeUserModal();
            paginationService.updateData(userService.getFilteredUsers());

        } catch (error) {
            console.error('Error submitting form:', error);
            uiService.showError(error.message);
        } finally {
            this.setFormSubmissionState(false);
        }
    }

    // Get form data from user form
    getFormData() {
        return {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            website: document.getElementById('website').value,
            department: document.getElementById('department').value
        };
    }

    // Set form submission state (loading/disabled)
    setFormSubmissionState(isSubmitting) {
        const saveBtn = document.getElementById('saveBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const formInputs = document.querySelectorAll('#userForm input, #userForm select');

        if (saveBtn) {
            saveBtn.disabled = isSubmitting;
            if (isSubmitting) {
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            } else {
                const isEditing = this.currentEditingUserId !== null;
                saveBtn.innerHTML = isEditing 
                    ? '<i class="fas fa-save"></i> Update User'
                    : '<i class="fas fa-save"></i> Save User';
            }
        }

        if (cancelBtn) {
            cancelBtn.disabled = isSubmitting;
        }

        formInputs.forEach(input => {
            input.disabled = isSubmitting;
        });
    }

    // Open delete confirmation modal
    openDeleteConfirmation(userId) {
        const user = userService.getUserById(parseInt(userId));
        
        if (!user) {
            uiService.showError(CONFIG.MESSAGES.ERRORS.USER_NOT_FOUND);
            return;
        }

        uiService.setupDeleteConfirmation(user);
        uiService.showModal('delete');
    }

    // Close delete modal
    closeDeleteModal() {
        uiService.hideModal('delete');
    }

    // Handle delete confirmation
    async handleDeleteConfirm() {
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        const userId = confirmDeleteBtn ? confirmDeleteBtn.dataset.userId : null;

        if (!userId) {
            console.error('No user ID found for deletion');
            return;
        }

        try {
            // Set loading state
            if (confirmDeleteBtn) {
                confirmDeleteBtn.disabled = true;
                confirmDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
            }

            await userService.deleteUser(userId);
            
            // Close modal and refresh data
            this.closeDeleteModal();
            paginationService.updateData(userService.getFilteredUsers());

        } catch (error) {
            console.error('Error deleting user:', error);
            uiService.showError(error.message);
        } finally {
            // Reset button state
            if (confirmDeleteBtn) {
                confirmDeleteBtn.disabled = false;
                confirmDeleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Delete User';
            }
        }
    }

    // Retry loading users
    async retryLoadUsers() {
        try {
            await this.loadInitialData();
        } catch (error) {
            console.error('Retry failed:', error);
        }
    }

    // Reset application to initial state
    reset() {
        this.currentEditingUserId = null;
        uiService.hideAllModals();
        validationService.clearErrors();
        userService.reset();
        paginationService.reset();
        filteringService.reset();
    }

    // Get application status
    getStatus() {
        return {
            initialized: this.isInitialized,
            currentEditingUserId: this.currentEditingUserId,
            userStats: userService.getStatistics(),
            paginationState: paginationService.getCurrentState(),
            filterStats: filteringService.getFilterStatistics()
        };
    }

    // Handle global errors
    handleGlobalError(error) {
        console.error('Global error:', error);
        uiService.showError('An unexpected error occurred. Please try refreshing the page.');
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Create global app instance
    window.app = new App();
    
    try {
        await app.initialize();
    } catch (error) {
        console.error('Failed to start application:', error);
    }
});

// Handle global errors
window.addEventListener('error', (event) => {
    if (window.app) {
        app.handleGlobalError(event.error);
    }
});

window.addEventListener('unhandledrejection', (event) => {
    if (window.app) {
        app.handleGlobalError(event.reason);
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}