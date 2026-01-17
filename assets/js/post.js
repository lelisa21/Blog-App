/**
 * Post Page Functionality - Reading AND Posting
 * Ethiopian Tech Blog - Complete Implementation
 */

// Global variables
let isAmharic = false;
let isAudioPlaying = false;
let readingSpeed = 200;
let userPosts = [];

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🇪🇹 Ethiopian Tech Post System Loading...');
    
    // Initialize all features
    initReadingFeatures();
    initPostingFeatures();
    initCommonFeatures();
    
    // Load user posts from localStorage
    loadUserPosts();
    
    console.log('✅ All features initialized');
});

// ==================== READING FEATURES ====================

function initReadingFeatures() {
    // Only run if we're on a reading page
    if (!document.querySelector('.post-article')) return;
    
    console.log('📖 Initializing reading features...');
    
    // 1. Reading Progress Bar
    initReadingProgress();
    
    // 2. Reading Time Calculation
    initReadingTime();
    
    // 3. Text Size Controls
    initTextSizeControls();
    
    // 4. Read Aloud Feature
    initReadAloud();
    
    // 5. Table of Contents
    initTableOfContents();
    
    // 6. Code Block Features
    initCodeBlocks();
    
    // 7. Interactive Quiz
    initQuiz();
    
    // 8. Code Playground
    initCodePlayground();
    
    // 9. Social Engagement
    initSocialEngagement();
    
    // 10. Ethiopian Context Toggles
    initEthiopianToggles();
}

// 1. Reading Progress Bar
function initReadingProgress() {
    const progressBar = document.getElementById('readingProgress');
    if (!progressBar) return;
    
    function updateProgress() {
        const article = document.querySelector('.post-article');
        if (!article) return;
        
        const articleHeight = article.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollTop = window.scrollY;
        
        const progress = (scrollTop / (articleHeight - windowHeight)) * 100;
        progressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
        
        // Update TOC progress
        updateTOCProgress();
    }
    
    window.addEventListener('scroll', updateProgress);
    updateProgress();
}

// 2. Reading Time
function initReadingTime() {
    const readingTimeEl = document.getElementById('readingTime');
    const readingSpeedEl = document.getElementById('readingSpeed');
    
    if (!readingTimeEl || !readingSpeedEl) return;
    
    const articleText = document.querySelector('.post-body')?.innerText || '';
    const wordCount = articleText.split(/\s+/).length;
    const estimatedMinutes = Math.ceil(wordCount / readingSpeed);
    
    readingTimeEl.textContent = `~${estimatedMinutes} min read`;
    readingSpeedEl.textContent = `(${readingSpeed} wpm)`;
    
    // Track reading speed
    trackReadingSpeed();
}

function trackReadingSpeed() {
    let startTime = Date.now();
    let startScroll = window.scrollY;
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    function calculateSpeed() {
        const currentTime = Date.now();
        const currentScroll = window.scrollY;
        const timeDiff = (currentTime - startTime) / 1000 / 60; // minutes
        const scrollDiff = (currentScroll - startScroll) / totalHeight; // percentage
        
        if (timeDiff > 0.1) {
            const estimatedWords = scrollDiff * (document.querySelector('.post-body')?.innerText.split(/\s+/).length || 0);
            const speed = Math.round(estimatedWords / timeDiff);
            
            if (speed > 50 && speed < 500) {
                readingSpeed = speed;
                updateReadingTime();
            }
        }
    }
    
    window.addEventListener('scroll', calculateSpeed);
}

function updateReadingTime() {
    const readingTimeEl = document.getElementById('readingTime');
    const readingSpeedEl = document.getElementById('readingSpeed');
    
    if (!readingTimeEl || !readingSpeedEl) return;
    
    const articleText = document.querySelector('.post-body')?.innerText || '';
    const wordCount = articleText.split(/\s+/).length;
    const estimatedMinutes = Math.ceil(wordCount / readingSpeed);
    
    readingTimeEl.textContent = `~${estimatedMinutes} min read`;
    readingSpeedEl.textContent = `(${readingSpeed} wpm)`;
}

