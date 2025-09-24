// Filtering service for handling user filters and search
class FilteringService {
    constructor() {
        this.currentFilters = {};
        this.isFilterModalOpen = false;
    }

    // Initialize filtering functionality
    initialize() {
        this.setupFilterModal();
        this.setupSearchInput();
        this.setupSortControls();
    }

    // Setup filter modal
    setupFilterModal() {
        const filterBtn = document.getElementById('filterBtn');
        const filterModal = document.getElementById('filterModal');
        const closeFilterModal = document.getElementById('closeFilterModal');
        const applyFiltersBtn = document.getElementById('applyFiltersBtn');
        const clearFiltersBtn = document.getElementById('clearFiltersBtn');

        // Open filter modal
        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                this.openFilterModal();
            });
        }

        // Close filter modal
        if (closeFilterModal) {
            closeFilterModal.addEventListener('click', () => {
                this.closeFilterModal();
            });
        }

        // Apply filters
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }

        // Clear filters
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Close modal when clicking outside
        if (filterModal) {
            filterModal.addEventListener('click', (event) => {
                if (event.target === filterModal) {
                    this.closeFilterModal();
                }
            });
        }
    }

    // Setup search input
    setupSearchInput() {
        const searchInput = document.getElementById('searchInput');
        
        if (searchInput) {
            // Debounced search
            const debouncedSearch = uiService.debounce((query) => {
                this.performSearch(query);
            }, CONFIG.UI.DEBOUNCE_DELAY);

            searchInput.addEventListener('input', (event) => {
                debouncedSearch(event.target.value);
            });

            // Clear search with Escape key
            searchInput.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    searchInput.value = '';
                    this.performSearch('');
                }
            });
        }
    }

    // Setup sort controls
    setupSortControls() {
        const sortBySelect = document.getElementById('sortBy');
        const sortOrderBtn = document.getElementById('sortOrder');

        // Sort field change
        if (sortBySelect) {
            sortBySelect.addEventListener('change', (event) => {
                const currentSort = userService.getCurrentSort();
                userService.sortUsers(userService.getFilteredUsers(), event.target.value, currentSort.order);
                paginationService.updateData(userService.getFilteredUsers());
            });
        }

        // Sort order toggle
        if (sortOrderBtn) {
            sortOrderBtn.addEventListener('click', () => {
                const newOrder = userService.toggleSortOrder();
                this.updateSortOrderButton(newOrder);
                paginationService.updateData(userService.getFilteredUsers());
            });
        }

        // Initialize sort order button
        this.updateSortOrderButton(userService.getCurrentSort().order);
    }

    // Open filter modal
    openFilterModal() {
        this.isFilterModalOpen = true;
        this.populateFilterModal();
        uiService.showModal('filter');
    }

    // Close filter modal
    closeFilterModal() {
        this.isFilterModalOpen = false;
        uiService.hideModal('filter');
    }

    // Populate filter modal with current filters
    populateFilterModal() {
        const filterInputs = {
            filterFirstName: this.currentFilters.firstName || '',
            filterLastName: this.currentFilters.lastName || '',
            filterEmail: this.currentFilters.email || '',
            filterDepartment: this.currentFilters.department || ''
        };

        Object.entries(filterInputs).forEach(([id, value]) => {
            const input = document.getElementById(id);
            if (input) {
                input.value = value;
            }
        });
    }

    // Apply filters from modal
    applyFilters() {
        const filters = this.getFiltersFromModal();
        this.currentFilters = filters;
        
        // Apply filters to user service
        userService.applyFilters(filters);
        
        // Update pagination
        paginationService.updateData(userService.getFilteredUsers());
        
        // Update filter button appearance
        this.updateFilterButtonAppearance();
        
        // Close modal
        this.closeFilterModal();
        
        // Show success message if filters were applied
        if (this.hasActiveFilters()) {
            uiService.showSuccess(CONFIG.MESSAGES.SUCCESS.FILTERS_APPLIED);
        }
    }

    // Get filters from modal inputs
    getFiltersFromModal() {
        const filterFirstName = document.getElementById('filterFirstName');
        const filterLastName = document.getElementById('filterLastName');
        const filterEmail = document.getElementById('filterEmail');
        const filterDepartment = document.getElementById('filterDepartment');

        return {
            firstName: filterFirstName ? filterFirstName.value.trim() : '',
            lastName: filterLastName ? filterLastName.value.trim() : '',
            email: filterEmail ? filterEmail.value.trim() : '',
            department: filterDepartment ? filterDepartment.value.trim() : ''
        };
    }

    // Clear all filters
    clearFilters() {
        this.currentFilters = {};
        
        // Clear filter modal inputs
        this.clearFilterModalInputs();
        
        // Clear search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Apply cleared filters
        userService.clearFilters();
        paginationService.updateData(userService.getFilteredUsers());
        
        // Update filter button appearance
        this.updateFilterButtonAppearance();
        
        // Close modal if open
        if (this.isFilterModalOpen) {
            this.closeFilterModal();
        }
    }

    // Clear filter modal inputs
    clearFilterModalInputs() {
        const filterInputIds = ['filterFirstName', 'filterLastName', 'filterEmail', 'filterDepartment'];
        
        filterInputIds.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.value = '';
            }
        });
    }

    // Perform search
    performSearch(query) {
        userService.applySearch(query);
        paginationService.updateData(userService.getFilteredUsers());
        
        // Update filter button appearance (search is a type of filter)
        this.updateFilterButtonAppearance();
    }

    // Check if there are active filters
    hasActiveFilters() {
        const hasFilters = Object.values(this.currentFilters).some(value => value.trim() !== '');
        const hasSearch = userService.searchQuery !== '';
        return hasFilters || hasSearch;
    }

    // Update filter button appearance
    updateFilterButtonAppearance() {
        const filterBtn = document.getElementById('filterBtn');
        
        if (filterBtn) {
            if (this.hasActiveFilters()) {
                filterBtn.classList.add('btn-primary');
                filterBtn.classList.remove('btn-secondary');
                filterBtn.innerHTML = '<i class="fas fa-filter"></i> Filter (Active)';
            } else {
                filterBtn.classList.add('btn-secondary');
                filterBtn.classList.remove('btn-primary');
                filterBtn.innerHTML = '<i class="fas fa-filter"></i> Filter';
            }
        }
    }

    // Update sort order button appearance
    updateSortOrderButton(order) {
        const sortOrderBtn = document.getElementById('sortOrder');
        
        if (sortOrderBtn) {
            const icon = sortOrderBtn.querySelector('i');
            if (icon) {
                if (order === CONFIG.DATA.SORT_ORDERS.ASC) {
                    icon.className = 'fas fa-sort-amount-down';
                    sortOrderBtn.title = 'Sort Ascending (click for Descending)';
                } else {
                    icon.className = 'fas fa-sort-amount-up';
                    sortOrderBtn.title = 'Sort Descending (click for Ascending)';
                }
            }
        }
    }

    // Get current filters
    getCurrentFilters() {
        return { ...this.currentFilters };
    }

    // Set filters programmatically
    setFilters(filters) {
        this.currentFilters = { ...filters };
        userService.applyFilters(this.currentFilters);
        paginationService.updateData(userService.getFilteredUsers());
        this.updateFilterButtonAppearance();
    }

    // Get filter statistics
    getFilterStatistics() {
        const stats = userService.getStatistics();
        return {
            totalUsers: stats.total,
            filteredUsers: stats.filtered,
            filtersActive: this.hasActiveFilters(),
            activeFilterCount: Object.values(this.currentFilters).filter(value => value.trim() !== '').length,
            searchActive: userService.searchQuery !== ''
        };
    }

    // Reset all filters and search
    reset() {
        this.currentFilters = {};
        this.clearFilterModalInputs();
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.updateFilterButtonAppearance();
        
        // Reset sort to default
        const sortBySelect = document.getElementById('sortBy');
        if (sortBySelect) {
            sortBySelect.value = CONFIG.DATA.DEFAULT_SORT.FIELD;
        }
        
        this.updateSortOrderButton(CONFIG.DATA.DEFAULT_SORT.ORDER);
    }

    // Setup keyboard shortcuts for filtering
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Only handle if no input is focused and no modal is open
            if (document.activeElement.tagName === 'INPUT' || 
                document.activeElement.tagName === 'SELECT' ||
                document.activeElement.tagName === 'TEXTAREA' ||
                document.querySelector('.modal[style*="block"]')) {
                return;
            }

            switch (event.key) {
                case 'f':
                case 'F':
                    event.preventDefault();
                    this.openFilterModal();
                    break;
                case '/':
                    event.preventDefault();
                    const searchInput = document.getElementById('searchInput');
                    if (searchInput) {
                        searchInput.focus();
                    }
                    break;
            }
        });
    }
}

// Create a singleton instance
const filteringService = new FilteringService();

// Make it globally available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FilteringService;
} else {
    window.filteringService = filteringService;
}