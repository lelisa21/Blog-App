/* articles.js - Complete Functional Implementation */
(function() {
  'use strict';

  // ================== DOM ELEMENTS ==================
  const elements = {
    // Main containers
    articlesContainer: document.getElementById('articles-container'),
    communitySection: document.getElementById('community'),
    
    // Header elements
    articleCount: document.getElementById('articleCount'),
    resultsCount: document.getElementById('resultsCount'),
    resultsTitle: document.getElementById('resultsTitle'),
    totalCount: document.getElementById('totalCount'),
    
    // Filter elements
    articleSearch: document.getElementById('articleSearch'),
    clearSearch: document.getElementById('clearSearch'),
    toggleFilters: document.getElementById('toggleFilters'),
    advancedFilters: document.getElementById('advancedFilters'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    clearAllFilters: document.getElementById('clearAllFilters'),
    
    // Filter controls
    categoryFilters: document.getElementById('categoryFilters'),
    tagsCloud: document.getElementById('tagsCloud'),
    readingTimeSlider: document.getElementById('readingTimeSlider'),
    readingTimeValue: document.getElementById('readingTimeValue'),
    sortSelect: document.getElementById('sortSelect'),
    
    // Active filters display
    activeFilters: document.getElementById('activeFilters'),
    activeTags: document.getElementById('activeTags'),
    
    // State elements
    emptyState: document.getElementById('emptyState'),
    loadingState: document.getElementById('loadingState'),
    loadMoreBtn: document.getElementById('load-more'),
    
    // Pagination
    pagination: document.querySelector('.pagination'),
    pageBtns: document.querySelectorAll('.page-btn')
  };

  // ================== STATE MANAGEMENT ==================
  const state = {
    articles: [],
    filteredArticles: [],
    displayedCount: 5,
    currentPage: 1,
    
    filters: {
      search: '',
      categories: new Set(),
      tags: new Set(),
      maxReadingTime: 30,
      dateRange: 0,
      sortBy: 'newest'
    },
    
    likes: JSON.parse(localStorage.getItem('articleLikes') || '{}'),
    bookmarks: JSON.parse(localStorage.getItem('articleBookmarks') || '{}'),
    recentSearches: JSON.parse(localStorage.getItem('recentSearches') || '[]')
  };

  // ================== UTILITY FUNCTIONS ==================
  const utils = {
    // DOM helpers
    $: (selector, context = document) => context.querySelector(selector),
    $$: (selector, context = document) => Array.from(context.querySelectorAll(selector)),
    
    // String utilities
    escapeHtml: (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },
    
    formatDate: (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    
    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
    
    // Storage utilities
    saveToStorage: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.error('Error saving to localStorage:', e);
        return false;
      }
    },
    
    loadFromStorage: (key) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (e) {
        console.error('Error loading from localStorage:', e);
        return null;
      }
    }
  };

  // ================== ARTICLE DATA EXTRACTION ==================
  function extractArticleData() {
    const articleCards = utils.$$('.article-card');
    
    return articleCards.map((card, index) => {
      // Extract data from DOM
      const title = utils.$('.card-title a', card)?.textContent?.trim() || 'Untitled Article';
      const excerpt = utils.$('.card-excerpt', card)?.textContent?.trim() || '';
      const category = card.dataset.category || 'uncategorized';
      const readingTime = parseInt(card.dataset.reading || '5');
      const dateStr = utils.$('.card-date', card)?.textContent?.trim() || new Date().toISOString();
      const tags = utils.$$('.tag', card).map(tag => tag.textContent.trim().toLowerCase());
      const authorName = utils.$('.author-name', card)?.textContent?.trim() || 'Anonymous';
      const authorAvatar = utils.$('.author-avatar', card)?.textContent?.trim() || authorName.charAt(0);
      const views = parseInt(utils.$('.stat:nth-child(2)', card)?.textContent?.match(/\d+/)?.[0] || '0');
      const likes = parseInt(utils.$('.stat:nth-child(3)', card)?.textContent?.match(/\d+/)?.[0] || '0');
      
      // Calculate date from string (e.g., "Nov 10, 2025")
      let date = new Date();
      try {
        date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          // Try parsing format like "Nov 10, 2025"
          date = new Date(dateStr.replace(/(\w+)\s(\d+),\s(\d+)/, '$1 $2, $3'));
        }
      } catch (e) {
        console.warn('Could not parse date:', dateStr);
      }
      
      return {
        id: `article-${index + 1}`,
        element: card,
        title,
        excerpt,
        category,
        readingTime,
        date,
        tags,
        author: {
          name: authorName,
          avatar: authorAvatar
        },
        views,
        likes,
        image: utils.$('.card-media img', card)?.src || 'assets/images/articles/default.jpg'
      };
    });
  }

  // ================== FILTERING SYSTEM ==================
  function filterArticles() {
    state.filteredArticles = state.articles.filter(article => {
      // Search filter
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase();
        const inTitle = article.title.toLowerCase().includes(searchLower);
        const inExcerpt = article.excerpt.toLowerCase().includes(searchLower);
        const inAuthor = article.author.name.toLowerCase().includes(searchLower);
        const inTags = article.tags.some(tag => tag.includes(searchLower));
        if (!(inTitle || inExcerpt || inAuthor || inTags)) return false;
      }
      
      // Category filter
      if (state.filters.categories.size > 0) {
        if (!state.filters.categories.has(article.category)) return false;
      }
      
      // Tag filter
      if (state.filters.tags.size > 0) {
        const hasAllTags = Array.from(state.filters.tags).every(tag => 
          article.tags.includes(tag)
        );
        if (!hasAllTags) return false;
      }
      
      // Reading time filter
      if (article.readingTime > state.filters.maxReadingTime) return false;
      
      // Date range filter
      if (state.filters.dateRange > 0) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - state.filters.dateRange);
        if (article.date < cutoffDate) return false;
      }
      
      return true;
    });
    
    // Sort articles
    sortArticles();
  }

  function sortArticles() {
    state.filteredArticles.sort((a, b) => {
      switch (state.filters.sortBy) {
        case 'newest':
          return b.date - a.date;
        case 'oldest':
          return a.date - b.date;
        case 'popular':
          return b.views - a.views;
        case 'reading':
          return a.readingTime - b.readingTime;
        default:
          return 0;
      }
    });
  }

  // ================== RENDER FUNCTIONS ==================
  function renderArticles() {
    if (!elements.articlesContainer) return;
    
    const startIndex = 0;
    const endIndex = Math.min(state.displayedCount, state.filteredArticles.length);
    const articlesToShow = state.filteredArticles.slice(startIndex, endIndex);
    
    // Hide all articles first
    state.articles.forEach(article => {
      article.element.style.display = 'none';
    });
    
    // Show filtered articles
    articlesToShow.forEach(article => {
      article.element.style.display = '';
      
      // Update like/bookmark states
      const likeBtn = utils.$('.like-btn', article.element);
      const bookmarkBtn = utils.$('.bookmark-btn', article.element);
      
      if (likeBtn) {
        const isLiked = state.likes[article.id];
        likeBtn.classList.toggle('active', isLiked);
        likeBtn.querySelector('i').className = isLiked ? 'fas fa-heart' : 'far fa-heart';
      }
      
      if (bookmarkBtn) {
        const isBookmarked = state.bookmarks[article.id];
        bookmarkBtn.classList.toggle('active', isBookmarked);
        bookmarkBtn.querySelector('i').className = isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark';
      }
    });
    
    // Update UI states
    updateEmptyState();
    updateLoadMoreButton();
    updatePagination();
  }

  function updateEmptyState() {
    if (!elements.emptyState) return;
    
    if (state.filteredArticles.length === 0) {
      elements.emptyState.style.display = 'block';
      elements.emptyState.innerHTML = `
        <i class="fas fa-search fa-3x"></i>
        <h3>No articles found</h3>
        <p>Try adjusting your filters or search terms.</p>
        <button class="btn btn-primary" id="resetEmptyFilters">Reset Filters</button>
      `;
      
      // Add event listener to reset button
      document.getElementById('resetEmptyFilters')?.addEventListener('click', resetAllFilters);
    } else {
      elements.emptyState.style.display = 'none';
    }
  }

  function updateLoadMoreButton() {
    if (!elements.loadMoreBtn) return;
    
    if (state.displayedCount < state.filteredArticles.length) {
      elements.loadMoreBtn.style.display = 'block';
      const remaining = state.filteredArticles.length - state.displayedCount;
      elements.loadMoreBtn.innerHTML = `
        Load more <span class="count">(${remaining} more)</span>
      `;
    } else {
      elements.loadMoreBtn.style.display = 'none';
    }
  }

  function updatePagination() {
    if (!elements.pagination) return;
    
    const totalPages = Math.ceil(state.filteredArticles.length / 5);
    const pageBtns = utils.$$('.page-btn', elements.pagination);
    
    pageBtns.forEach((btn, index) => {
      if (index < totalPages) {
        btn.style.display = '';
        btn.textContent = index + 1;
        btn.classList.toggle('active', state.currentPage === index + 1);
      } else {
        btn.style.display = 'none';
      }
    });
  }

  // ================== FILTER UI MANAGEMENT ==================
  function initializeFilterUI() {
    // Extract categories and tags from articles
    const categories = [...new Set(state.articles.map(article => article.category))];
    const allTags = [...new Set(state.articles.flatMap(article => article.tags))];
    
    // Render category filters
    if (elements.categoryFilters) {
      elements.categoryFilters.innerHTML = categories.map(category => `
        <button class="filter-btn" data-filter="${category}">
          <i class="fas fa-${getCategoryIcon(category)}"></i> ${category}
        </button>
      `).join('');
    }
    
    // Render tags cloud
    if (elements.tagsCloud) {
      elements.tagsCloud.innerHTML = allTags.map(tag => `
        <button class="tag-cloud-btn" data-tag="${tag}">
          ${tag}
        </button>
      `).join('');
    }
    
    // Initialize active filters display
    updateActiveFilters();
  }

  function getCategoryIcon(category) {
    const icons = {
      'web': 'code',
      'data': 'chart-line',
      'mobile': 'mobile-alt',
      'devops': 'server',
      'default': 'file-alt'
    };
    
    const key = category.toLowerCase();
    return icons[key] || icons.default;
  }

  function updateActiveFilters() {
    if (!elements.activeTags || !elements.activeFilters) return;
    
    const activeFilters = [];
    
    // Search filter
    if (state.filters.search) {
      activeFilters.push({
        type: 'search',
        label: `Search: "${state.filters.search}"`,
        clear: () => {
          state.filters.search = '';
          if (elements.articleSearch) elements.articleSearch.value = '';
          updateActiveFilters();
          applyFilters();
        }
      });
    }
    
    // Category filters
    state.filters.categories.forEach(category => {
      activeFilters.push({
        type: 'category',
        label: `Category: ${category}`,
        clear: () => {
          state.filters.categories.delete(category);
          utils.$$(`.filter-btn[data-filter="${category}"]`).forEach(btn => {
            btn.classList.remove('active');
          });
          updateActiveFilters();
          applyFilters();
        }
      });
    });
    
    // Tag filters
    state.filters.tags.forEach(tag => {
      activeFilters.push({
        type: 'tag',
        label: `Tag: ${tag}`,
        clear: () => {
          state.filters.tags.delete(tag);
          utils.$$(`.tag-cloud-btn[data-tag="${tag}"]`).forEach(btn => {
            btn.classList.remove('active');
          });
          updateActiveFilters();
          applyFilters();
        }
      });
    });
    
    // Reading time filter
    if (state.filters.maxReadingTime < 30) {
      activeFilters.push({
        type: 'reading',
        label: `Max ${state.filters.maxReadingTime} min`,
        clear: () => {
          state.filters.maxReadingTime = 30;
          if (elements.readingTimeSlider) elements.readingTimeSlider.value = 30;
          if (elements.readingTimeValue) elements.readingTimeValue.textContent = '30 min or less';
          updateActiveFilters();
          applyFilters();
        }
      });
    }
    
    // Date range filter
    if (state.filters.dateRange > 0) {
      const labels = {
        7: 'Last week',
        30: 'Last month',
        90: 'Last 3 months',
        365: 'Last year'
      };
      
      activeFilters.push({
        type: 'date',
        label: labels[state.filters.dateRange] || `${state.filters.dateRange} days`,
        clear: () => {
          state.filters.dateRange = 0;
          utils.$$('.date-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.days === '0');
          });
          updateActiveFilters();
          applyFilters();
        }
      });
    }
    
    // Render active filters
    elements.activeTags.innerHTML = activeFilters.map(filter => `
      <span class="active-tag">
        ${filter.label}
        <button type="button" aria-label="Remove ${filter.type} filter" class="remove-filter">
          <i class="fas fa-times"></i>
        </button>
      </span>
    `).join('');
    
    // Show/hide active filters section
    elements.activeFilters.style.display = activeFilters.length > 0 ? 'flex' : 'none';
    
    // Add event listeners to remove buttons
    utils.$$('.remove-filter', elements.activeTags).forEach((btn, index) => {
      btn.addEventListener('click', activeFilters[index].clear);
    });
  }

  function updateStats() {
    // Update counts
    if (elements.articleCount) {
      elements.articleCount.textContent = state.articles.length;
    }
    
    if (elements.resultsCount) {
      elements.resultsCount.textContent = state.filteredArticles.length;
    }
    
    if (elements.totalCount) {
      elements.totalCount.textContent = state.articles.length;
    }
    
    // Update title based on filters
    if (elements.resultsTitle) {
      if (state.filters.search) {
        elements.resultsTitle.textContent = `Search results for "${state.filters.search}"`;
      } else if (state.filters.categories.size > 0) {
        const categories = Array.from(state.filters.categories).join(', ');
        elements.resultsTitle.textContent = `${categories} Articles`;
      } else if (state.filters.tags.size > 0) {
        const tags = Array.from(state.filters.tags).join(', ');
        elements.resultsTitle.textContent = `Articles tagged "${tags}"`;
      } else {
        elements.resultsTitle.textContent = 'Latest Articles';
      }
    }
  }

  // ================== EVENT HANDLERS ==================
  function setupEventListeners() {
    // Search functionality
    if (elements.articleSearch) {
      const handleSearch = utils.debounce(() => {
        state.filters.search = elements.articleSearch.value.trim().toLowerCase();
        if (state.filters.search) {
          saveRecentSearch(state.filters.search);
        }
        applyFilters();
      }, 300);
      
      elements.articleSearch.addEventListener('input', handleSearch);
    }
    
    // Clear search button
    if (elements.clearSearch) {
      elements.clearSearch.addEventListener('click', () => {
        if (elements.articleSearch) {
          elements.articleSearch.value = '';
          state.filters.search = '';
          elements.clearSearch.style.display = 'none';
          applyFilters();
        }
      });
      
      // Show/hide clear button based on input
      if (elements.articleSearch) {
        elements.articleSearch.addEventListener('input', () => {
          elements.clearSearch.style.display = elements.articleSearch.value ? 'block' : 'none';
        });
      }
    }
    
    // Category filter buttons
    document.addEventListener('click', (e) => {
      const filterBtn = e.target.closest('.filter-btn[data-filter]');
      if (filterBtn) {
        e.preventDefault();
        const category = filterBtn.dataset.filter;
        
        if (category === 'all') {
          // Clear all category filters
          state.filters.categories.clear();
          utils.$$('.filter-btn[data-filter]').forEach(btn => {
            btn.classList.remove('active');
          });
        } else {
          filterBtn.classList.toggle('active');
          if (filterBtn.classList.contains('active')) {
            state.filters.categories.add(category);
          } else {
            state.filters.categories.delete(category);
          }
        }
        
        applyFilters();
      }
    });
    
    // Tag cloud buttons
    document.addEventListener('click', (e) => {
      const tagBtn = e.target.closest('.tag-cloud-btn');
      if (tagBtn) {
        e.preventDefault();
        const tag = tagBtn.dataset.tag;
        
        tagBtn.classList.toggle('active');
        if (tagBtn.classList.contains('active')) {
          state.filters.tags.add(tag);
        } else {
          state.filters.tags.delete(tag);
        }
        
        applyFilters();
      }
    });
    
    // Reading time slider
    if (elements.readingTimeSlider && elements.readingTimeValue) {
      elements.readingTimeSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        state.filters.maxReadingTime = value;
        elements.readingTimeValue.textContent = `${value} min or less`;
        applyFilters();
      });
    }
    
    // Date range buttons
    utils.$$('.date-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        utils.$$('.date-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.filters.dateRange = parseInt(btn.dataset.days);
        applyFilters();
      });
    });
    
    // Sort select
    if (elements.sortSelect) {
      elements.sortSelect.addEventListener('change', (e) => {
        state.filters.sortBy = e.target.value;
        applyFilters();
      });
    }
    
    // Toggle advanced filters
    if (elements.toggleFilters && elements.advancedFilters) {
      elements.toggleFilters.addEventListener('click', () => {
        const isHidden = elements.advancedFilters.style.display === 'none';
        elements.advancedFilters.style.display = isHidden ? 'block' : 'none';
        elements.toggleFilters.innerHTML = isHidden ? 
          '<i class="fas fa-times"></i> Hide Filters' : 
          '<i class="fas fa-filter"></i> More Filters';
      });
      
      // Initially hide advanced filters
      elements.advancedFilters.style.display = 'none';
    }
    
    // Reset filters buttons
    const resetHandlers = [elements.resetFiltersBtn, elements.clearAllFilters];
    resetHandlers.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', resetAllFilters);
      }
    });
    
    // Load more button
    if (elements.loadMoreBtn) {
      elements.loadMoreBtn.addEventListener('click', () => {
        state.displayedCount += 5;
        renderArticles();
      });
    }
    
    // Pagination buttons
    if (elements.pagination) {
      elements.pagination.addEventListener('click', (e) => {
        const pageBtn = e.target.closest('.page-btn');
        if (pageBtn && !pageBtn.classList.contains('active')) {
          const pageNum = parseInt(pageBtn.textContent);
          state.currentPage = pageNum;
          state.displayedCount = pageNum * 5;
          renderArticles();
        }
      });
    }
    
    // Like/Bookmark buttons (event delegation)
    document.addEventListener('click', (e) => {
      const likeBtn = e.target.closest('.like-btn');
      if (likeBtn) {
        e.preventDefault();
        const articleCard = likeBtn.closest('.article-card');
        const articleId = articleCard?.dataset.id || 'unknown';
        
        state.likes[articleId] = !state.likes[articleId];
        likeBtn.classList.toggle('active');
        likeBtn.querySelector('i').className = state.likes[articleId] ? 'fas fa-heart' : 'far fa-heart';
        
        // Update like count in UI
        const likeCount = utils.$('.stat:nth-child(3)', articleCard);
        if (likeCount) {
          const currentLikes = parseInt(likeCount.textContent) || 0;
          likeCount.textContent = state.likes[articleId] ? currentLikes + 1 : Math.max(0, currentLikes - 1);
        }
        
        utils.saveToStorage('articleLikes', state.likes);
      }
      
      const bookmarkBtn = e.target.closest('.bookmark-btn');
      if (bookmarkBtn) {
        e.preventDefault();
        const articleCard = bookmarkBtn.closest('.article-card');
        const articleId = articleCard?.dataset.id || 'unknown';
        
        state.bookmarks[articleId] = !state.bookmarks[articleId];
        bookmarkBtn.classList.toggle('active');
        bookmarkBtn.querySelector('i').className = state.bookmarks[articleId] ? 'fas fa-bookmark' : 'far fa-bookmark';
        
        utils.saveToStorage('articleBookmarks', state.bookmarks);
      }
    });
    
    // Community section interactions
    if (elements.communitySection) {
      elements.communitySection.addEventListener('click', (e) => {
        const communityLink = e.target.closest('.community-link');
        if (communityLink) {
          e.preventDefault();
          // In a real app, this would navigate to the community page
          // For now, just show an alert
          alert('Community feature coming soon! This would navigate to the community page.');
        }
      });
    }
  }

  function saveRecentSearch(searchTerm) {
    if (!searchTerm.trim()) return;
    
    // Remove if already exists
    const index = state.recentSearches.indexOf(searchTerm);
    if (index > -1) {
      state.recentSearches.splice(index, 1);
    }
    
    // Add to beginning
    state.recentSearches.unshift(searchTerm);
    
    // Keep only last 5 searches
    if (state.recentSearches.length > 5) {
      state.recentSearches.pop();
    }
    
    utils.saveToStorage('recentSearches', state.recentSearches);
  }

  function applyFilters() {
    filterArticles();
    renderArticles();
    updateActiveFilters();
    updateStats();
  }

  function resetAllFilters() {
    // Reset filter state
    state.filters = {
      search: '',
      categories: new Set(),
      tags: new Set(),
      maxReadingTime: 30,
      dateRange: 0,
      sortBy: 'newest'
    };
    
    // Reset UI
    if (elements.articleSearch) {
      elements.articleSearch.value = '';
    }
    
    if (elements.clearSearch) {
      elements.clearSearch.style.display = 'none';
    }
    
    if (elements.readingTimeSlider && elements.readingTimeValue) {
      elements.readingTimeSlider.value = 30;
      elements.readingTimeValue.textContent = '30 min or less';
    }
    
    if (elements.sortSelect) {
      elements.sortSelect.value = 'newest';
    }
    
    // Reset all active buttons
    utils.$$('.filter-btn.active, .tag-cloud-btn.active').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Set "All" filter as active
    const allFilter = utils.$('.filter-btn[data-filter="all"]');
    if (allFilter) {
      allFilter.classList.add('active');
    }
    
    // Reset date buttons
    utils.$$('.date-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.days === '0');
    });
    
    // Hide advanced filters
    if (elements.advancedFilters) {
      elements.advancedFilters.style.display = 'none';
    }
    
    if (elements.toggleFilters) {
      elements.toggleFilters.innerHTML = '<i class="fas fa-filter"></i> More Filters';
    }
    
    // Reset pagination
    state.displayedCount = 5;
    state.currentPage = 1;
    
    // Apply changes
    applyFilters();
  }

  // ================== INITIALIZATION ==================
  function initialize() {
    // Show loading state
    if (elements.loadingState) {
      elements.loadingState.style.display = 'block';
    }
    
    // Extract articles from DOM
    state.articles = extractArticleData();
    state.filteredArticles = [...state.articles];
    
    // Initialize UI
    initializeFilterUI();
    setupEventListeners();
    applyFilters();
    
    // Hide loading state
    if (elements.loadingState) {
      elements.loadingState.style.display = 'none';
    }
    
    // Initialize theme toggle if exists
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        utils.saveToStorage('theme', newTheme);
      });
      
      // Load saved theme
      const savedTheme = utils.loadFromStorage('theme') || 'light';
      document.body.setAttribute('data-theme', savedTheme);
    }
    
    console.log('Articles page initialized successfully!');
    console.log(`Loaded ${state.articles.length} articles`);
  }

  // ================== START EVERYTHING ==================
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // Expose some functions for debugging if needed
  window.articlesApp = {
    state,
    applyFilters,
    resetAllFilters,
    utils
  };

})();