// 3. Text Size Controls
function initTextSizeControls() {
    const sizeButtons = document.querySelectorAll('.size-btn');
    const article = document.querySelector('.post-body');
    
    if (!sizeButtons.length || !article) return;
    
    sizeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            sizeButtons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Apply font size
            const size = this.dataset.size;
            let fontSize;
            
            switch(size) {
                case 'small':
                    fontSize = '14px';
                    readingSpeed = 250;
                    break;
                case 'medium':
                    fontSize = '16px';
                    readingSpeed = 200;
                    break;
                case 'large':
                    fontSize = '18px';
                    readingSpeed = 180;
                    break;
            }
            
            article.style.fontSize = fontSize;
            updateReadingTime();
            
            // Save preference
            localStorage.setItem('textSizePreference', size);
        });
    });
    
    // Load saved preference
    const savedSize = localStorage.getItem('textSizePreference') || 'medium';
    const savedBtn = document.querySelector(`[data-size="${savedSize}"]`);
    if (savedBtn) savedBtn.click();
}

// 4. Read Aloud Feature
function initReadAloud() {
    const readAloudBtn = document.querySelector('.read-aloud-btn');
    if (!readAloudBtn) return;
    
    readAloudBtn.addEventListener('click', function() {
        if (isAudioPlaying) {
            stopReadAloud();
            this.innerHTML = '<i class="fas fa-volume-up"></i> Read Aloud';
            this.classList.remove('playing');
        } else {
            startReadAloud();
            this.innerHTML = '<i class="fas fa-pause"></i> Pause';
            this.classList.add('playing');
        }
        isAudioPlaying = !isAudioPlaying;
    });
    
    // Ethiopian accent toggle
    const ethiopianAccent = document.getElementById('ethiopian-accent');
    if (ethiopianAccent) {
        ethiopianAccent.addEventListener('change', function() {
            console.log('Ethiopian accent:', this.checked);
            // In real implementation, this would change TTS settings
        });
    }
    
    // Amharic toggle
    const amharicToggle = document.getElementById('amharic-toggle');
    if (amharicToggle) {
        amharicToggle.addEventListener('change', function() {
            isAmharic = this.checked;
            console.log('Amharic mode:', isAmharic);
        });
    }
}

function startReadAloud() {
    const articleText = document.querySelector('.post-body')?.innerText || '';
    
    if ('speechSynthesis' in window) {
        const speech = new SpeechSynthesisUtterance(articleText.substring(0, 500)); // Limit for demo
        
        // Try to find Ethiopian voice
        const voices = speechSynthesis.getVoices();
        const ethiopianVoice = voices.find(voice => 
            voice.lang.includes('am') || voice.name.includes('Amharic')
        );
        
        if (ethiopianVoice && isAmharic) {
            speech.voice = ethiopianVoice;
            speech.lang = 'am-ET';
        }
        
        speechSynthesis.speak(speech);
        
        speech.onend = function() {
            isAudioPlaying = false;
            const btn = document.querySelector('.read-aloud-btn');
            if (btn) {
                btn.innerHTML = '<i class="fas fa-volume-up"></i> Read Aloud';
                btn.classList.remove('playing');
            }
        };
    }
}

function stopReadAloud() {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
    }
}

// 5. Table of Contents
function initTableOfContents() {
    const tocToggle = document.getElementById('tocToggle');
    const tocContent = document.getElementById('tocContent');
    
    if (tocToggle && tocContent) {
        tocToggle.addEventListener('click', function() {
            const isHidden = tocContent.style.display === 'none';
            tocContent.style.display = isHidden ? 'block' : 'none';
            this.querySelector('i').className = isHidden ? 'fas fa-times' : 'fas fa-bars';
        });
    }
}

