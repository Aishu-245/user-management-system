// UI service for managing DOM interactions and user interface updates
class UIService {
    constructor() {
        this.modals = {};
        this.successMessageTimeout = null;
        this.initializeModals();
    }

    // Initialize modal references
    initializeModals() {
        this.modals = {
            user: document.getElementById('userModal'),
            filter: document.getElementById('filterModal'),
            delete: document.getElementById('deleteModal')
        };
    }

    // Show modal
    showModal(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            
            // Focus on first input if available
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    // Hide modal
    hideModal(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        }
    }

    // Hide all modals
    hideAllModals() {
        Object.keys(this.modals).forEach(modalName => {
            this.hideModal(modalName);
        });
    }

    // Show loading indicator
    showLoading() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        const usersTable = document.getElementById('usersTable');
        const errorMessage = document.getElementById('errorMessage');

        if (loadingIndicator) loadingIndicator.style.display = 'block';
        if (usersTable) usersTable.style.display = 'none';
        if (errorMessage) errorMessage.style.display = 'none';
    }

    // Hide loading indicator
    hideLoading() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        const usersTable = document.getElementById('usersTable');

        if (loadingIndicator) loadingIndicator.style.display = 'none';
        if (usersTable) usersTable.style.display = 'table';
    }

    // Show error message
    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        const loadingIndicator = document.getElementById('loadingIndicator');
        const usersTable = document.getElementById('usersTable');

        if (errorMessage && errorText) {
            errorText.textContent = message;
            errorMessage.style.display = 'block';
        }

        if (loadingIndicator) loadingIndicator.style.display = 'none';
        if (usersTable) usersTable.style.display = 'none';
    }

    // Hide error message
    hideError() {
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
    }

    // Show success message
    showSuccess(message) {
        const successMessage = document.getElementById('successMessage');
        const successText = document.getElementById('successText');

        if (successMessage && successText) {
            successText.textContent = message;
            successMessage.classList.add('show');

            // Clear previous timeout
            if (this.successMessageTimeout) {
                clearTimeout(this.successMessageTimeout);
            }

            // Auto-hide after specified duration
            this.successMessageTimeout = setTimeout(() => {
                this.hideSuccess();
            }, CONFIG.UI.SUCCESS_MESSAGE_DURATION);
        }
    }

    // Hide success message
    hideSuccess() {
        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            successMessage.classList.remove('show');
        }
    }

    // Populate user form with data
    populateUserForm(user = null) {
        const form = document.getElementById('userForm');
        const modalTitle = document.getElementById('modalTitle');
        const saveBtn = document.getElementById('saveBtn');

        if (!form) return;

        // Clear form first
        form.reset();
        validationService.clearErrors();

        if (user) {
            // Editing existing user
            modalTitle.innerHTML = '<i class="fas fa-user-edit"></i> Edit User';
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Update User';

            // Populate form fields
            document.getElementById('firstName').value = this.getFirstName(user.name) || '';
            document.getElementById('lastName').value = this.getLastName(user.name) || '';
            document.getElementById('username').value = user.username || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('phone').value = user.phone || '';
            document.getElementById('website').value = user.website || '';
            document.getElementById('department').value = this.getDepartment(user) || '';

            // Store user ID for updating
            form.dataset.userId = user.id;
        } else {
            // Adding new user
            modalTitle.innerHTML = '<i class="fas fa-user-plus"></i> Add New User';
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save User';
            delete form.dataset.userId;
        }
    }

    // Get first name from full name
    getFirstName(fullName) {
        if (!fullName) return '';
        const parts = fullName.split(' ');
        return parts[0] || '';
    }

    // Get last name from full name
    getLastName(fullName) {
        if (!fullName) return '';
        const parts = fullName.split(' ');
        return parts.slice(1).join(' ') || '';
    }

    // Get department from user object (derived from company name)
    getDepartment(user) {
        return user.company?.name || '';
    }

    // Create user row for table
    createUserRow(user) {
        const row = document.createElement('tr');
        row.dataset.userId = user.id;
        
        const department = this.getDepartment(user);
        
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${department}</td>
            <td class="actions">
                <button class="btn btn-small btn-secondary edit-btn" data-user-id="${user.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-small btn-danger delete-btn" data-user-id="${user.id}">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </td>
        `;

        return row;
    }

    // Create user card for mobile view
    createUserCard(user) {
        const card = document.createElement('div');
        card.className = 'user-card';
        card.dataset.userId = user.id;
        
        const department = this.getDepartment(user);
        
        card.innerHTML = `
            <div class="user-card-header">
                <div class="user-card-title">${user.name}</div>
                <div class="user-card-id">#${user.id}</div>
            </div>
            <div class="user-card-details">
                <div class="user-card-detail">
                    <strong>Username:</strong> ${user.username}
                </div>
                <div class="user-card-detail">
                    <strong>Email:</strong> ${user.email}
                </div>
                <div class="user-card-detail">
                    <strong>Department:</strong> ${department}
                </div>
            </div>
            <div class="user-card-actions">
                <button class="btn btn-secondary edit-btn" data-user-id="${user.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger delete-btn" data-user-id="${user.id}">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </div>
        `;

        return card;
    }

    // Render users in table or card format
    renderUsers(users) {
        const tableBody = document.getElementById('usersTableBody');
        const tableContainer = document.querySelector('.table-container');

        if (!tableBody) return;

        // Clear existing content
        tableBody.innerHTML = '';

        // Remove existing cards container if any
        const existingCards = document.getElementById('usersCards');
        if (existingCards) {
            existingCards.remove();
        }

        if (users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <i class="fas fa-users"></i> No users found
                    </td>
                </tr>
            `;
            return;
        }

        // Render table rows
        users.forEach(user => {
            const row = this.createUserRow(user);
            tableBody.appendChild(row);
        });

        // Create mobile cards container
        const cardsContainer = document.createElement('div');
        cardsContainer.id = 'usersCards';
        cardsContainer.className = 'users-cards';
        cardsContainer.style.display = 'none'; // Hidden by default, shown via CSS media queries

        // Render user cards for mobile
        users.forEach(user => {
            const card = this.createUserCard(user);
            cardsContainer.appendChild(card);
        });

        // Insert cards container after table container
        tableContainer.parentNode.insertBefore(cardsContainer, tableContainer.nextSibling);
    }

    // Update pagination info
    updatePaginationInfo(currentPage, pageSize, totalUsers, filteredUsers) {
        const paginationInfo = document.getElementById('paginationInfo');
        if (!paginationInfo) return;

        const startIndex = (currentPage - 1) * pageSize + 1;
        const endIndex = Math.min(currentPage * pageSize, filteredUsers);
        
        paginationInfo.textContent = `Showing ${startIndex}-${endIndex} of ${filteredUsers} users`;
        
        if (filteredUsers < totalUsers) {
            paginationInfo.textContent += ` (filtered from ${totalUsers} total)`;
        }
    }

    // Setup delete confirmation
    setupDeleteConfirmation(user) {
        const deleteUserName = document.getElementById('deleteUserName');
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

        if (deleteUserName) {
            deleteUserName.textContent = user.name;
        }

        if (confirmDeleteBtn) {
            confirmDeleteBtn.dataset.userId = user.id;
        }
    }

    // Add fade-in animation to elements
    addFadeInAnimation(element) {
        if (CONFIG.FEATURES.ENABLE_ANIMATIONS) {
            element.classList.add('fade-in');
        }
    }

    // Debounce function for search input
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Setup modal close handlers
    setupModalCloseHandlers() {
        // Close modals when clicking outside
        window.addEventListener('click', (event) => {
            Object.values(this.modals).forEach(modal => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                }
            });
        });

        // Close modals with Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }

    // Initialize responsive behavior
    initializeResponsive() {
        // Show/hide appropriate views based on screen size
        const checkScreenSize = () => {
            const isMobile = window.innerWidth <= 768;
            const table = document.getElementById('usersTable');
            const cards = document.getElementById('usersCards');

            if (table && cards) {
                if (isMobile) {
                    table.style.display = 'none';
                    cards.style.display = 'block';
                } else {
                    table.style.display = 'table';
                    cards.style.display = 'none';
                }
            }
        };

        // Check on load and resize
        checkScreenSize();
        window.addEventListener('resize', this.debounce(checkScreenSize, 250));
    }
}

// Create a singleton instance
const uiService = new UIService();

// Make it globally available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIService;
} else {
    window.uiService = uiService;
}