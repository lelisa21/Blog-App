class ArticlesController {
  constructor() {
    this.articles = [];
    this.filteredArticles = [];
    this.currentPage = 1;
    this.itemsPerPage = 12;
    this.filters = {
      category: "",
      tags: [],
      search: "",
      sort: "date",
      readingTime: null,
    };
    this.init();
  }

  init() {
    this.loadArticles();
    this.initFilters();
    this.initSearch();
    this.initSorting();
    this.initPagination();
    this.initInfiniteScroll();
    this.initTagFiltering();
    this.initReadingTimeFilter();
  }

  /**
   * Load articles from DOM
   */
  loadArticles() {
    const articleCards = document.querySelectorAll(".article-card");
    this.articles = Array.from(articleCards).map((card) => ({
      element: card,
      title: card.querySelector(".card-title, h3")?.textContent || "",
      category: card.querySelector(".category, .badge")?.textContent || "",
      tags: Array.from(card.querySelectorAll(".tag")).map((tag) =>
        tag.textContent.toLowerCase()
      ),
      readingTime: this.extractReadingTime(card),
      date: this.extractDate(card),
      author: card.querySelector(".author-name, .name")?.textContent || "",
      views: this.extractViews(card),
      excerpt: card.querySelector(".excerpt, p")?.textContent || "",
    }));

    this.filteredArticles = [...this.articles];
    this.renderArticles();
  }

  /**
   * Extract reading time from article card
   */
  extractReadingTime(card) {
    const readingTimeEl = card.querySelector(".reading-time");
    if (!readingTimeEl) return null;
    const match = readingTimeEl.textContent.match(/(\d+)\s*min/);
    return match ? parseInt(match[1]) : null;
  }
  extractDate(card) {
    const dateEl = card.querySelector(".date, .article-date");
    if (!dateEl) return new Date();
    return new Date(dateEl.textContent) || new Date();
  }
  extractViews(card) {
    const viewsEl = card.querySelector(".views");
    if (!viewsEl) return 0;
    const match = viewsEl.textContent.match(/([\d.]+)k?/);
    if (!match) return 0;
    const num = parseFloat(match[1]);
    return viewsEl.textContent.includes("k") ? num * 1000 : num;
  }

  /**
   * Initialize filter controls
   */
  initFilters() {
    // Category filter from URL or buttons
    const urlParams = AppUtils.getQueryParams();
    if (urlParams.category) {
      this.filters.category = urlParams.category.toLowerCase();
      this.setActiveCategory(this.filters.category);
    }

    // Category buttons
    const categoryButtons = document.querySelectorAll(
      "[data-category-filter], .category-filter"
    );
    categoryButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const category =
          button.dataset.categoryFilter || button.dataset.category || "";
        this.filterByCategory(category);
      });
    });

    // Clear filters button
    const clearFilters = document.querySelector(
      "#clear-filters, .clear-filters"
    );
    if (clearFilters) {
      clearFilters.addEventListener("click", () => {
        this.clearAllFilters();
      });
    }
  }

  /**
   * Filter articles by category
   */
  filterByCategory(category) {
    this.filters.category = category.toLowerCase();
    this.setActiveCategory(category);
    AppUtils.updateQueryParams({ category: category || null });
    this.applyFilters();
  }

  /**
   * Set active category button
   */
  setActiveCategory(category) {
    document
      .querySelectorAll("[data-category-filter], .category-filter")
      .forEach((btn) => {
        const btnCategory = (
          btn.dataset.categoryFilter ||
          btn.dataset.category ||
          ""
        ).toLowerCase();
        if (btnCategory === category.toLowerCase()) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
  }

  /**
   * Initialize search functionality
   */
  initSearch() {
    const searchInput = document.querySelector(
      "#article-search, .article-search input"
    );
    if (!searchInput) return;

    // Get search term from URL
    const urlParams = AppUtils.getQueryParams();
    if (urlParams.search) {
      searchInput.value = urlParams.search;
      this.filters.search = urlParams.search.toLowerCase();
    }

    // Debounced search input
    const debouncedSearch = AppUtils.debounce((e) => {
      this.filters.search = e.target.value.toLowerCase();
      AppUtils.updateQueryParams({ search: this.filters.search || null });
      this.applyFilters();
    }, 300);

    searchInput.addEventListener("input", debouncedSearch);

    // Clear search
    const clearSearch =
      searchInput.parentElement.querySelector(".clear-search");
    if (clearSearch) {
      clearSearch.addEventListener("click", () => {
        searchInput.value = "";
        this.filters.search = "";
        AppUtils.updateQueryParams({ search: null });
        this.applyFilters();
      });
    }
  }

  /**
   * Initialize sorting functionality
   */
  initSorting() {
    const sortSelect = document.querySelector("#sort-articles, .sort-select");
    if (!sortSelect) return;

    sortSelect.addEventListener("change", (e) => {
      this.filters.sort = e.target.value;
      this.applyFilters();
    });
  }

  /**
   * Initialize tag filtering
   */
  initTagFiltering() {
    const tagButtons = document.querySelectorAll(".tag[data-filter]");
    tagButtons.forEach((tag) => {
      tag.addEventListener("click", (e) => {
        e.preventDefault();
        const tagName = tag.textContent.toLowerCase().replace("#", "");

        if (this.filters.tags.includes(tagName)) {
          this.filters.tags = this.filters.tags.filter((t) => t !== tagName);
          tag.classList.remove("active");
        } else {
          this.filters.tags.push(tagName);
          tag.classList.add("active");
        }

        this.applyFilters();
      });
    });
  }

  /**
   * Initialize reading time filter
   */
  initReadingTimeFilter() {
    const readingTimeFilter = document.querySelector("#reading-time-filter");
    if (!readingTimeFilter) return;

    readingTimeFilter.addEventListener("change", (e) => {
      const value = e.target.value;
      this.filters.readingTime = value ? parseInt(value) : null;
      this.applyFilters();
    });
  }

  /**
   * Apply all active filters
   */
  applyFilters() {
    this.filteredArticles = this.articles.filter((article) => {
      // Category filter
      if (
        this.filters.category &&
        !article.category.toLowerCase().includes(this.filters.category)
      ) {
        return false;
      }

      // Search filter
      if (this.filters.search) {
        const searchLower = this.filters.search.toLowerCase();
        const matchesSearch =
          article.title.toLowerCase().includes(searchLower) ||
          article.excerpt.toLowerCase().includes(searchLower) ||
          article.tags.some((tag) => tag.includes(searchLower)) ||
          article.author.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Tag filter
      if (this.filters.tags.length > 0) {
        const hasMatchingTag = this.filters.tags.some((filterTag) =>
          article.tags.some((articleTag) => articleTag.includes(filterTag))
        );
        if (!hasMatchingTag) return false;
      }

      // Reading time filter
      if (this.filters.readingTime && article.readingTime) {
        if (article.readingTime > this.filters.readingTime) return false;
      }

      return true;
    });

    // Sort articles
    this.sortArticles();

    // Reset pagination
    this.currentPage = 1;

    // Render results
    this.renderArticles();
    this.updateResultsCount();
  }

  /**
   * Sort articles based on current sort option
   */
  sortArticles() {
    switch (this.filters.sort) {
      case "popularity":
      case "views":
        this.filteredArticles.sort((a, b) => b.views - a.views);
        break;
      case "reading-time":
        this.filteredArticles.sort((a, b) => {
          const aTime = a.readingTime || 0;
          const bTime = b.readingTime || 0;
          return aTime - bTime;
        });
        break;
      case "title":
        this.filteredArticles.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "date":
      default:
        this.filteredArticles.sort((a, b) => b.date - a.date);
        break;
    }
  }

  /**
   * Render filtered articles
   */
  renderArticles() {
    const container = document.querySelector(
      "#articles-container, .articles-grid"
    );
    if (!container) return;

    // Hide all articles first
    this.articles.forEach((article) => {
      article.element.style.display = "none";
    });

    // Calculate pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const articlesToShow = this.filteredArticles.slice(startIndex, endIndex);

    // Show filtered articles
    articlesToShow.forEach((article) => {
      article.element.style.display = "block";
      article.element.style.opacity = "1";
    });

    // Show "no results" message if needed
    this.showNoResults(container);
  }

  /**
   * Show "no results" message
   */
  showNoResults(container) {
    let noResults = container.querySelector(".no-results");

    if (this.filteredArticles.length === 0) {
      if (!noResults) {
        noResults = document.createElement("div");
        noResults.className = "no-results";
        noResults.innerHTML = `
          <i class="fas fa-search"></i>
          <h3>No articles found</h3>
          <p>Try adjusting your filters or search terms</p>
        `;
        container.appendChild(noResults);
      }
      noResults.style.display = "block";
    } else if (noResults) {
      noResults.style.display = "none";
    }
  }

  /**
   * Update results count display
   */
  updateResultsCount() {
    const countEl = document.querySelector(".results-count, #article-count");
    if (countEl) {
      const count = this.filteredArticles.length;
      countEl.textContent = `${count} article${count !== 1 ? "s" : ""} found`;
    }

    // Announce to screen readers
    if (window.announceToScreenReader) {
      window.announceToScreenReader(
        `${this.filteredArticles.length} articles found`
      );
    }
  }

  /**
   * Initialize pagination controls
   */
  initPagination() {
    const pagination = document.querySelector("#pagination, .pagination");
    if (!pagination) return;

    const pageButtons = pagination.querySelectorAll(".page-btn");
    pageButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const page = parseInt(button.textContent);
        if (page && page !== this.currentPage) {
          this.goToPage(page);
        }
      });
    });

    // Update pagination display
    this.updatePagination();
  }

  /**
   * Go to specific page
   */
  goToPage(page) {
    const maxPage = Math.ceil(this.filteredArticles.length / this.itemsPerPage);
    if (page < 1 || page > maxPage) return;

    this.currentPage = page;
    this.renderArticles();
    this.updatePagination();

    // Scroll to top of articles
    const container = document.querySelector(
      "#articles-container, .articles-grid"
    );
    if (container) {
      AppUtils.smoothScrollTo(container, 100);
    }
  }

  /**
   * Update pagination UI
   */
  updatePagination() {
    const pagination = document.querySelector("#pagination, .pagination");
    if (!pagination) return;

    const maxPage = Math.ceil(this.filteredArticles.length / this.itemsPerPage);
    const pageButtons = pagination.querySelectorAll(".page-btn");

    pageButtons.forEach((button) => {
      const page = parseInt(button.textContent);
      if (page === this.currentPage) {
        button.classList.add("active");
        button.setAttribute("aria-current", "page");
      } else {
        button.classList.remove("active");
        button.removeAttribute("aria-current");
      }

      // Hide buttons beyond max page
      if (page > maxPage) {
        button.style.display = "none";
      } else {
        button.style.display = "";
      }
    });
  }

  /**
   * Initialize infinite scroll
   */
  initInfiniteScroll() {
    const loadMoreBtn = document.querySelector("#load-more, .load-more");
    if (!loadMoreBtn) return;

    loadMoreBtn.addEventListener("click", () => {
      this.loadMore();
    });

    // Also support scroll-based loading
    let loading = false;
    const scrollHandler = AppUtils.throttle(() => {
      if (loading) return;

      const scrollPosition = window.innerHeight + window.scrollY;
      const pageHeight = document.documentElement.scrollHeight;

      if (scrollPosition >= pageHeight - 200) {
        loading = true;
        this.loadMore();
        setTimeout(() => {
          loading = false;
        }, 1000);
      }
    }, 200);

    window.addEventListener("scroll", scrollHandler, { passive: true });
  }

  /**
   * Load more articles
   */
  loadMore() {
    const maxPage = Math.ceil(this.filteredArticles.length / this.itemsPerPage);
    if (this.currentPage >= maxPage) return;

    this.currentPage++;
    this.renderArticles();

    // Update load more button
    const loadMoreBtn = document.querySelector("#load-more, .load-more");
    if (loadMoreBtn) {
      if (this.currentPage >= maxPage) {
        loadMoreBtn.style.display = "none";
      }
    }
  }

  /**
   * Clear all active filters
   */
  clearAllFilters() {
    this.filters = {
      category: "",
      tags: [],
      search: "",
      sort: "date",
      readingTime: null,
    };

    // Reset UI
    const searchInput = document.querySelector(
      "#article-search, .article-search input"
    );
    if (searchInput) searchInput.value = "";

    document
      .querySelectorAll(".tag.active, .category-filter.active")
      .forEach((el) => {
        el.classList.remove("active");
      });

    const sortSelect = document.querySelector("#sort-articles, .sort-select");
    if (sortSelect) sortSelect.value = "date";

    // Update URL
    AppUtils.updateQueryParams({
      category: null,
      search: null,
    });

    this.applyFilters();
  }
}

// Initialize articles controller when DOM is ready
function initArticles() {
  if (document.querySelector(".articles-grid, #articles-container")) {
    window.articlesController = new ArticlesController();
  }
}

// Auto-initialize if on articles page
document.addEventListener("DOMContentLoaded", () => {
  const isArticlesPage =
    window.location.pathname.includes("articles.html") ||
    document.querySelector(".articles-grid, #articles-container");

  if (isArticlesPage) {
    initArticles();
  }
});

// Export for manual initialization
window.initArticles = initArticles;