function updateTOCProgress() {
    const tocLinks = document.querySelectorAll('.toc-link');
    if (!tocLinks.length) return;
    
    tocLinks.forEach(link => {
        const sectionId = link.getAttribute('href').substring(1);
        const section = document.getElementById(sectionId);
        
        if (section) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;
            
            const sectionProgress = Math.min(100, 
                Math.max(0, 
                    ((scrollPosition + windowHeight/2 - sectionTop) / sectionHeight) * 100
                )
            );
            
            const progressBar = link.querySelector('.section-progress-bar');
            if (progressBar) {
                progressBar.style.width = sectionProgress + '%';
            }
            
            // Highlight current section
            if (scrollPosition >= sectionTop - 100 && 
                scrollPosition < sectionTop + sectionHeight - 100) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        }
    });
}

// 6. Code Block Features
function initCodeBlocks() {
    // Copy button
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const codeBlock = this.closest('.code-block-container').querySelector('code');
            if (!codeBlock) return;
            
            navigator.clipboard.writeText(codeBlock.textContent)
                .then(() => {
                    const original = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => {
                        this.innerHTML = original;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Copy failed:', err);
                });
        });
    });
    
    // Run button (for JavaScript code)
    document.querySelectorAll('.run-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const codeBlock = this.closest('.code-block-container').querySelector('code');
            if (!codeBlock || !codeBlock.className.includes('javascript')) return;
            
            try {
                // Create a safe sandbox for code execution
                const code = codeBlock.textContent;
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
                
                const sandboxScript = `
                    <script>
                        try {
                            ${code}
                            window.parent.postMessage({type: 'codeExecuted', success: true}, '*');
                        } catch(error) {
                            window.parent.postMessage({type: 'codeError', error: error.message}, '*');
                        }
                    <\/script>
                `;
                
                iframe.contentDocument.write(sandboxScript);
                iframe.contentDocument.close();
                
                // Clean up after 5 seconds
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 5000);
                
                showNotification('Code executed in sandbox', 'success');
            } catch (error) {
                showNotification('Error executing code: ' + error.message, 'error');
            }
        });
    });
    
    // Download button
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const codeBlock = this.closest('.code-block-container').querySelector('code');
            if (!codeBlock) return;
            
            const language = codeBlock.className.replace('language-', '');
            const code = codeBlock.textContent;
            const blob = new Blob([code], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `code-${Date.now()}.${language}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification('Code downloaded', 'success');
        });
    });
}

// 7. Interactive Quiz
function initQuiz() {
    const quizSubmitBtn = document.querySelector('.submit-quiz-btn');
    if (!quizSubmitBtn) return;
    
    // Select quiz options
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.quiz-option').forEach(o => {
                o.classList.remove('selected');
            });
            this.classList.add('selected');
        });
    });
    
    // Submit quiz
    quizSubmitBtn.addEventListener('click', function() {
        const selected = document.querySelector('.quiz-option.selected');
        const feedback = document.getElementById('quizFeedback');
        
        if (!selected) {
            feedback.textContent = 'Please select an answer!';
            feedback.className = 'quiz-feedback error';
            feedback.style.display = 'block';
            return;
        }
        
        const isCorrect = selected.dataset.correct === 'true';
        
        if (isCorrect) {
            feedback.innerHTML = `
                ✅ <strong>Correct!</strong> WebP with lazy loading and reduced quality is ideal for 2G networks in Ethiopia.
                <br><br>
                <small><i class="fas fa-lightbulb"></i> <em>Why this is best for Ethiopia:</em> 
                2G networks have limited bandwidth (typically < 100kbps). WebP provides 30% better compression than JPEG, 
                and lazy loading ensures images only load when needed, saving precious data.</small>
            `;
            feedback.className = 'quiz-feedback success';
            
            // Award points
            awardQuizPoints(10);
        } else {
            feedback.innerHTML = `
                ❌ <strong>Not quite right.</strong> For Ethiopian 2G networks, we need highly optimized solutions.
                <br><br>
                <small><i class="fas fa-wifi"></i> <em>Remember:</em> Most Ethiopian users on 2G networks have:
                <ul style="margin: 5px 0 0 20px;">
                    <li>Very slow internet (often < 100kbps)</li>
                    <li>Limited data plans (expensive per MB)</li>
                    <li>Intermittent connectivity</li>
                </ul>
                WebP with lazy loading provides the best balance of quality and performance.</small>
            `;
            feedback.className = 'quiz-feedback error';
        }
        
        feedback.style.display = 'block';
        
        // Disable further selections
        document.querySelectorAll('.quiz-option').forEach(o => {
            o.style.pointerEvents = 'none';
        });
        quizSubmitBtn.disabled = true;
        quizSubmitBtn.textContent = 'Completed';
    });
}

function awardQuizPoints(points) {
    const userPoints = parseInt(localStorage.getItem('quizPoints') || '0');
    localStorage.setItem('quizPoints', (userPoints + points).toString());
    
    // Show achievement if this is first quiz
    if (userPoints === 0) {
        showNotification(`🎉 +${points} points! First quiz completed!`, 'success');
    }
}

// 8. Code Playground
function initCodePlayground() {
    const runPlaygroundBtn = document.getElementById('runPlayground');
    if (!runPlaygroundBtn) return;
    
    // Tab switching
    document.querySelectorAll('.playground-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.playground-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            // In a full implementation, this would switch editor content
        });
    });
    
    // Run playground code
    runPlaygroundBtn.addEventListener('click', function() {
        const editor = document.getElementById('htmlEditor');
        const preview = document.getElementById('previewFrame');
        
        if (!editor || !preview) return;
        
        try {
            const doc = preview.contentDocument || preview.contentWindow.document;
            doc.open();
            doc.write(editor.value);
            doc.close();
            
            showNotification('Playground code executed', 'success');
        } catch (error) {
            showNotification('Error running code: ' + error.message, 'error');
        }
    });
}

// 9. Social Engagement
function initSocialEngagement() {
    // Like button
    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn) {
        likeBtn.addEventListener('click', function() {
            const likeCount = this.querySelector('.like-count');
            let count = parseInt(likeCount.textContent) || 0;
            
            if (this.classList.contains('liked')) {
                count--;
                this.classList.remove('liked');
                this.querySelector('i').className = 'far fa-heart';
                showNotification('Like removed', 'info');
            } else {
                count++;
                this.classList.add('liked');
                this.querySelector('i').className = 'fas fa-heart';
                showNotification('👍 Thanks for liking this article!', 'success');
            }
            
            likeCount.textContent = count;
            
            // Save like state
            const articleId = window.location.pathname;
            localStorage.setItem(`liked_${articleId}`, this.classList.contains('liked'));
        });
        
        // Load saved like state
        const articleId = window.location.pathname;
        if (localStorage.getItem(`liked_${articleId}`) === 'true') {
            likeBtn.classList.add('liked');
            likeBtn.querySelector('i').className = 'fas fa-heart';
        }
    }
    
    // Bookmark button
    const bookmarkBtn = document.getElementById('bookmarkBtn');
    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', function() {
            if (this.classList.contains('bookmarked')) {
                this.classList.remove('bookmarked');
                this.querySelector('i').className = 'far fa-bookmark';
                showNotification('Bookmark removed', 'info');
            } else {
                this.classList.add('bookmarked');
                this.querySelector('i').className = 'fas fa-bookmark';
                
                // Save bookmark
                const article = {
                    title: document.querySelector('.post-title')?.textContent || 'Untitled',
                    url: window.location.href,
                    date: new Date().toISOString()
                };
                
                let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
                bookmarks.push(article);
                localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
                
                showNotification('📚 Article bookmarked!', 'success');
            }
        });
        
        // Check if already bookmarked
        let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        const currentUrl = window.location.href;
        if (bookmarks.some(b => b.url === currentUrl)) {
            bookmarkBtn.classList.add('bookmarked');
            bookmarkBtn.querySelector('i').className = 'fas fa-bookmark';
        }
    }
    
    // Share buttons
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const platform = this.classList[1];
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            const text = encodeURIComponent("Check out this Ethiopian tech article!");
            
            let shareUrl = '';
            
            switch(platform) {
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}&hashtags=EthiopiaTech`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                    break;
                case 'telegram':
                    shareUrl = `https://t.me/share/url?url=${url}&text=${title}`;
                    break;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });
    
    // Copy link button
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', function() {
            navigator.clipboard.writeText(window.location.href)
                .then(() => {
                    const original = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-check"></i> Link Copied! 🇪🇹';
                    this.classList.add('copied');
                    
                    setTimeout(() => {
                        this.innerHTML = original;
                        this.classList.remove('copied');
                    }, 2000);
                    
                    showNotification('Link copied to clipboard!', 'success');
                })
                .catch(err => {
                    showNotification('Failed to copy link', 'error');
                });
        });
    }
}

