/* articles.js - Enhanced Articles Management */
import { debounce, escapeHtml, formatDate, formatReadingTime } from './utils.js';

class ArticlesManager {
  constructor() {
    this.articles = [];
    this.filteredArticles = [];
    this.filters = {
      search: '',
      categories: new Set(),
      tags: new Set(),
      maxReadingTime: 30,
      dateRange: 0, // days, 0 = all time
      sortBy: 'newest'
    };
    
    this.selectors = {
      container: '#articles-container',
      articleCount: '#articleCount',
      resultsCount: '#resultsCount',
      resultsTitle: '#resultsTitle',
      searchInput: '#articleSearch',
      categoryFilters: '#categoryFilters',
      tagsCloud: '#tagsCloud',
      readingTimeSlider: '#readingTimeSlider',
      readingTimeValue: '#readingTimeValue',
      sortSelect: '#sortSelect',
      activeFilters: '#activeFilters',
      activeFiltersList: '#activeFiltersList',
      clearAllFilters: '#clearAllFilters',
      toggleAdvancedFilters: '#toggleAdvancedFilters',
      advancedFilters: '#advancedFilters',
      closeAdvancedFilters: '#closeAdvancedFilters',
      resetFilters: '#resetFilters',
      resetFiltersBtn: '#resetFiltersBtn',
      emptyState: '#emptyState',
      loadingState: '#loadingState',
      loadMore: '#loadMore'
    };
    
    this.elements = {};
    this.articlesPerPage = 6;
    this.currentPage = 1;
    
    this.init();
  }
  
  async init() {
    this.cacheElements();
    await this.loadArticles();
    this.renderCategories();
    this.renderTags();
    this.setupEventListeners();
    this.applyFilters();
    this.updateStats();
  }
  
  cacheElements() {
    for (const [key, selector] of Object.entries(this.selectors)) {
      this.elements[key] = document.querySelector(selector);
    }
  }
  
  async loadArticles() {
    // Show loading state
    if (this.elements.loadingState) {
      this.elements.loadingState.hidden = false;
    }
    
    try {
      // Try to load from external data file first
      if (typeof window.articlesData !== 'undefined') {
        this.articles = window.articlesData;
      } else {
        // Fallback: Extract articles from DOM or fetch from API
        this.articles = await this.extractArticlesFromDOM();
      }
      
      // If no articles found, create sample data
      if (!this.articles.length) {
        this.articles = this.generateSampleArticles();
      }
      
      this.filteredArticles = [...this.articles];
      
    } catch (error) {
      console.error('Error loading articles:', error);
      this.articles = this.generateSampleArticles();
      this.filteredArticles = [...this.articles];
    } finally {
      // Hide loading state
      if (this.elements.loadingState) {
        this.elements.loadingState.hidden = true;
      }
    }
  }
  
