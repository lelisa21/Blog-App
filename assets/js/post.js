/**
 * post.js - Single blog post page functionality
 * Handles reading progress bar, table of contents, code highlighting, comments, and share buttons
 */

/**
 * PostController - Manages single post page functionality
 */
class PostController {
  constructor() {
    this.readingProgress = 0;
    this.currentSection = "";
    this.init();
  }

  init() {
    this.initReadingProgress();
    this.initTableOfContents();
    this.initCodeHighlighting();
    this.initCodeCopyButtons();
    this.initTextSizeControls();
    this.initReadAloud();
    this.initShareButtons();
    this.initLikeBookmark();
    this.initComments();
    this.initRelatedArticles();
    this.initPrintOptimization();
  }

  /**
   * Initialize reading progress bar
   */
  initReadingProgress() {
    const progressBar = document.querySelector(
      "#readingProgress, .reading-progress-bar"
    );
    if (!progressBar) return;

    const article = document.querySelector(
      ".post-article, article, .post-body"
    );
    if (!article) return;

    const updateProgress = () => {
      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollTop = window.pageYOffset;

      const scrolled = scrollTop + windowHeight - articleTop;
      const total = articleHeight;
      const progress = Math.min(Math.max((scrolled / total) * 100, 0), 100);

      this.readingProgress = progress;
      progressBar.style.width = `${progress}%`;

      // Update reading time estimate
      this.updateReadingTime();
    };

    // Throttled scroll handler
    const scrollHandler = AppUtils.throttle(updateProgress, 100);
    window.addEventListener("scroll", scrollHandler, { passive: true });

    // Initial update
    updateProgress();
  }

  /**
   * Update reading time display
   */
  updateReadingTime() {
    const readingTimeEl = document.querySelector("#readingTime");
    if (!readingTimeEl) return;

    const article = document.querySelector(".post-body, .post-article");
    if (!article) return;

    const text = article.textContent || "";
    const words = text.trim().split(/\s+/).length;
    const readingSpeed = 200; // words per minute
    const minutes = Math.ceil(words / readingSpeed);

    readingTimeEl.textContent = `~${minutes} min read`;
  }