// 10. Ethiopian Context Toggles
function initEthiopianToggles() {
    // Listen for Ethiopian context toggles
    const ethiopianToggles = document.querySelectorAll('[data-ethiopian-toggle]');
    ethiopianToggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const context = this.dataset.context;
            console.log(`Ethiopian context ${context}:`, this.checked);
            
            // Here you would apply Ethiopian-specific modifications
            // For example, toggle Amharic translations, adjust examples, etc.
        });
    });
}

// ==================== POSTING FEATURES ====================

function initPostingFeatures() {
    const postForm = document.getElementById('createPostForm');
    if (!postForm) return; // Only run if posting section exists
    
    console.log('📝 Initializing posting features...');
    
    // 1. Title character counter
    const titleInput = document.getElementById('postTitleInput');
    const titleCounter = document.getElementById('titleCounter');
    
    if (titleInput && titleCounter) {
        titleInput.addEventListener('input', function() {
            const length = this.value.length;
            titleCounter.textContent = `${length}/120`;
            
            if (length > 100) {
                titleCounter.style.color = 'var(--color-danger)';
            } else if (length > 80) {
                titleCounter.style.color = 'var(--color-accent)';
            } else {
                titleCounter.style.color = 'var(--color-text-muted)';
            }
            
            updatePostPreview();
        });
    }
    
    // 2. Editor tools
    document.querySelectorAll('.editor-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const format = this.dataset.format;
            applyTextFormat(format);
        });
    });
    
    // 3. Ethiopian context suggestions
    document.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            addEthiopianSuggestion(this.dataset.suggestion);
        });
    });
    
    // 4. Tags input
    const tagsInput = document.getElementById('postTagsInput');
    const tagPreview = document.getElementById('tagPreview');
    
    if (tagsInput && tagPreview) {
        tagsInput.addEventListener('input', function() {
            updateTagPreview(this.value);
        });
    }
    
    // 5. Content preview
    const contentInput = document.getElementById('postContentInput');
    if (contentInput) {
        contentInput.addEventListener('input', updatePostPreview);
    }
    
    // 6. Form submission
    postForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitPost();
    });
    
    // 7. Save draft
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', saveAsDraft);
    }
    
    // 8. Preview button
    const previewBtn = document.getElementById('previewPostBtn');
    if (previewBtn) {
        previewBtn.addEventListener('click', function() {
            document.getElementById('postPreview').scrollIntoView({ 
                behavior: 'smooth' 
            });
            showNotification('Scroll to preview section', 'info');
        });
    }
    
    // Load any saved draft
    loadSavedDraft();
}

