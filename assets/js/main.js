document.addEventListener('DOMContentLoaded', () => {
    initSearch();
    initProfileMenu();
    initDropdowns();
});

function initSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;
    
    searchInput.addEventListener('focus', () => {
        document.querySelector('.search-overlay').style.display = 'block';
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            document.querySelector('.search-overlay').style.display = 'none';
        }
    });
    
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            window.location.href = `articles.html?search=${encodeURIComponent(searchInput.value)}`;
        }
    });
}

function initProfileMenu() {
    const profileBtn = document.querySelector('.profile-btn');
    const profileMenu = document.querySelector('.profile-menu');
    
    if (!profileBtn || !profileMenu) return;
    
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileMenu.classList.toggle('show');
    });
    
    document.addEventListener('click', () => {
        profileMenu.classList.remove('show');
    });
}

function initDropdowns() {
    const dropdowns = document.querySelectorAll('.nav-dropdown, .dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.nav-item');
        const menu = dropdown.querySelector('.dropdown-content, .dropdown-menu');
        
        if (!toggle || !menu) return;
        
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            dropdowns.forEach(other => {
                if (other !== dropdown) {
                    other.querySelector('.dropdown-content, .dropdown-menu')?.classList.remove('show');
                }
            });
            
            menu.classList.toggle('show');
        });
    });
    
    document.addEventListener('click', () => {
        dropdowns.forEach(dropdown => {
            dropdown.querySelector('.dropdown-content, .dropdown-menu')?.classList.remove('show');
        });
    });
}