  /**
   * Initialize table of contents with active section highlighting
   */
  initTableOfContents() {
    const tocContainer = document.querySelector("#tocContent, .toc-content");
    if (!tocContainer) return;

    // Generate TOC from headings if not already present
    const headings = document.querySelectorAll(
      ".post-section h2, .post-section h3, article h2, article h3"
    );
    if (headings.length === 0) return;

    // Add IDs to headings if they don't have them
    headings.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = `section-${index}`;
      }
    });

    // Create TOC if it doesn't exist
    const tocList = tocContainer.querySelector(".toc-list");
    if (!tocList || tocList.children.length === 0) {
      const nav = document.createElement("nav");
      nav.className = "toc-list";

      headings.forEach((heading) => {
        const item = document.createElement("div");
        item.className = "toc-item";

        const link = document.createElement("a");
        link.href = `#${heading.id}`;
        link.className = "toc-link";
        link.textContent = heading.textContent;

        link.addEventListener("click", (e) => {
          e.preventDefault();
          AppUtils.smoothScrollTo(heading, 100);
        });

        item.appendChild(link);
        nav.appendChild(item);
      });

      if (tocList) {
        tocList.innerHTML = nav.innerHTML;
      } else {
        tocContainer.appendChild(nav);
      }
    }

    // Highlight active section
    const tocLinks = tocContainer.querySelectorAll(".toc-link");
    const updateActiveSection = () => {
      let current = "";

      headings.forEach((heading, index) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 150) {
          current = heading.id;
        }
      });

      tocLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (href === `#${current}`) {
          link.classList.add("active");
          this.currentSection = current;
        } else {
          link.classList.remove("active");
        }
      });
    };

    const scrollHandler = AppUtils.throttle(updateActiveSection, 100);
    window.addEventListener("scroll", scrollHandler, { passive: true });

    // TOC toggle for mobile
    const tocToggle = document.querySelector("#tocToggle, .toc-toggle");
    if (tocToggle) {
      tocToggle.addEventListener("click", () => {
        tocContainer.classList.toggle("show");
      });
    }
  }

  /**
   * Initialize code syntax highlighting
   */
  initCodeHighlighting() {
    const codeBlocks = document.querySelectorAll(
      "pre code, .code-content code"
    );

    if (codeBlocks.length === 0) return;

    // Check if Highlight.js is loaded
    if (typeof hljs !== "undefined") {
      codeBlocks.forEach((block) => {
        hljs.highlightElement(block);

        // Add line numbers if library is available
        if (typeof hljs.lineNumbersBlock !== "undefined") {
          hljs.lineNumbersBlock(block);
        }
      });
    } else {
      // Fallback: add basic styling
      codeBlocks.forEach((block) => {
        block.style.cssText = `
                    display: block;
                    padding: 1em;
                    background: #f4f4f4;
                    border-radius: 4px;
                    overflow-x: auto;
                    font-family: 'Courier New', monospace;
                `;
      });
    }
  }

  /**
   * Initialize copy-to-clipboard buttons for code blocks
   */
  initCodeCopyButtons() {
    const codeBlocks = document.querySelectorAll(
      ".code-block-container, .code-content"
    );

    codeBlocks.forEach((block) => {
      // Check if copy button already exists
      if (block.querySelector(".copy-btn")) return;

      const codeContent = block.querySelector("code, pre");
      if (!codeContent) return;

      const copyBtn = document.createElement("button");
      copyBtn.className = "code-btn copy-btn";
      copyBtn.innerHTML = '<i class="far fa-copy"></i> Copy';
      copyBtn.setAttribute("aria-label", "Copy code to clipboard");
      copyBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                padding: 6px 12px;
                background: rgba(0,0,0,0.7);
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: background 0.2s;
            `;

      block.style.position = "relative";

      const codeHeader = block.querySelector(".code-header");
      if (codeHeader) {
        codeHeader.appendChild(copyBtn);
      } else {
        block.insertBefore(copyBtn, block.firstChild);
      }

      copyBtn.addEventListener("click", async () => {
        const text = codeContent.textContent || codeContent.innerText;
        const success = await AppUtils.copyToClipboard(text);

        if (success) {
          const originalHTML = copyBtn.innerHTML;
          copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
          copyBtn.style.background = "#28a745";

          setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.style.background = "";
          }, 2000);
        } else {
          copyBtn.innerHTML = '<i class="fas fa-times"></i> Failed';
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="far fa-copy"></i> Copy';
          }, 2000);
        }
      });
    });
  }

  /**
   * Initialize text size controls
   */
  initTextSizeControls() {
    const sizeButtons = document.querySelectorAll(".size-btn, [data-size]");
    const articleBody = document.querySelector(
      ".post-body, .post-article, article"
    );

    if (!sizeButtons.length || !articleBody) return;

    // Get saved preference
    const savedSize = localStorage.getItem("post-text-size") || "medium";
    this.setTextSize(savedSize);

    sizeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const size = button.dataset.size || button.textContent.toLowerCase();
        this.setTextSize(size);
        localStorage.setItem("post-text-size", size);
      });
    });
  }

  /**
   * Set text size for article
   */
  setTextSize(size) {
    const articleBody = document.querySelector(
      ".post-body, .post-article, article"
    );
    if (!articleBody) return;

    // Remove existing size classes
    articleBody.classList.remove("text-small", "text-medium", "text-large");

    // Add new size class
    articleBody.classList.add(`text-${size}`);

    // Update button states
    document.querySelectorAll(".size-btn, [data-size]").forEach((btn) => {
      const btnSize = btn.dataset.size || "";
      if (btnSize === size) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Apply font size
    const sizes = {
      small: "14px",
      medium: "16px",
      large: "18px",
    };

    articleBody.style.fontSize = sizes[size] || sizes.medium;
  }

  /**
   * Initialize read aloud functionality
   */
  initReadAloud() {
    const readAloudBtn = document.querySelector(".read-aloud-btn, #readAloud");
    if (!readAloudBtn) return;

    let isReading = false;
    let speechSynthesis = null;

    // Check browser support
    if ("speechSynthesis" in window) {
      speechSynthesis = window.speechSynthesis;
    } else {
      readAloudBtn.style.display = "none";
      return;
    }

    readAloudBtn.addEventListener("click", () => {
      const article = document.querySelector(
        ".post-body, .post-article, article"
      );
      if (!article) return;

      if (isReading) {
        speechSynthesis.cancel();
        isReading = false;
        readAloudBtn.innerHTML = '<i class="fas fa-volume-up"></i> Read Aloud';
      } else {
        const text = article.textContent || "";
        const utterance = new SpeechSynthesisUtterance(text);

        // Ethiopian accent option
        const ethiopianAccent =
          document.querySelector("#ethiopian-accent")?.checked;
        if (ethiopianAccent) {
          // Adjust speech parameters for Ethiopian accent
          utterance.rate = 0.9;
          utterance.pitch = 1.1;
        }

        utterance.onend = () => {
          isReading = false;
          readAloudBtn.innerHTML =
            '<i class="fas fa-volume-up"></i> Read Aloud';
        };

        speechSynthesis.speak(utterance);
        isReading = true;
        readAloudBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Reading';
      }
    });
  }

  /**
   * Initialize share buttons
   */
  initShareButtons() {
    const shareButtons = document.querySelectorAll(".share-btn, [data-share]");
    const copyLinkBtn = document.querySelector("#copyLinkBtn, .copy-link-btn");

    shareButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const platform =
          button.dataset.share || button.classList.contains("twitter")
            ? "twitter"
            : button.classList.contains("linkedin")
            ? "linkedin"
            : button.classList.contains("telegram")
            ? "telegram"
            : "";

        this.shareToPlatform(platform);
      });
    });

    if (copyLinkBtn) {
      copyLinkBtn.addEventListener("click", async () => {
        const url = window.location.href;
        const success = await AppUtils.copyToClipboard(url);

        if (success) {
          const originalHTML = copyLinkBtn.innerHTML;
          copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> Link Copied!';
          copyLinkBtn.style.background = "#28a745";

          setTimeout(() => {
            copyLinkBtn.innerHTML = originalHTML;
            copyLinkBtn.style.background = "";
          }, 2000);
        }
      });
    }
  }

  /**
   * Share to specific platform
   */
  shareToPlatform(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    const text = encodeURIComponent(
      document.querySelector('meta[name="description"]')?.content || ""
    );

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${title}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
  }

  /**
   * Initialize like and bookmark functionality
   */
  initLikeBookmark() {
    const likeBtn = document.querySelector("#likeBtn, .like-btn");
    const bookmarkBtn = document.querySelector("#bookmarkBtn, .bookmark-btn");

    // Load saved state
    const postId = this.getPostId();
    const liked = localStorage.getItem(`post-${postId}-liked`) === "true";
    const bookmarked =
      localStorage.getItem(`post-${postId}-bookmarked`) === "true";

    if (likeBtn) {
      if (liked) {
        likeBtn.classList.add("liked");
        likeBtn.querySelector("i")?.classList.replace("far", "fas");
      }

      likeBtn.addEventListener("click", () => {
        const isLiked = likeBtn.classList.contains("liked");

        if (isLiked) {
          likeBtn.classList.remove("liked");
          likeBtn.querySelector("i")?.classList.replace("fas", "far");
          localStorage.removeItem(`post-${postId}-liked`);

          // Decrement count
          const countEl = likeBtn.querySelector(".like-count");
          if (countEl) {
            const count = parseInt(countEl.textContent) || 0;
            countEl.textContent = Math.max(0, count - 1);
          }
        } else {
          likeBtn.classList.add("liked");
          likeBtn.querySelector("i")?.classList.replace("far", "fas");
          localStorage.setItem(`post-${postId}-liked`, "true");

          // Increment count
          const countEl = likeBtn.querySelector(".like-count");
          if (countEl) {
            const count = parseInt(countEl.textContent) || 0;
            countEl.textContent = count + 1;
          }
        }
      });
    }

    if (bookmarkBtn) {
      if (bookmarked) {
        bookmarkBtn.classList.add("bookmarked");
        bookmarkBtn.querySelector("i")?.classList.replace("far", "fas");
      }

      bookmarkBtn.addEventListener("click", () => {
        const isBookmarked = bookmarkBtn.classList.contains("bookmarked");

        if (isBookmarked) {
          bookmarkBtn.classList.remove("bookmarked");
          bookmarkBtn.querySelector("i")?.classList.replace("fas", "far");
          localStorage.removeItem(`post-${postId}-bookmarked`);
        } else {
          bookmarkBtn.classList.add("bookmarked");
          bookmarkBtn.querySelector("i")?.classList.replace("far", "fas");
          localStorage.setItem(`post-${postId}-bookmarked`, "true");
        }
      });
    }
  }

  /**
   * Get unique post ID from URL or data attribute
   */
  getPostId() {
    const urlParams = AppUtils.getQueryParams();
    return (
      urlParams.id ||
      document.querySelector("[data-post-id]")?.dataset.postId ||
      window.location.pathname
    );
  }

  /**
   * Initialize comments section
   */
  initComments() {
    const commentsSection = document.querySelector(
      ".comments-section, #comments"
    );
    if (!commentsSection) return;

    const commentForm = commentsSection.querySelector(".comment-form, form");
    if (commentForm) {
      commentForm.addEventListener("submit", (e) => {
        e.preventDefault();
        // Handle comment submission
        // This would integrate with your backend
        console.log("Comment submitted");
      });
    }
  }

  /**
   * Initialize related articles
   */
  initRelatedArticles() {
    const relatedArticles = document.querySelectorAll(
      ".related-card, .related-article"
    );
    relatedArticles.forEach((article) => {
      article.addEventListener("click", (e) => {
        const link = article.querySelector("a");
        if (link && !e.target.closest("a")) {
          link.click();
        }
      });
    });
  }

  /**
   * Optimize page for printing
   */
  initPrintOptimization() {
    // Add print styles
    if (!document.querySelector("#print-styles")) {
      const style = document.createElement("style");
      style.id = "print-styles";
      style.textContent = `
                @media print {
                    .nav-link, .search-overlay, .post-controls, 
                    .post-sidebar, footer, .share-section {
                        display: none !important;
                    }
                    .post-article {
                        max-width: 100% !important;
                    }
                }
            `;
      document.head.appendChild(style);
    }
  }
}

// Initialize post controller when DOM is ready
function initPost() {
  if (document.querySelector(".post-article, .post-body, article.post")) {
    window.postController = new PostController();
  }
}

// Auto-initialize if on post page
document.addEventListener("DOMContentLoaded", () => {
  const isPostPage =
    window.location.pathname.includes("post.html") ||
    document.querySelector(".post-article, .post-body");

  if (isPostPage) {
    initPost();
  }
});

// Export for manual initialization
window.initPost = initPost;