// Posting helper functions
function applyTextFormat(format) {
    const textarea = document.getElementById('postContentInput');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let newText = '';
    
    switch(format) {
        case 'bold':
            newText = `**${selectedText}**`;
            break;
        case 'italic':
            newText = `*${selectedText}*`;
            break;
        case 'code':
            newText = `\`${selectedText}\``;
            break;
        case 'link':
            newText = `[${selectedText}](https://example.com)`;
            break;
        case 'image':
            newText = `![${selectedText}](https://example.com/image.jpg)`;
            break;
        case 'amharic':
            newText = `${selectedText}\n\n**አማርኛ ትርጉም:** [እዚህ አማርኛ ትርጉም ያስገቡ]`;
            break;
    }
    
    textarea.value = textarea.value.substring(0, start) + newText + 
                     textarea.value.substring(end);
    
    // Focus back on textarea
    textarea.focus();
    textarea.selectionStart = start + newText.length;
    textarea.selectionEnd = start + newText.length;
    
    updatePostPreview();
}

function addEthiopianSuggestion(type) {
    const textarea = document.getElementById('postContentInput');
    if (!textarea) return;
    
    let suggestion = '';
    let cursorPosition = textarea.selectionStart;
    
    switch(type) {
        case 'internet':
            suggestion = '\n\n**🇪🇹 Ethiopian Internet Consideration:** ';
            suggestion += 'Most Ethiopian users have limited bandwidth (2-4 Mbps). ';
            suggestion += 'Optimize assets and implement lazy loading.';
            break;
        case 'provider':
            suggestion = '\n\n**🏢 Local Provider Integration:** ';
            suggestion += 'Consider integrating Ethiopian services: ';
            suggestion += 'HahuCloud (hosting), Chapa (payments), Ethio Telecom APIs.';
            break;
        case 'amharic':
            suggestion = '\n\n**🇪🇹 አማርኛ ትርጉም:** ';
            suggestion += '[ይህን ይዘት በአማርኛ ያብራሩ]';
            break;
        case 'mobile':
            suggestion = '\n\n**📱 Mobile-First for Ethiopia:** ';
            suggestion += '90%+ access via Android mobile. ';
            suggestion += 'Test on devices with 2-4GB RAM.';
            break;
    }
    
    // Insert suggestion at cursor position
    textarea.value = textarea.value.substring(0, cursorPosition) + 
                     suggestion + 
                     textarea.value.substring(cursorPosition);
    
    // Move cursor to end of inserted text
    textarea.focus();
    textarea.selectionStart = cursorPosition + suggestion.length;
    textarea.selectionEnd = cursorPosition + suggestion.length;
    
    updatePostPreview();
    showNotification('Ethiopian context added', 'success');
}

