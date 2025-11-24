// script.js

const API_KEY = 'AIzaSyATsLGEVgG9CJo3MAcOEWVKyopeotdrSMM'; 
const BLOG_ID = '7861965689847370736?hl=en-GB'; // The long number/string for your blog
const POSTS_URL = `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts?key=${API_KEY}`;
const container = document.getElementById('posts-container');

async function fetchBlogPosts() {
    try {
        const response = await fetch(POSTS_URL);
        const data = await response.json();

        if (data.error) {
            container.innerHTML = `<h2>Error:</h2><p>${data.error.message}</p>`;
            console.error('API Error:', data.error);
            return;
        }

        if (data.items && data.items.length > 0) {
            let htmlContent = '';
            data.items.forEach(post => {
                // Display the post title and a snippet of content
                htmlContent += `
                    <div class="post">
                        <h2><a href="${post.url}" target="_blank">${post.title}</a></h2>
                        <div class="post-content">${post.content.substring(0, 200)}...</div>
                        <p class="post-date">Published: ${new Date(post.published).toLocaleDateString()}</p>
                        <hr>
                    </div>
                `;
            });
            container.innerHTML = htmlContent;
        } else {
            container.innerHTML = '<p>No posts found or API key is restricted.</p>';
        }

    } catch (error) {
        container.innerHTML = `<h2>Failed to fetch posts!</h2><p>Check your internet connection or API URL.</p>`;
        console.error('Fetch Error:', error);
    }
}

fetchBlogPosts();
