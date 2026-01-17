/**
 * search.js - Enhanced search functionality
 * Handles search overlay, suggestions, and keyboard shortcuts
 */

const searchOverlay = document.querySelector(".search-overlay");
const searchContainer = document.querySelector(".search-container");
const searchInput = document.querySelector(".search-input");

if (searchInput) {
  searchInput.addEventListener("input", handleSearch);
  searchInput.addEventListener("focus", () => {
    if (searchOverlay) {
      searchOverlay.style.display = "block";
      searchInput.setAttribute("aria-expanded", "true");
    }
  });
}

function handleSearch(e) {
  const query = e.target.value.toLowerCase();
  const suggestions = document.querySelector(".search-suggestions");

  if (!suggestions) return;

  if (query.length < 2) {
    suggestions.innerHTML = `
            <div class="suggestion-category">
                <h4>Popular Searches</h4>
                <a href="articles.html?search=react">React Tutorial</a>
                <a href="articles.html?search=python">Python Ethiopia</a>
                <a href="articles.html?search=addis">Addis Ababa Tech</a>
                <a href="articles.html?search=ai">AI & Machine Learning</a>
                <a href="articles.html?search=mobile">Mobile Development</a>
            </div>
        `;
    return;
  }

  const results = filterArticles(query);
  suggestions.innerHTML = formatResults(results, query);
}

function filterArticles(query) {
  // This would normally search through actual articles
  // For now, return sample results
  const allArticles = [
    {
      title: "React Tutorial for Beginners",
      url: "post.html?id=1",
      category: "Web Dev",
    },
    {
      title: "Python Data Analysis in Ethiopia",
      url: "post.html?id=2",
      category: "Data Science",
    },
    {
      title: "Mobile Apps in Addis Ababa",
      url: "post.html?id=3",
      category: "Mobile",
    },
    { title: "Ethiopian AI Projects", url: "post.html?id=4", category: "AI" },
    {
      title: "Node.js Backend Development",
      url: "post.html?id=5",
      category: "Web Dev",
    },
    {
      title: "Flutter for Ethiopian Developers",
      url: "post.html?id=6",
      category: "Mobile",
    },
  ];

  return allArticles.filter(
    (item) =>
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
            <h4>Search Results (${results.length})</h4>
            ${results
              .map(
                (item) =>
                  `<a href="${item.url}">${item.title} - ${item.category}</a>`
              )
              .join("")}
        </div>
    `;
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && searchOverlay?.style.display === "block") {
    searchOverlay.style.display = "none";
    if (searchInput) {
      searchInput.value = "";
      searchInput.setAttribute("aria-expanded", "false");
    }
  }

  if (e.ctrlKey && e.key === "k") {
    e.preventDefault();
    if (searchOverlay && searchInput) {
      searchOverlay.style.display = "block";
      searchInput.focus();
      searchInput.setAttribute("aria-expanded", "true");
    }
  }
});

// Close overlay when clicking outside
document.addEventListener("click", (e) => {
  if (searchOverlay && searchContainer && searchInput) {
    if (
      !e.target.closest(".search-container") &&
      !e.target.closest(".search-input") &&
      !e.target.closest(".search-overlay")
    ) {
      searchOverlay.style.display = "none";
      searchInput.setAttribute("aria-expanded", "false");
    }
  }
});