function updateTagPreview(tagsString) {
    const tagPreview = document.getElementById('tagPreview');
    if (!tagPreview) return;
    
    tagPreview.innerHTML = '';
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag-preview-item';
        tagElement.textContent = '#' + tag.toLowerCase();
        tagElement.style.cssText = `
            display: inline-block;
            padding: 4px 10px;
            margin: 2px;
            background: var(--color-primary);
            color: var(--color-bg);
            border-radius: 20px;
            font-size: 0.9em;
        `;
        tagPreview.appendChild(tagElement);
    });
}

function updatePostPreview() {
    const preview = document.getElementById('postPreview');
    const title = document.getElementById('postTitleInput')?.value || '';
    const content = document.getElementById('postContentInput')?.value || '';
    
    if (!preview) return;
    
    let previewHTML = '';
    
    if (title) {
        previewHTML += `<h3 style="color: var(--color-text); margin-top: 0;">${title}</h3>`;
    }
    
    if (content) {
        // Simple markdown to HTML conversion
        let htmlContent = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width:100%; border-radius: 8px; margin: 10px 0;">')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: var(--color-primary);">$1</a>')
            .replace(/\n/g, '<br>');
        
        previewHTML += `<div style="color: var(--color-text); line-height: 1.6;">${htmlContent}</div>`;
        
        // Add word count
        const wordCount = content.split(/\s+/).length;
        const readTime = Math.ceil(wordCount / 200);
        previewHTML += `<div style="margin-top: 15px; color: var(--color-text-muted); font-size: 0.9em; border-top: 1px solid var(--color-border); padding-top: 10px;">
            📝 ${wordCount} words | ⏱️ ${readTime} min read | 🇪🇹 Ethiopian context
        </div>`;
    } else {
        previewHTML = '<p style="color: var(--color-text-muted); text-align: center; padding: 40px; font-style: italic;">Your post preview will appear here...</p>';
    }
    
    preview.innerHTML = previewHTML;
}

