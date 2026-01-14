/**
 * data.js - Blogger API integration for fetching blog posts
 * Handles fetching and displaying posts from Google Blogger API
 */

const API_KEY = "AIzaSyATsLGEVgG9CJo3MAcOEWVKyopeotdrSMM";
const BLOG_ID = "7861965689847370736?hl=en-GB";
const POSTS_URL = `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts?key=${API_KEY}`;
const container = document.getElementById("posts-container");

/**
 * Fetch blog posts from Blogger API
 */
async function fetchBlogPosts() {
  if (!container) return;

  try {
    // Show loading state
    container.innerHTML = '<div class="loading">Loading posts...</div>';

    const response = await fetch(POSTS_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      container.innerHTML = `<h2>Error:</h2><p>${data.error.message}</p>`;
      console.error("API Error:", data.error);
      return;
    }

    if (data.items && data.items.length > 0) {
      let htmlContent = "";
      data.items.forEach((post) => {
        // Format date
        const publishedDate = new Date(post.published);
        const formattedDate = publishedDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        // Extract excerpt (remove HTML tags)
        const excerpt =
          post.content
            .replace(/<[^>]*>/g, "")
            .substring(0, 200)
            .trim() + "...";

        htmlContent += `
                    <div class="post">
                        <h2><a href="${post.url}" target="_blank">${post.title}</a></h2>
                        <div class="post-content">${excerpt}</div>
                        <p class="post-date">Published: ${formattedDate}</p>
                        <a href="${post.url}" target="_blank" class="read-more">Read more →</a>
                        <hr>
                    </div>
                `;
      });
      container.innerHTML = htmlContent;
    } else {
      container.innerHTML = "<p>No posts found or API key is restricted.</p>";
    }
  } catch (error) {
    container.innerHTML = `
            <h2>Failed to fetch posts!</h2>
            <p>Check your internet connection or API URL.</p>
            <p style="color: #999; font-size: 0.9em;">Error: ${error.message}</p>
        `;
    console.error("Fetch Error:", error);
  }
}

// Auto-fetch posts when DOM is ready
if (container) {
  document.addEventListener("DOMContentLoaded", fetchBlogPosts);
}

// Export for manual use
window.fetchBlogPosts = fetchBlogPosts;