  async extractArticlesFromDOM() {
    return new Promise((resolve) => {
      // Check if there are existing article cards in the DOM
      const articleCards = document.querySelectorAll('.article-card');
      
      if (articleCards.length > 0) {
        const articles = Array.from(articleCards).map(card => ({
          id: card.dataset.id || Math.random().toString(36).substr(2, 9),
          title: card.querySelector('.card-title')?.textContent?.trim() || 'Untitled Article',
          excerpt: card.querySelector('.excerpt')?.textContent?.trim() || '',
          category: card.querySelector('.category')?.textContent?.trim() || 'Uncategorized',
          tags: Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.trim()),
          readingTime: parseInt(card.querySelector('.reading-time')?.textContent?.match(/\d+/)?.[0] || 5),
          views: parseInt(card.querySelector('.views')?.textContent?.match(/\d+/)?.[0] || 0),
          likes: parseInt(card.querySelector('.like-count')?.textContent || 0),
          date: card.querySelector('.date')?.textContent?.trim() || new Date().toISOString().split('T')[0],
          author: {
            name: card.querySelector('.author .name')?.textContent?.trim() || 'Anonymous',
            avatar: card.querySelector('.author-avatar')?.textContent?.trim() || 'A'
          },
          image: card.querySelector('.card-media img')?.src || 'assets/images/articles/default.jpg'
        }));
        resolve(articles);
      } else {
        resolve([]);
      }
    });
  }
  
  generateSampleArticles() {
    return [
      {
        id: '1',
        title: 'Building Accessible, Performant Web Apps',
        excerpt: 'Practical tips for low-bandwidth environments: optimize images, reduce JS, and prefer progressive enhancement.',
        category: 'Web Development',
        tags: ['javascript', 'performance', 'accessibility'],
        readingTime: 6,
        views: 1200,
        likes: 42,
        date: '2025-11-10',
        author: { name: 'Akila Kibrom', avatar: 'AK' },
        image: 'assets/images/articles/web.jpg'
      },
      {
        id: '2',
        title: 'Intro to Machine Learning with Local Datasets',
        excerpt: 'How to prepare and use local datasets for ML projects when connectivity and compute are limited.',
        category: 'Data & AI',
        tags: ['python', 'ml', 'datasets'],
        readingTime: 8,
        views: 860,
        likes: 31,
        date: '2025-10-28',
        author: { name: 'Tilahun Shiferaw', avatar: 'TS' },
        image: 'assets/images/articles/Ai.jpg'
      },
      {
        id: '3',
        title: 'Cross-platform Mobile Apps: Flutter Tips',
        excerpt: 'Best practices when building Flutter apps for low-end Android devices popular in Ethiopia.',
        category: 'Mobile',
        tags: ['flutter', 'mobile', 'android'],
        readingTime: 7,
        views: 940,
        likes: 28,
        date: '2025-09-14',
        author: { name: 'Robel Mesfin', avatar: 'RM' },
        image: 'assets/images/articles/Mobile.jpg'
      },
      {
        id: '4',
        title: 'CI/CD for Small Teams',
        excerpt: 'Practical GitHub Actions pipelines tailored for Ethiopian startups and student projects.',
        category: 'DevOps',
        tags: ['github-actions', 'ci-cd', 'devops'],
        readingTime: 5,
        views: 520,
        likes: 19,
        date: '2025-08-02',
        author: { name: 'Hanan Negash', avatar: 'HN' },
        image: 'assets/images/articles/devops.jpg'
      },
      {
        id: '5',
        title: 'Visualizing Local Data with D3',
        excerpt: 'Create lightweight interactive charts that work well on low bandwidth.',
        category: 'Data',
        tags: ['d3', 'visualization', 'data'],
        readingTime: 9,
        views: 760,
        likes: 24,
        date: '2025-07-21',
        author: { name: 'Yigba Nibret', avatar: 'YN' },
        image: 'assets/images/articles/datas.jpg'
      }
    ];
  }
  
  renderCategories() {
    if (!this.elements.categoryFilters) return;
    
    const categories = [...new Set(this.articles.map(article => article.category))];
    
    this.elements.categoryFilters.innerHTML = categories.map(category => {
      const count = this.articles.filter(a => a.category === category).length;
      return `
        <button class="category-btn" data-category="${escapeHtml(category)}">
          ${escapeHtml(category)}
          <span class="count">${count}</span>
        </button>
      `;
    }).join('');
  }
  
  renderTags() {
    if (!this.elements.tagsCloud) return;
    
    const allTags = [...new Set(this.articles.flatMap(article => article.tags))];
    
    this.elements.tagsCloud.innerHTML = allTags.map(tag => {
      const count = this.articles.filter(a => a.tags.includes(tag)).length;
      return `
        <button class="tag-cloud-btn" data-tag="${escapeHtml(tag)}">
          ${escapeHtml(tag)} <small>(${count})</small>
        </button>
      `;
    }).join('');
  }
  
  setupEventListeners() {
    // Search with debounce
    if (this.elements.searchInput) {
      const handleSearch = debounce(() => {
        this.filters.search = this.elements.searchInput.value.trim();
        this.applyFilters();
      }, 300);
      
      this.elements.searchInput.addEventListener('input', handleSearch);
    }
    
    // Category filters
    if (this.elements.categoryFilters) {
      this.elements.categoryFilters.addEventListener('click', (e) => {
        const btn = e.target.closest('.category-btn');
        if (!btn) return;
        
        const category = btn.dataset.category;
        btn.classList.toggle('active');
        
        if (btn.classList.contains('active')) {
          this.filters.categories.add(category);
        } else {
          this.filters.categories.delete(category);
        }
        
        this.applyFilters();
      });
    }
    
    // Tag filters
    if (this.elements.tagsCloud) {
      this.elements.tagsCloud.addEventListener('click', (e) => {
        const btn = e.target.closest('.tag-cloud-btn');
        if (!btn) return;
        
        const tag = btn.dataset.tag;
        btn.classList.toggle('active');
        
        if (btn.classList.contains('active')) {
          this.filters.tags.add(tag);
        } else {
          this.filters.tags.delete(tag);
        }
        
        this.applyFilters();
      });
    }
    
    // Reading time slider
    if (this.elements.readingTimeSlider && this.elements.readingTimeValue) {
      this.elements.readingTimeSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        this.elements.readingTimeValue.textContent = value;
        this.filters.maxReadingTime = parseInt(value, 10);
        this.applyFilters();
      });
    }
    
    // Date range buttons
    document.querySelectorAll('.date-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filters.dateRange = parseInt(btn.dataset.days, 10);
        this.applyFilters();
      });
    });
    
    // Sort select
    if (this.elements.sortSelect) {
      this.elements.sortSelect.addEventListener('change', (e) => {
        this.filters.sortBy = e.target.value;
        this.applyFilters();
      });
    }
    
    // Advanced filters toggle
    if (this.elements.toggleAdvancedFilters) {
      this.elements.toggleAdvancedFilters.addEventListener('click', () => {
        const isHidden = this.elements.advancedFilters.hidden;
        this.elements.advancedFilters.hidden = !isHidden;
        this.elements.toggleAdvancedFilters.innerHTML = isHidden ?
          '<i class="fas fa-times"></i> Hide Advanced Filters' :
          '<i class="fas fa-sliders-h"></i> Advanced Filters';
      });
    }
    
    // Close advanced filters
    if (this.elements.closeAdvancedFilters) {
      this.elements.closeAdvancedFilters.addEventListener('click', () => {
        this.elements.advancedFilters.hidden = true;
        this.elements.toggleAdvancedFilters.innerHTML = '<i class="fas fa-sliders-h"></i> Advanced Filters';
      });
    }
    
    // Reset filters
    const resetHandler = () => {
      this.resetFilters();
      this.applyFilters();
    };
    
    if (this.elements.resetFilters) {
      this.elements.resetFilters.addEventListener('click', resetHandler);
    }
    
    if (this.elements.resetFiltersBtn) {
      this.elements.resetFiltersBtn.addEventListener('click', resetHandler);
    }
    
    if (this.elements.clearAllFilters) {
      this.elements.clearAllFilters.addEventListener('click', resetHandler);
    }
    
    // Load more
    if (this.elements.loadMore) {
      this.elements.loadMore.addEventListener('click', () => {
        this.currentPage++;
        this.renderArticles();
        this.updateLoadMoreButton();
      });
    }
  }
  
  applyFilters() {
    this.filteredArticles = this.articles.filter(article => {
      // Search filter
      if (this.filters.search) {
        const searchLower = this.filters.search.toLowerCase();
        const inTitle = article.title.toLowerCase().includes(searchLower);
        const inExcerpt = article.excerpt.toLowerCase().includes(searchLower);
        const inAuthor = article.author.name.toLowerCase().includes(searchLower);
        const inTags = article.tags.some(tag => tag.toLowerCase().includes(searchLower));
        if (!(inTitle || inExcerpt || inAuthor || inTags)) return false;
      }
      
      // Category filter
      if (this.filters.categories.size > 0 && !this.filters.categories.has(article.category)) {
        return false;
      }
      
      // Tag filter
      if (this.filters.tags.size > 0) {
        const hasAllTags = Array.from(this.filters.tags).every(tag => 
          article.tags.includes(tag)
        );
        if (!hasAllTags) return false;
      }
      
      // Reading time filter
      if (article.readingTime > this.filters.maxReadingTime) {
        return false;
      }
      
      // Date range filter
      if (this.filters.dateRange > 0) {
        const articleDate = new Date(article.date);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.filters.dateRange);
        
        if (articleDate < cutoffDate) {
          return false;
        }
      }
      
      return true;
    });
    
    // Apply sorting
    this.sortArticles();
    
    // Reset to first page
    this.currentPage = 1;
    
    // Update UI
    this.renderArticles();
    this.updateActiveFilters();
    this.updateStats();
    this.updateLoadMoreButton();
  }
  
  sortArticles() {
    switch (this.filters.sortBy) {
      case 'newest':
        this.filteredArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'oldest':
        this.filteredArticles.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'popular':
        this.filteredArticles.sort((a, b) => b.views - a.views);
        break;
      case 'reading':
        this.filteredArticles.sort((a, b) => a.readingTime - b.readingTime);
        break;
    }
  }
  
  renderArticles() {
    if (!this.elements.container) return;
    
    const startIndex = (this.currentPage - 1) * this.articlesPerPage;
    const endIndex = startIndex + this.articlesPerPage;
    const articlesToShow = this.filteredArticles.slice(0, endIndex);
    
    if (articlesToShow.length === 0) {
      this.elements.container.innerHTML = '';
      if (this.elements.emptyState) {
        this.elements.emptyState.hidden = false;
      }
      return;
    }
    
    if (this.elements.emptyState) {
      this.elements.emptyState.hidden = true;
    }
    
    const articlesHTML = articlesToShow.map(article => this.renderArticleCard(article)).join('');
    this.elements.container.innerHTML = articlesHTML;
    
    // Add animation classes
    setTimeout(() => {
      document.querySelectorAll('.article-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.05}s`;
      });
    }, 10);
  }
  
  renderArticleCard(article) {
    const date = new Date(article.date);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    return `
      <article class="article-card" data-id="${article.id}" data-category="${escapeHtml(article.category)}">
        <div class="card-media">
          <img src="${article.image}" alt="${escapeHtml(article.title)}" loading="lazy" />
          <span class="card-badge">${escapeHtml(article.category)}</span>
        </div>
        
        <div class="card-body">
          <div class="card-meta">
            <span class="card-category">${escapeHtml(article.category)}</span>
            <span class="card-date">
              <i class="far fa-calendar"></i> ${formattedDate}
            </span>
          </div>
          
          <h3 class="card-title">
            <a href="post.html?id=${article.id}" aria-label="Read ${escapeHtml(article.title)}">
              ${escapeHtml(article.title)}
            </a>
          </h3>
          
          <p class="card-excerpt">${escapeHtml(article.excerpt)}</p>
          
          <div class="card-tags">
            ${article.tags.map(tag => `
              <span class="tag">${escapeHtml(tag)}</span>
            `).join('')}
          </div>
          
          <div class="card-footer">
            <div class="card-author">
              <div class="author-avatar" aria-label="${escapeHtml(article.author.name)}">
                ${article.author.avatar}
              </div>
              <div class="author-info">
                <span class="author-name">${escapeHtml(article.author.name)}</span>
                <span class="author-role">Author</span>
              </div>
            </div>
            
            <div class="card-stats">
              <span class="card-stat" title="Reading time">
                <i class="far fa-clock"></i> ${article.readingTime} min
              </span>
              <span class="card-stat" title="Views">
                <i class="far fa-eye"></i> ${article.views.toLocaleString()}
              </span>
            </div>
            
            <div class="card-actions">
              <button class="action-btn like-btn" aria-label="Like article" data-article-id="${article.id}">
                <i class="far fa-heart"></i>
              </button>
              <button class="action-btn bookmark-btn" aria-label="Bookmark article" data-article-id="${article.id}">
                <i class="far fa-bookmark"></i>
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }
  
  updateActiveFilters() {
    if (!this.elements.activeFilters || !this.elements.activeFiltersList) return;
    
    const activeFilters = [];
    
    // Search filter
    if (this.filters.search) {
      activeFilters.push({
        type: 'search',
        label: `Search: "${this.filters.search}"`,
        clear: () => {
          this.filters.search = '';
          if (this.elements.searchInput) {
            this.elements.searchInput.value = '';
          }
        }
      });
    }
    
    // Category filters
    this.filters.categories.forEach(category => {
      activeFilters.push({
        type: 'category',
        label: `Category: ${category}`,
        clear: () => {
          this.filters.categories.delete(category);
          const btn = document.querySelector(`.category-btn[data-category="${category}"]`);
          if (btn) btn.classList.remove('active');
        }
      });
    });
    
    // Tag filters
    this.filters.tags.forEach(tag => {
      activeFilters.push({
        type: 'tag',
        label: `Tag: ${tag}`,
        clear: () => {
          this.filters.tags.delete(tag);
          const btn = document.querySelector(`.tag-cloud-btn[data-tag="${tag}"]`);
          if (btn) btn.classList.remove('active');
        }
      });
    });
    
    // Reading time filter
    if (this.filters.maxReadingTime < 30) {
      activeFilters.push({
        type: 'reading',
        label: `Max ${this.filters.maxReadingTime} min read`,
        clear: () => {
          this.filters.maxReadingTime = 30;
          if (this.elements.readingTimeSlider && this.elements.readingTimeValue) {
            this.elements.readingTimeSlider.value = 30;
            this.elements.readingTimeValue.textContent = '30';
          }
        }
      });
    }
    
    // Date range filter
    if (this.filters.dateRange > 0) {
      const labels = {
        7: 'Last week',
        30: 'Last month',
        90: 'Last 3 months',
        365: 'Last year'
      };
      
      activeFilters.push({
        type: 'date',
        label: labels[this.filters.dateRange] || `${this.filters.dateRange} days`,
        clear: () => {
          this.filters.dateRange = 0;
          document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
          document.querySelector('.date-btn[data-days="0"]')?.classList.add('active');
        }
      });
    }
    
    // Render active filters
    if (activeFilters.length > 0) {
      this.elements.activeFilters.hidden = false;
      this.elements.activeFiltersList.innerHTML = activeFilters.map(filter => `
        <span class="active-filter-tag">
          ${filter.label}
          <button type="button" aria-label="Remove ${filter.type} filter" onclick="(${filter.clear.toString()})()">
            <i class="fas fa-times"></i>
          </button>
        </span>
      `).join('');
    } else {
      this.elements.activeFilters.hidden = true;
    }
  }
  
  updateStats() {
    // Update article count
    if (this.elements.articleCount) {
      this.elements.articleCount.textContent = this.articles.length;
    }
    
    // Update results count
    if (this.elements.resultsCount) {
      this.elements.resultsCount.textContent = this.filteredArticles.length;
    }
    
    // Update results title
    if (this.elements.resultsTitle) {
      if (this.filters.search) {
        this.elements.resultsTitle.textContent = `Search Results for "${this.filters.search}"`;
      } else if (this.filters.categories.size > 0) {
        const categories = Array.from(this.filters.categories).join(', ');
        this.elements.resultsTitle.textContent = `${categories} Articles`;
      } else if (this.filters.tags.size > 0) {
        const tags = Array.from(this.filters.tags).join(', ');
        this.elements.resultsTitle.textContent = `Articles tagged "${tags}"`;
      } else {
        this.elements.resultsTitle.textContent = 'Latest Articles';
      }
    }
  }
  
  updateLoadMoreButton() {
    if (!this.elements.loadMore) return;
    
    const totalArticles = this.filteredArticles.length;
    const displayedArticles = Math.min(
      this.currentPage * this.articlesPerPage,
      totalArticles
    );
    
    if (displayedArticles < totalArticles) {
      this.elements.loadMore.style.display = 'block';
      this.elements.loadMore.innerHTML = `
        <i class="fas fa-arrow-down"></i> 
        Load More (${displayedArticles} of ${totalArticles})
      `;
    } else {
      this.elements.loadMore.style.display = 'none';
    }
  }
  
  resetFilters() {
    // Reset filter state
    this.filters = {
      search: '',
      categories: new Set(),
      tags: new Set(),
      maxReadingTime: 30,
      dateRange: 0,
      sortBy: 'newest'
    };
    
    // Reset UI elements
    if (this.elements.searchInput) {
      this.elements.searchInput.value = '';
    }
    
    if (this.elements.readingTimeSlider && this.elements.readingTimeValue) {
      this.elements.readingTimeSlider.value = 30;
      this.elements.readingTimeValue.textContent = '30';
    }
    
    if (this.elements.sortSelect) {
      this.elements.sortSelect.value = 'newest';
    }
    
    // Reset active classes
    document.querySelectorAll('.category-btn.active, .tag-cloud-btn.active').forEach(el => {
      el.classList.remove('active');
    });
    
    document.querySelectorAll('.date-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.days === '0');
    });
    
    // Hide advanced filters
    if (this.elements.advancedFilters) {
      this.elements.advancedFilters.hidden = true;
    }
    
    if (this.elements.toggleAdvancedFilters) {
      this.elements.toggleAdvancedFilters.innerHTML = '<i class="fas fa-sliders-h"></i> Advanced Filters';
    }
    
    // Hide active filters display
    if (this.elements.activeFilters) {
      this.elements.activeFilters.hidden = true;
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize on articles page
  if (document.querySelector('body[data-page="articles"]') || 
      window.location.pathname.includes('articles.html') ||
      document.querySelector('#articles-container')) {
    
    // Add utility functions if not already defined
    if (typeof debounce === 'undefined') {
      window.debounce = (fn, wait = 300) => {
        let timeout;
        return function(...args) {
          clearTimeout(timeout);
          timeout = setTimeout(() => fn.apply(this, args), wait);
        };
      };
    }
    
    if (typeof escapeHtml === 'undefined') {
      window.escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };
    }
    
    // Initialize articles manager
    window.articlesManager = new ArticlesManager();
    
    // Add click handlers for like/bookmark buttons (delegated)
    document.addEventListener('click', (e) => {
      if (e.target.closest('.like-btn')) {
        const btn = e.target.closest('.like-btn');
        const articleId = btn.dataset.articleId;
        btn.classList.toggle('active');
        btn.querySelector('i').classList.toggle('far');
        btn.querySelector('i').classList.toggle('fas');
        
        // In a real app, you would send this to your backend
        console.log(`Toggled like for article ${articleId}`);
      }
      
      if (e.target.closest('.bookmark-btn')) {
        const btn = e.target.closest('.bookmark-btn');
        const articleId = btn.dataset.articleId;
        btn.classList.toggle('active');
        btn.querySelector('i').classList.toggle('far');
        btn.querySelector('i').classList.toggle('fas');
        
        // In a real app, you would send this to your backend
        console.log(`Toggled bookmark for article ${articleId}`);
      }
    });
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ArticlesManager;
}