function saveAsDraft() {
    const postData = {
        title: document.getElementById('postTitleInput')?.value || '',
        content: document.getElementById('postContentInput')?.value || '',
        tags: document.getElementById('postTagsInput')?.value || '',
        category: document.getElementById('postCategoryInput')?.value || '',
        savedAt: new Date().toISOString()
    };
    
    localStorage.setItem('postDraft', JSON.stringify(postData));
    
    showNotification('💾 Draft saved locally!', 'success');
}

function loadSavedDraft() {
    const saved = localStorage.getItem('postDraft');
    if (!saved) return;
    
    try {
        const postData = JSON.parse(saved);
        
        if (document.getElementById('postTitleInput')) {
            document.getElementById('postTitleInput').value = postData.title || '';
        }
        if (document.getElementById('postContentInput')) {
            document.getElementById('postContentInput').value = postData.content || '';
        }
        if (document.getElementById('postTagsInput')) {
            document.getElementById('postTagsInput').value = postData.tags || '';
            updateTagPreview(postData.tags || '');
        }
        if (document.getElementById('postCategoryInput')) {
            document.getElementById('postCategoryInput').value = postData.category || '';
        }
        
        updatePostPreview();
        
        // Show notification if draft is older than 1 day
        const savedDate = new Date(postData.savedAt);
        const daysOld = (new Date() - savedDate) / (1000 * 60 * 60 * 24);
        
        if (daysOld > 1) {
            showNotification(`📝 Draft from ${Math.floor(daysOld)} days ago loaded`, 'info');
        }
    } catch (e) {
        console.error('Error loading draft:', e);
    }
}

function submitPost() {
    const title = document.getElementById('postTitleInput')?.value.trim();
    const content = document.getElementById('postContentInput')?.value.trim();
    
    if (!title) {
        showNotification('Please enter a title', 'error');
        document.getElementById('postTitleInput').focus();
        return;
    }
    
    if (!content || content.length < 50) {
        showNotification('Please write at least 50 characters of content', 'error');
        document.getElementById('postContentInput').focus();
        return;
    }
    
    // Validate Ethiopian context
    const hasEthiopianContext = content.toLowerCase().includes('ethiopia') || 
                               content.includes('🇪🇹') ||
                               content.toLowerCase().includes('amharic');
    
    if (!hasEthiopianContext) {
        const proceed = confirm('No Ethiopian context detected. Post anyway?');
        if (!proceed) return;
    }
    
    const postData = {
        id: 'post_' + Date.now(),
        title: title,
        content: content,
        tags: document.getElementById('postTagsInput')?.value.split(',').map(t => t.trim()).filter(t => t) || [],
        category: document.getElementById('postCategoryInput')?.value || 'web-dev',
        author: 'You',
        authorAvatar: 'U',
        date: new Date().toISOString(),
        likes: 0,
        views: 0,
        hasEthiopianContext: hasEthiopianContext,
        wordCount: content.split(/\s+/).length
    };
    
    // Save to localStorage (simulating backend)
    userPosts.push(postData);
    localStorage.setItem('userPosts', JSON.stringify(userPosts));
    
    // Clear form
    document.getElementById('createPostForm').reset();
    document.getElementById('postPreview').innerHTML = 
        '<p style="color: var(--color-text-muted); text-align: center; padding: 40px; font-style: italic;">Your post preview will appear here...</p>';
    document.getElementById('tagPreview').innerHTML = '';
    document.getElementById('titleCounter').textContent = '0/120';
    
    // Clear draft
    localStorage.removeItem('postDraft');
    
    // Show success
    showNotification('🎉 Post published successfully!', 'success');
    
    // Show preview of published post
    setTimeout(() => {
        alert(`"${title}" has been published!\n\nWord count: ${postData.wordCount}\nEthiopian context: ${hasEthiopianContext ? '✅ Yes' : '❌ No'}`);
    }, 1000);
}

