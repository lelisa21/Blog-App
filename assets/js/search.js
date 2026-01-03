const searchOverlay = document.querySelector('.search-overlay');
const searchContainer = document.querySelector('.search-container');
const searchInput = document.querySelector('.search-input');

if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const suggestions = document.querySelector('.search-suggestions');
    
    if (!suggestions) return;
    
    if (query.length < 2) {
        suggestions.innerHTML = `
            <div class="suggestion-category">
                <h4>Popular Searches</h4>
                <a href="articles.html?search=react">React Tutorial</a>
                <a href="articles.html?search=python">Python Ethiopia</a>
                <a href="articles.html?search=addis">Addis Ababa Tech</a>
            </div>
        `;
        return;
    }
    
    const results = filterArticles(query);
    suggestions.innerHTML = formatResults(results, query);
}

function filterArticles(query) {
    return [
        { title: 'React Tutorial for Beginners', url: 'post.html?id=1', category: 'Web Dev' },
        { title: 'Python Data Analysis in Ethiopia', url: 'post.html?id=2', category: 'Data Science' },
        { title: 'Mobile Apps in Addis Ababa', url: 'post.html?id=3', category: 'Mobile' },
        { title: 'Ethiopian AI Projects', url: 'post.html?id=4', category: 'AI' }
    ].filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.category.toLowerCase().includes(query)
    );
}

function formatResults(results, query) {
    if (results.length === 0) {
        return `<div class="no-results">No results found for "${query}"</div>`;
    }
    
    return `
        <div class="suggestion-category">
            <h4>Search Results</h4>
            ${results.map(item => 
                `<a href="${item.url}">${item.title} - ${item.category}</a>`
            ).join('')}
        </div>
    `;
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchOverlay?.style.display === 'block') {
        searchOverlay.style.display = 'none';
        searchInput.value = '';
    }
    
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        searchOverlay.style.display = 'block';
        searchInput.focus();
    }
});
