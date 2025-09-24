// Pagination service for handling page navigation and display
class PaginationService {
    constructor() {
        this.currentPage = 1;
        this.pageSize = CONFIG.PAGINATION.DEFAULT_PAGE_SIZE;
        this.totalItems = 0;
        this.data = [];
        this.maxVisiblePages = CONFIG.PAGINATION.MAX_VISIBLE_PAGES;
    }

    // Update data and reset pagination
    updateData(newData) {
        this.data = newData;
        this.totalItems = newData.length;
        
        // Reset to first page if current page is out of bounds
        const totalPages = this.getTotalPages();
        if (this.currentPage > totalPages && totalPages > 0) {
            this.currentPage = 1;
        }
        
        this.render();
    }

    // Get total number of pages
    getTotalPages() {
        return Math.ceil(this.totalItems / this.pageSize);
    }

    // Get current page data
    getCurrentPageData() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return this.data.slice(startIndex, endIndex);
    }

    // Go to specific page
    goToPage(page) {
        const totalPages = this.getTotalPages();
        
        if (page < 1) {
            this.currentPage = 1;
        } else if (page > totalPages) {
            this.currentPage = totalPages;
        } else {
            this.currentPage = page;
        }
        
        this.render();
    }

    // Go to next page
    nextPage() {
        this.goToPage(this.currentPage + 1);
    }

    // Go to previous page
    previousPage() {
        this.goToPage(this.currentPage - 1);
    }

    // Change page size
    changePageSize(newPageSize) {
        // Calculate what item we're currently looking at
        const currentItemIndex = (this.currentPage - 1) * this.pageSize;
        
        // Update page size
        this.pageSize = parseInt(newPageSize);
        
        // Calculate new page to maintain position
        this.currentPage = Math.floor(currentItemIndex / this.pageSize) + 1;
        
        this.render();
    }

    // Render pagination UI
    render() {
        this.renderPageData();
        this.renderPaginationControls();
        this.renderPaginationInfo();
    }

    // Render current page data
    renderPageData() {
        const currentData = this.getCurrentPageData();
        uiService.renderUsers(currentData);
    }

    // Render pagination controls
    renderPaginationControls() {
        const totalPages = this.getTotalPages();
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const pageNumbers = document.getElementById('pageNumbers');

        // Update previous button
        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }

        // Update next button
        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= totalPages;
        }

        // Render page numbers
        if (pageNumbers) {
            pageNumbers.innerHTML = '';
            
            if (totalPages <= 1) {
                return; // Don't show page numbers if only one page
            }

            const pageRange = this.getPageRange(totalPages);
            
            pageRange.forEach(page => {
                if (page === '...') {
                    const ellipsis = document.createElement('span');
                    ellipsis.textContent = '...';
                    ellipsis.className = 'page-ellipsis';
                    pageNumbers.appendChild(ellipsis);
                } else {
                    const pageBtn = document.createElement('button');
                    pageBtn.textContent = page;
                    pageBtn.className = `btn btn-small ${page === this.currentPage ? 'active' : ''}`;
                    pageBtn.addEventListener('click', () => this.goToPage(page));
                    pageNumbers.appendChild(pageBtn);
                }
            });
        }
    }

    // Get page range for pagination display
    getPageRange(totalPages) {
        const range = [];
        const start = Math.max(1, this.currentPage - Math.floor(this.maxVisiblePages / 2));
        const end = Math.min(totalPages, start + this.maxVisiblePages - 1);

        // Adjust start if we're near the end
        const adjustedStart = Math.max(1, end - this.maxVisiblePages + 1);

        // Add first page and ellipsis if needed
        if (adjustedStart > 1) {
            range.push(1);
            if (adjustedStart > 2) {
                range.push('...');
            }
        }

        // Add visible page range
        for (let i = adjustedStart; i <= end; i++) {
            range.push(i);
        }

        // Add ellipsis and last page if needed
        if (end < totalPages) {
            if (end < totalPages - 1) {
                range.push('...');
            }
            range.push(totalPages);
        }

        return range;
    }

    // Render pagination info
    renderPaginationInfo() {
        const stats = userService.getStatistics();
        uiService.updatePaginationInfo(
            this.currentPage,
            this.pageSize,
            stats.total,
            stats.filtered
        );
    }

    // Initialize pagination controls
    initialize() {
        this.setupEventListeners();
        this.setupPageSizeSelector();
    }

    // Setup event listeners
    setupEventListeners() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousPage());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextPage());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (event) => {
            // Only handle if no input is focused
            if (document.activeElement.tagName === 'INPUT' || 
                document.activeElement.tagName === 'SELECT' ||
                document.activeElement.tagName === 'TEXTAREA') {
                return;
            }

            switch (event.key) {
                case 'ArrowLeft':
                    event.preventDefault();
                    this.previousPage();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    this.nextPage();
                    break;
                case 'Home':
                    event.preventDefault();
                    this.goToPage(1);
                    break;
                case 'End':
                    event.preventDefault();
                    this.goToPage(this.getTotalPages());
                    break;
            }
        });
    }

    // Setup page size selector
    setupPageSizeSelector() {
        const itemsPerPageSelect = document.getElementById('itemsPerPage');
        
        if (itemsPerPageSelect) {
            // Set default value
            itemsPerPageSelect.value = this.pageSize;
            
            itemsPerPageSelect.addEventListener('change', (event) => {
                this.changePageSize(event.target.value);
            });
        }
    }

    // Get current pagination state
    getCurrentState() {
        return {
            currentPage: this.currentPage,
            pageSize: this.pageSize,
            totalItems: this.totalItems,
            totalPages: this.getTotalPages(),
            hasNextPage: this.currentPage < this.getTotalPages(),
            hasPreviousPage: this.currentPage > 1
        };
    }

    // Reset pagination
    reset() {
        this.currentPage = 1;
        this.pageSize = CONFIG.PAGINATION.DEFAULT_PAGE_SIZE;
        this.totalItems = 0;
        this.data = [];
        
        // Reset page size selector
        const itemsPerPageSelect = document.getElementById('itemsPerPage');
        if (itemsPerPageSelect) {
            itemsPerPageSelect.value = this.pageSize;
        }
    }

    // Get pagination summary
    getSummary() {
        const totalPages = this.getTotalPages();
        const startItem = ((this.currentPage - 1) * this.pageSize) + 1;
        const endItem = Math.min(this.currentPage * this.pageSize, this.totalItems);
        
        return {
            currentPage: this.currentPage,
            totalPages: totalPages,
            startItem: startItem,
            endItem: endItem,
            totalItems: this.totalItems,
            pageSize: this.pageSize
        };
    }
}

// Create a singleton instance
const paginationService = new PaginationService();

// Make it globally available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaginationService;
} else {
    window.paginationService = paginationService;
}