function loadUserPosts() {
    try {
        const saved = localStorage.getItem('userPosts');
        userPosts = saved ? JSON.parse(saved) : [];
        console.log(`Loaded ${userPosts.length} user posts`);
    } catch (e) {
        console.error('Error loading user posts:', e);
        userPosts = [];
    }
}

// ==================== COMMON FEATURES ====================

function initCommonFeatures() {
    // Add notification styles
    addNotificationStyles();
    
    // Handle Ethiopian time display
    updateEthiopianTime();
}

function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-md);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 400px;
        }
        
        .notification.success {
            border-left: 4px solid var(--color-success);
        }
        
        .notification.error {
            border-left: 4px solid var(--color-danger);
        }
        
        .notification.info {
            border-left: 4px solid var(--color-primary);
        }
        
        .notification i {
            font-size: 18px;
        }
        
        .notification.success i {
            color: var(--color-success);
        }
        
        .notification.error i {
            color: var(--color-danger);
        }
        
        .notification.info i {
            color: var(--color-primary);
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fadeOut {
            to { opacity: 0; }
        }
        
        /* Quiz feedback styles */
        .quiz-feedback {
            display: none;
            margin-top: 15px;
            padding: 15px;
            border-radius: var(--radius-md);
            animation: fadeIn 0.3s ease;
        }
        
        .quiz-feedback.success {
            background: rgba(158, 240, 26, 0.1);
            border: 1px solid var(--color-success);
        }
        
        .quiz-feedback.error {
            background: rgba(255, 94, 108, 0.1);
            border: 1px solid var(--color-danger);
        }
        
        .quiz-option.selected {
            background: var(--color-primary) !important;
            color: var(--color-bg) !important;
            border-color: var(--color-primary) !important;
        }
        
        /* Like and bookmark states */
        .engagement-btn.liked {
            color: var(--color-danger) !important;
        }
        
        .engagement-btn.bookmarked {
            color: var(--color-accent) !important;
        }
        
        /* Copy link animation */
        .copy-link-btn.copied {
            background: var(--color-success) !important;
            color: white !important;
        }
    `;
    document.head.appendChild(style);
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = 'info-circle';
    switch(type) {
        case 'success': icon = 'check-circle'; break;
        case 'error': icon = 'exclamation-circle'; break;
        case 'info': icon = 'info-circle'; break;
    }
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

function updateEthiopianTime() {
    // Update any Ethiopian time displays on the page
    const ethiopiaTime = new Date(new Date().getTime() + (3 * 60 * 60 * 1000)); // GMT+3
    const timeString = ethiopiaTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const timeElements = document.querySelectorAll('[data-ethiopia-time]');
    timeElements.forEach(el => {
        el.textContent = timeString + ' GMT+3';
    });
}
// Initialize highlight.js if available
if (typeof hljs !== 'undefined') {
    hljs.highlightAll();
    if (hljs.lineNumbersBlock) {
        hljs.lineNumbersBlock(document.querySelectorAll('pre code'));
    }
}
if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = function() {
        console.log('Voices loaded:', speechSynthesis.getVoices().length);
    };
}
