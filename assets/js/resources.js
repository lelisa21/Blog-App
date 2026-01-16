// TechBlog Ethiopia - Resources Page JavaScript
// Cyberpunk Ethiopia Theme

document.addEventListener('DOMContentLoaded', () => {
  // ===== THEME TOGGLE SYSTEM =====
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  
  // Initialize theme from localStorage or system preference
  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    html.setAttribute('data-theme', initialTheme);
    updateThemeIcon(initialTheme);
  };
  
  // Update theme icon and label
  const updateThemeIcon = (theme) => {
    if (!themeToggle) return;
    
    const isDark = theme === 'dark';
    themeToggle.innerHTML = isDark ? `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="5"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
    ` : `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    `;
    themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
  };
  
  // Theme toggle handler
  const handleThemeToggle = () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    
    // Smooth transition effect
    document.body.style.transition = 'background-color 0.3s ease';
  };
  
  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      const newTheme = e.matches ? 'dark' : 'light';
      html.setAttribute('data-theme', newTheme);
      updateThemeIcon(newTheme);
    }
  });
  
  // Initialize theme toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', handleThemeToggle);
    initializeTheme();
  }
  
  // ===== SCROLL ANIMATIONS =====
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        
        // Staggered animation for list items
        const listItems = entry.target.querySelectorAll('li');
        listItems.forEach((li, index) => {
          setTimeout(() => {
            li.style.opacity = '1';
            li.style.transform = 'translateX(0)';
          }, index * 50);
        });
      }
    });
  }, observerOptions);
  
  // Animate cards on scroll
  document.querySelectorAll('.card').forEach((card, index) => {
    card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
  });
  
  // Prepare list items for animation
  document.querySelectorAll('.card li').forEach(li => {
    li.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    li.style.opacity = '0';
    li.style.transform = 'translateX(-10px)';
  });
  
  // ===== SMOOTH SCROLLING =====
  const smoothScrollTo = (targetId) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  // Handle anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        smoothScrollTo(href.substring(1));
      }
    });
  });
  
  // Enhanced skip link
  const skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      smoothScrollTo('main');
      document.getElementById('main').focus();
    });
  }
  
  // ===== ACCESSIBILITY =====
  // Keyboard navigation for cards
  document.querySelectorAll('.card').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const firstLink = card.querySelector('a');
        if (firstLink) firstLink.click();
      }
    });
  });
  
  // ===== PERFORMANCE & ERROR HANDLING =====
  // Broken image replacement
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      img.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="%2315152e"/><text x="50%" y="50%" font-family="Inter" font-size="16" fill="%237efff5" text-anchor="middle" dominant-baseline="middle">Image Not Available</text></svg>`;
    });
  });
  
  // Optional: Simple search functionality
  const addSearch = () => {
    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = `margin: 32px auto; text-align: center;`;
    searchContainer.innerHTML = `
      <input type="search" id="resourceSearch" placeholder="🔍 Search Ethiopian tech resources..." 
        style="width: 100%; max-width: 500px; padding: 12px 16px; border-radius: var(--radius-md); 
               border: 1px solid var(--color-border); background: var(--color-surface); 
               color: var(--color-text); font-family: var(--font-body);">
    `;
    
    const pageHeader = document.querySelector('.page-header');
    if (pageHeader) pageHeader.after(searchContainer);
    
    document.getElementById('resourceSearch')?.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      document.querySelectorAll('.card').forEach(card => {
        card.style.display = card.textContent.toLowerCase().includes(term) ? 'block' : 'none';
      });
    });
  };
  
  // Uncomment to enable search
  // addSearch();
  
  // Page load complete
  console.log('🇪🇹 TechBlog Ethiopia - Resources page ready');
});
