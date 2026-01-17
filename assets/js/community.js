document.addEventListener('DOMContentLoaded', function() {
    console.log('🇪🇹 Ethiopian Tech Community - Initializing...');
    
    // Initialize ALL features
    initLiveDashboard();
    initMemberDirectory();
    initDiscussionForums();
    initProjectCollaboration();
    initLearningGroups();
    initGamification();
    initNetworkingFeatures();
    initRealtimeFeatures();
    initCommunityResources();
    
    // Initialize time display
    updateEthiopianTime();
    setInterval(updateEthiopianTime, 1000);
});

// ========== A. LIVE ACTIVITY DASHBOARD ==========
function initLiveDashboard() {
    const memberCountElement = document.getElementById('live-member-count');
    if (memberCountElement) {
        animateCounter(memberCountElement, 5000, 5234, 2000);
    }
    const onlineCountElement = document.getElementById('online-count');
    if (onlineCountElement) {
        updateOnlineUsers();
        setInterval(updateOnlineUsers, 30000); // Update every 30 seconds
    }
    
    // A.3 Recent activities feed
    const activitiesFeed = document.getElementById('activities-feed');
    if (activitiesFeed) {
        loadActivitiesFeed();
        setInterval(loadActivitiesFeed, 60000); // Update every minute
    }
    
    // A.4 Top contributors this week
    const topContributors = document.getElementById('top-contributors');
    if (topContributors) {
        loadTopContributors();
    }
    
    // A.5 City heatmap interactions
    initCityHeatmap();
    
    // View controls
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            viewButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateDashboardView(this.dataset.view);
        });
    });
}

function animateCounter(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        element.textContent = current.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function updateOnlineUsers() {
    const onlineCount = Math.floor(Math.random() * 200) + 400; // 400-600 online
    const element = document.getElementById('online-count');
    if (element) {
        element.textContent = `${onlineCount} developers online now`;
    }
    
    // Update avatars
    updateLiveAvatars(onlineCount);
}

function updateLiveAvatars(count) {
    const avatarGrid = document.getElementById('live-avatars');
    if (!avatarGrid) return;
    
    // Clear existing avatars
    avatarGrid.innerHTML = '';
    
    // Generate random avatars
    const colors = ['#7efff5', '#ffd166', '#784fb6', '#ff5e6c', '#9ef01a'];
    const avatarCount = Math.min(12, Math.floor(count / 40));
    
    for (let i = 0; i < avatarCount; i++) {
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.style.cssText = `
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: ${colors[i % colors.length]};
            display: flex;
            align-items: center;
            justify-content: center;
            color: #000;
            font-weight: bold;
            font-size: 14px;
        `;
        avatar.textContent = 'ET';
        avatarGrid.appendChild(avatar);
    }
}

function loadActivitiesFeed() {
    const feed = document.getElementById('activities-feed');
    if (!feed) return;
    
    const activities = [
        { user: 'Selam G.', action: 'started a new React project', time: '2 min ago' },
        { user: 'Dawit M.', action: 'joined the Python study group', time: '5 min ago' },
        { user: 'Amina K.', action: 'shared a job opportunity', time: '12 min ago' },
        { user: 'Yohannes T.', action: 'contributed to an open source project', time: '25 min ago' },
        { user: 'Meron A.', action: 'answered a technical question', time: '1 hour ago' }
    ];
    
    feed.innerHTML = activities.map(activity => `
        <div class="activity-item" style="
            padding: 10px;
            border-bottom: 1px solid var(--color-border);
            animation: fadeIn 0.3s ease;
        ">
            <strong style="color: var(--color-primary);">${activity.user}</strong>
            <span style="color: var(--color-text);"> ${activity.action}</span>
            <small style="color: var(--color-text-muted); float: right;">${activity.time}</small>
        </div>
    `).join('');
}

function loadTopContributors() {
    const container = document.getElementById('top-contributors');
    if (!container) return;
    
    const contributors = [
        { name: 'Elias Z.', points: 1250, role: 'React Expert' },
        { name: 'Beti T.', points: 980, role: 'Python Mentor' },
        { name: 'Kaleb M.', points: 875, role: 'DevOps Lead' },
        { name: 'Hana S.', points: 720, role: 'Community Mod' },
        { name: 'Solomon A.', points: 650, role: 'AI Researcher' }
    ];
    
    container.innerHTML = contributors.map((contributor, index) => `
        <div class="contributor" style="
            display: flex;
            align-items: center;
            padding: 10px;
            background: ${index < 3 ? 'rgba(126, 255, 245, 0.1)' : 'transparent'};
            border-radius: 8px;
            margin: 5px 0;
        ">
            <div style="
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: var(--color-primary);
                color: var(--color-bg);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                margin-right: 10px;
            ">${index + 1}</div>
            <div style="flex: 1;">
                <div style="font-weight: bold; color: var(--color-text);">${contributor.name}</div>
                <div style="font-size: 12px; color: var(--color-text-muted);">${contributor.role}</div>
            </div>
            <div style="
                background: var(--color-primary);
                color: var(--color-bg);
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: bold;
            ">${contributor.points} pts</div>
        </div>
    `).join('');
}

function initCityHeatmap() {
    const cityDots = document.querySelectorAll('.city-dot');
    cityDots.forEach(dot => {
        dot.addEventListener('mouseenter', function() {
            const city = this.dataset.city;
            const activity = this.dataset.activity;
            
            // Show tooltip
            this.setAttribute('title', `${city.replace('-', ' ').toUpperCase()}: ${activity} activity`);
            
            // Highlight connected elements
            this.style.transform = 'scale(1.2)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        dot.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
        
        dot.addEventListener('click', function() {
            const city = this.dataset.city;
            showCityDetails(city);
        });
    });
}

function showCityDetails(city) {
    const cityNames = {
        'addis-ababa': 'Addis Ababa',
        'bahir-dar': 'Bahir Dar',
        'mekelle': 'Mekelle',
        'hawassa': 'Hawassa',
        'jimma': 'Jimma'
    };
    
    alert(`🏙️ ${cityNames[city] || city}\n\n📊 Tech Community in this city:\n• 1000+ developers\n• 50+ active projects\n• Weekly meetups\n• Coworking spaces available`);
}

function updateDashboardView(view) {
    console.log(`Switching to ${view} view`);
    // We would fetch different data based on the view
}

// ========== B. MEMBER DIRECTORY ==========
function initMemberDirectory() {
    console.log('👥 Initializing Member Directory...');
    
    // B.1 Search and filter functionality
    const searchInput = document.getElementById('member-search');
    const skillFilter = document.getElementById('skill-filter');
    const cityFilter = document.getElementById('city-filter');
    const availabilityFilter = document.getElementById('availability-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterMembers);
    }
    if (skillFilter) {
        skillFilter.addEventListener('change', filterMembers);
    }
    if (cityFilter) {
        cityFilter.addEventListener('change', filterMembers);
    }
    if (availabilityFilter) {
        availabilityFilter.addEventListener('change', filterMembers);
    }
    
    // B.2 Skills chart
    initSkillsChart();
    
    // B.3 Mentor/mentee matching
    initMatchingSystem();
    
    // B.4 Availability status
    initAvailabilityStatus();
}

function filterMembers() {
    const searchTerm = document.getElementById('member-search')?.value.toLowerCase() || '';
    const skill = document.getElementById('skill-filter')?.value || '';
    const city = document.getElementById('city-filter')?.value || '';
    const availability = document.getElementById('availability-filter')?.value || '';
    
    // For Feature we  would filter actual member cards
    console.log(`Filtering: search="${searchTerm}", skill="${skill}", city="${city}", availability="${availability}"`);
    
    // Show search results
    const results = document.querySelector('.search-results');
    if (!results) {
        const div = document.createElement('div');
        div.className = 'search-results';
        div.style.cssText = `
            padding: 10px;
            background: var(--color-surface);
            border-radius: 8px;
            margin-top: 10px;
            color: var(--color-text);
        `;
        document.querySelector('.member-search').appendChild(div);
    }
    
    const resultElement = document.querySelector('.search-results');
    if (searchTerm || skill || city || availability) {
        resultElement.textContent = `Showing members matching your filters...`;
        resultElement.style.display = 'block';
    } else {
        resultElement.style.display = 'none';
    }
}

function initSkillsChart() {
    const canvas = document.getElementById('skills-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const parent = canvas.parentElement;
    const parentWidth = parent.clientWidth;
    
    // Set canvas size with better proportions (aspect ratio ~ 2:1 width:height)
    canvas.width = parentWidth;
    canvas.height = parentWidth * 0.3;
    
    // Sample data - Ethiopian tech skills distribution
    const data = {
        labels: ['Web Dev', 'Mobile', 'AI/ML', 'DevOps', 'Data Science', 'Design'],
        datasets: [{
            label: 'Developers in Ethiopia',
            data: [45, 25, 15, 10, 8, 12],
            backgroundColor: [
                'rgba(126, 255, 245, 0.7)',
                'rgba(255, 209, 102, 0.7)',
                'rgba(120, 79, 182, 0.7)',
                'rgba(255, 94, 108, 0.7)',
                'rgba(158, 240, 26, 0.7)',
                'rgba(0, 194, 255, 0.7)'
            ],
            borderColor: [
                'rgb(126, 255, 245)',
                'rgb(255, 209, 102)',
                'rgb(120, 79, 182)',
                'rgb(255, 94, 108)',
                'rgb(158, 240, 26)',
                'rgb(0, 194, 255)'
            ],
            borderWidth: 1
        }]
    };
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'var(--color-text)'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'var(--color-text-muted)'
                    },
                    grid: {
                        color: 'var(--color-border)'
                    }
                },
                x: {
                    ticks: {
                        color: 'var(--color-text)'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function initMatchingSystem() {
    const roleButtons = document.querySelectorAll('.role-btn');
    const findMatchBtn = document.getElementById('find-match');
    const matchResults = document.getElementById('match-results');
    
    // Role selection
    roleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            roleButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Find match
    if (findMatchBtn && matchResults) {
        findMatchBtn.addEventListener('click', function() {
            const role = document.querySelector('.role-btn.active')?.dataset.role || 'mentor';
            const skill = document.getElementById('match-skill')?.value || 'web';
            
            // Simulate finding matches
            const matches = [
                { name: 'Samuel G.', role: 'Mentor', skill: 'React', experience: '5 years', location: 'Addis' },
                { name: 'Marta T.', role: 'Mentor', skill: 'Python', experience: '3 years', location: 'Bahir Dar' },
                { name: 'Daniel K.', role: 'Mentee', skill: 'Web Dev', experience: '1 year', location: 'Mekelle' }
            ];
            
            matchResults.innerHTML = matches.map(match => `
                <div class="match-card" style="
                    padding: 15px;
                    background: var(--color-surface);
                    border-radius: 8px;
                    margin: 10px 0;
                    border-left: 4px solid var(--color-primary);
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin: 0; color: var(--color-text);">${match.name}</h4>
                            <div style="color: var(--color-text-muted); font-size: 14px;">
                                ${match.role} • ${match.skill} • ${match.location}
                            </div>
                        </div>
                        <button class="connect-match" style="
                            padding: 8px 16px;
                            background: var(--color-primary);
                            color: var(--color-bg);
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                        ">Connect</button>
                    </div>
                </div>
            `).join('');
            
            // Add connect functionality
            matchResults.querySelectorAll('.connect-match').forEach(btn => {
                btn.addEventListener('click', function() {
                    const name = this.closest('.match-card').querySelector('h4').textContent;
                    alert(`Connection request sent to ${name}!`);
                });
            });
        });
    }
}

function initAvailabilityStatus() {
    const statusOptions = document.querySelectorAll('.status-option');
    
    statusOptions.forEach(option => {
        option.addEventListener('click', function() {
            const status = this.dataset.status;
            
            // Update all options
            statusOptions.forEach(opt => {
                opt.style.opacity = '0.5';
            });
            this.style.opacity = '1';
            
            // Save status
            localStorage.setItem('user-status', status);
            
            // Show notification
            showNotification(`Status set to: ${status.charAt(0).toUpperCase() + status.slice(1)}`);
        });
    });
    
    // Load saved status
    const savedStatus = localStorage.getItem('user-status') || 'online';
    const savedOption = document.querySelector(`[data-status="${savedStatus}"]`);
    if (savedOption) {
        savedOption.click();
    }
}

// ========== C. DISCUSSION FORUMS ==========
function initDiscussionForums() {
    console.log('💬 Initializing Discussion Forums...');
    
    // C.1 Category filtering
    const categories = document.querySelectorAll('.category');
    categories.forEach(category => {
        category.addEventListener('click', function() {
            categories.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            const categoryType = this.dataset.category;
            loadForumThreads(categoryType);
        });
    });
    
    // Load initial threads
    loadForumThreads('all');
    
    // C.2 Thread voting system
    initThreadVoting();
    
    // C.5 FAQ interactions
    initFAQ();
}

function loadForumThreads(category) {
    const threadsContainer = document.getElementById('forum-threads');
    if (!threadsContainer) return;
    
    // Sample threads
    const threads = {
        'all': [
            { title: 'How to get started with React in Ethiopia?', author: 'Meron A.', replies: 24, votes: 45, time: '2 hours ago' },
            { title: 'Looking for Flutter developers in Addis', author: 'Daniel K.', replies: 12, votes: 31, time: '5 hours ago' },
            { title: 'Ethiopian tech salaries discussion 2025', author: 'Samuel G.', replies: 89, votes: 120, time: '1 day ago' }
        ],
        'jobs': [
            { title: 'React Developer needed - Remote position', author: 'Tech Company', replies: 15, votes: 28, time: '3 hours ago' },
            { title: 'Python Data Scientist in Addis', author: 'Startup Ethiopia', replies: 8, votes: 19, time: '1 day ago' }
        ],
        'projects': [
            { title: 'Open source Ethiopian calendar library', author: 'Open Source Team', replies: 42, votes: 67, time: '2 days ago' },
            { title: 'Collaborate on AgriTech mobile app', author: 'FarmTech Group', replies: 23, votes: 38, time: '3 days ago' }
        ]
    };
    
    const threadList = threads[category] || threads['all'];
    
    threadsContainer.innerHTML = threadList.map(thread => `
        <div class="forum-thread" style="
            padding: 15px;
            background: var(--color-surface);
            border-radius: 8px;
            margin: 10px 0;
            border: 1px solid var(--color-border);
        ">
            <div style="display: flex; gap: 15px;">
                <div class="thread-votes" style="
                    text-align: center;
                    min-width: 60px;
                ">
                    <button class="vote-btn upvote" style="
                        background: none;
                        border: none;
                        color: var(--color-text-muted);
                        cursor: pointer;
                        font-size: 20px;
                    ">↑</button>
                    <div class="vote-count" style="
                        font-weight: bold;
                        color: var(--color-text);
                        margin: 5px 0;
                    ">${thread.votes}</div>
                    <button class="vote-btn downvote" style="
                        background: none;
                        border: none;
                        color: var(--color-text-muted);
                        cursor: pointer;
                        font-size: 20px;
                    ">↓</button>
                </div>
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 8px 0; color: var(--color-text);">
                        ${thread.title}
                    </h4>
                    <div style="color: var(--color-text-muted); font-size: 14px;">
                        Posted by <strong>${thread.author}</strong> • ${thread.time}
                    </div>
                    <div style="margin-top: 10px;">
                        <button class="reply-btn" style="
                            padding: 6px 12px;
                            background: var(--color-surface);
                            border: 1px solid var(--color-border);
                            border-radius: 4px;
                            color: var(--color-text);
                            cursor: pointer;
                            margin-right: 10px;
                        ">
                            <i class="fas fa-reply"></i> Reply
                        </button>
                        <span style="color: var(--color-text-muted); font-size: 14px;">
                            <i class="fas fa-comment"></i> ${thread.replies} replies
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add voting functionality
    initThreadVoting();
}

function initThreadVoting() {
    document.querySelectorAll('.vote-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const voteCount = this.closest('.thread-votes').querySelector('.vote-count');
            let count = parseInt(voteCount.textContent);
            
            if (this.classList.contains('upvote')) {
                count++;
                this.style.color = 'var(--color-success)';
                this.closest('.thread-votes').querySelector('.downvote').style.color = 'var(--color-text-muted)';
            } else {
                count--;
                this.style.color = 'var(--color-danger)';
                this.closest('.thread-votes').querySelector('.upvote').style.color = 'var(--color-text-muted)';
            }
            
            voteCount.textContent = count;
        });
    });
}

function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', function() {
            const isVisible = answer.style.display === 'block';
            answer.style.display = isVisible ? 'none' : 'block';
            question.style.fontWeight = isVisible ? 'normal' : 'bold';
        });
        
        // Hide answers initially
        answer.style.display = 'none';
    });
}

// ========== D. PROJECT COLLABORATION ==========
function initProjectCollaboration() {
   // D.1 Team listings
    loadTeamListings();   
    // D.2 Open source projects
    loadOpenSourceProjects();   
    // D.3 Team matching
    initTeamMatching();
}

function loadTeamListings() {
    const container = document.getElementById('team-listings');
    if (!container) return;
    
    const listings = [
        { title: 'E-commerce Platform', skills: ['React', 'Node.js', 'MongoDB'], members: 2, needed: 3 },
        { title: 'Mobile Health App', skills: ['Flutter', 'Firebase'], members: 1, needed: 2 },
        { title: 'AI Agriculture Tool', skills: ['Python', 'TensorFlow'], members: 3, needed: 1 }
    ];
    
    container.innerHTML = listings.map(listing => `
        <div class="team-listing" style="
            padding: 15px;
            background: var(--color-surface);
            border-radius: 8px;
            margin: 10px 0;
            border-left: 4px solid var(--color-primary);
        ">
            <h4 style="margin: 0 0 10px 0; color: var(--color-text);">${listing.title}</h4>
            <div style="margin-bottom: 10px;">
                ${listing.skills.map(skill => `
                    <span style="
                        display: inline-block;
                        padding: 4px 8px;
                        background: rgba(126, 255, 245, 0.1);
                        color: var(--color-primary);
                        border-radius: 12px;
                        font-size: 12px;
                        margin-right: 5px;
                    ">${skill}</span>
                `).join('')}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="color: var(--color-text-muted); font-size: 14px;">
                    ${listing.members} members • Need ${listing.needed} more
                </div>
                <button class="join-team" style="
                    padding: 6px 12px;
                    background: var(--color-primary);
                    color: var(--color-bg);
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                ">Join Team</button>
            </div>
        </div>
    `).join('');
    
    // Add join functionality
    container.querySelectorAll('.join-team').forEach(btn => {
        btn.addEventListener('click', function() {
            const teamName = this.closest('.team-listing').querySelector('h4').textContent;
            alert(`Request sent to join "${teamName}"!`);
        });
    });
}

function loadOpenSourceProjects() {
    const container = document.getElementById('opensource-projects');
    if (!container) return;
    
    const projects = [
        { name: 'EthioCalendar.js', desc: 'Ethiopian calendar library', stars: 245, contributors: 12 },
        { name: 'AmharicNLP', desc: 'Amharic natural language processing', stars: 189, contributors: 8 },
        { name: 'Chapa-Node', desc: 'Node.js SDK for Chapa payment', stars: 156, contributors: 6 }
    ];
    
    container.innerHTML = projects.map(project => `
        <div class="opensource-project" style="
            padding: 15px;
            background: var(--color-surface);
            border-radius: 8px;
            margin: 10px 0;
        ">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <h4 style="margin: 0 0 5px 0; color: var(--color-text);">${project.name}</h4>
                    <p style="margin: 0; color: var(--color-text-muted); font-size: 14px;">${project.desc}</p>
                </div>
                <div style="text-align: right;">
                    <div style="color: var(--color-primary); font-weight: bold;">
                        <i class="fas fa-star"></i> ${project.stars}
                    </div>
                    <div style="font-size: 12px; color: var(--color-text-muted);">
                        ${project.contributors} contributors
                    </div>
                </div>
            </div>
            <button class="contribute-btn" style="
                margin-top: 10px;
                padding: 8px 16px;
                width: 100%;
                background: rgba(126, 255, 245, 0.1);
                color: var(--color-primary);
                border: 1px solid var(--color-primary);
                border-radius: 6px;
                cursor: pointer;
            ">Contribute to Project</button>
        </div>
    `).join('');
    
    // Add contribute functionality
    container.querySelectorAll('.contribute-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const projectName = this.closest('.opensource-project').querySelector('h4').textContent;
            alert(`Opening contribution page for ${projectName}...`);
        });
    });
}

function initTeamMatching() {
    const findTeamBtn = document.getElementById('find-team-match');
    if (!findTeamBtn) return;
    
    findTeamBtn.addEventListener('click', function() {
        const projectType = document.getElementById('project-type').value;
        const selectedSkills = Array.from(document.querySelectorAll('.skill-tag.selected'))
                                  .map(tag => tag.dataset.skill);
        
        if (!projectType) {
            alert('Please select a project type');
            return;
        }
        
        // Show matching animation
        findTeamBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finding matches...';
        findTeamBtn.disabled = true;
        
        setTimeout(() => {
            // Show results
            alert(`Found 3 teams matching your criteria!\n\nProject type: ${projectType}\nSkills: ${selectedSkills.join(', ') || 'Any'}`);
            
            // Reset button
            findTeamBtn.innerHTML = 'Find Team Match';
            findTeamBtn.disabled = false;
        }, 1500);
    });
    
    // Skill tag selection
    document.querySelectorAll('.skill-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            this.classList.toggle('selected');
            this.style.background = this.classList.contains('selected') 
                ? 'var(--color-primary)' 
                : 'rgba(126, 255, 245, 0.1)';
            this.style.color = this.classList.contains('selected')
                ? 'var(--color-bg)'
                : 'var(--color-primary)';
        });
    });
}

// ========== E. LEARNING GROUPS ==========
function initLearningGroups() {
       // E.1 Study group join buttons
    document.querySelectorAll('.btn-group').forEach(btn => {
        btn.addEventListener('click', function() {
            const groupName = this.closest('.group-card').querySelector('h4').textContent;
            alert(`Joined ${groupName}! Check your email for meeting details.`);
            this.textContent = 'Joined ✓';
            this.disabled = true;
            this.style.background = 'var(--color-success)';
        });
    });
    
    // E.5 Accountability partners
    const findPartnerBtn = document.getElementById('find-partner');
    const partnersList = document.getElementById('partners-list');
    
    if (findPartnerBtn && partnersList) {
        findPartnerBtn.addEventListener('click', function() {
            // Simulate finding partners
            const partners = [
                { name: 'Alex M.', goal: 'Learn React in 3 months', time: 'Evenings' },
                { name: 'Sara T.', goal: 'Build portfolio projects', time: 'Weekends' },
                { name: 'Michael K.', goal: 'Prepare for job interviews', time: 'Mornings' }
            ];
            
            partnersList.innerHTML = partners.map(partner => `
                <div class="partner-card" style="
                    padding: 15px;
                    background: var(--color-surface);
                    border-radius: 8px;
                    margin: 10px 0;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin: 0; color: var(--color-text);">${partner.name}</h4>
                            <div style="color: var(--color-text-muted); font-size: 14px;">
                                ${partner.goal} • Available: ${partner.time}
                            </div>
                        </div>
                        <button class="connect-partner" style="
                            padding: 6px 12px;
                            background: var(--color-primary);
                            color: var(--color-bg);
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                        ">Connect</button>
                    </div>
                </div>
            `).join('');
            
            // Add connect functionality
            partnersList.querySelectorAll('.connect-partner').forEach(btn => {
                btn.addEventListener('click', function() {
                    const partnerName = this.closest('.partner-card').querySelector('h4').textContent;
                    alert(`Connection request sent to ${partnerName}!`);
                });
            });
        });
    }
}

// ========== F. GAMIFICATION SYSTEM ==========
function initGamification() {
    console.log('🎮 Initializing Gamification...');   
    // F.1 Points system
    updateUserPoints();  
    // F.2 Badges interaction
    initBadges(); 
    // F.3 Leaderboards
    loadLeaderboards();
}

function updateUserPoints() {
    const pointsElement = document.getElementById('user-points');
    if (!pointsElement) return;
    
    // Calculate points from localStorage activities
    let totalPoints = 1245; // Base points
    
    // Add points from various activities
    totalPoints += Math.floor(Math.random() * 100); // Random daily bonus
    
    pointsElement.textContent = totalPoints.toLocaleString();
}

function initBadges() {
    const badges = document.querySelectorAll('.badge');
    badges.forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        badge.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        badge.addEventListener('click', function() {
            const badgeName = this.querySelector('.badge-name').textContent;
            const badgeDesc = this.querySelector('.badge-desc').textContent;
            
            alert(`🏆 ${badgeName}\n\n${badgeDesc}\n\nEarn this badge by being active in the community!`);
        });
    });
}

function loadLeaderboards() {
    const container = document.getElementById('leaderboard-list');
    if (!container) return;
    
    const leaderboards = {
        weekly: [
            { rank: 1, name: 'Elias Z.', points: 450 },
            { rank: 2, name: 'Beti T.', points: 380 },
            { rank: 3, name: 'Kaleb M.', points: 320 }
        ],
        monthly: [
            { rank: 1, name: 'Hana S.', points: 1250 },
            { rank: 2, name: 'Solomon A.', points: 980 },
            { rank: 3, name: 'Daniel K.', points: 875 }
        ],
        alltime: [
            { rank: 1, name: 'Samuel G.', points: 5240 },
            { rank: 2, name: 'Marta T.', points: 4875 },
            { rank: 3, name: 'Yohannes T.', points: 4320 }
        ]
    };
    
    // Tab switching
    const tabs = document.querySelectorAll('.lb-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const period = this.dataset.period;
            displayLeaderboard(period, container, leaderboards);
        });
    });
    
    // Load initial leaderboard
    displayLeaderboard('weekly', container, leaderboards);
}
function displayLeaderboard(period, container, leaderboards) {
    const data = leaderboards[period] || leaderboards.weekly;
    
    container.innerHTML = data.map(entry => `
        <div class="leaderboard-entry" style="
            display: flex;
            align-items: center;
            padding: 12px;
            background: ${entry.rank === 1 ? 'rgba(126, 255, 245, 0.1)' : 'transparent'};
            border-radius: 8px;
            margin: 5px 0;
            border-left: ${entry.rank <= 3 ? '4px solid var(--color-primary)' : 'none'};
        ">
            <div style="
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: ${entry.rank === 1 ? 'gold' : entry.rank === 2 ? 'silver' : entry.rank === 3 ? '#cd7f32' : 'var(--color-surface)'};
                color: ${entry.rank <= 3 ? '#000' : 'var(--color-text)'};
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                margin-right: 15px;
            ">${entry.rank}</div>
            <div style="flex: 1;">
                <div style="font-weight: bold; color: var(--color-text);">${entry.name}</div>
                <div style="font-size: 12px; color: var(--color-text-muted);">Top contributor in ${period} leaderboard</div>
            </div>
            <div style="
                background: var(--color-primary);
                color: var(--color-bg);
                padding: 6px 12px;
                border-radius: 20px;
                font-weight: bold;
            ">${entry.points} pts</div>
        </div>
    `).join('');
}

// ========== G. NETWORKING FEATURES ==========
function initNetworkingFeatures() {
    console.log('🤝 Initializing Networking Features...');
    
    // G.1 Virtual coffee matching
    const findCoffeeMatchBtn = document.getElementById('find-coffee-match');
    const coffeeMatchResult = document.getElementById('coffee-match-result');
    
    if (findCoffeeMatchBtn && coffeeMatchResult) {
        findCoffeeMatchBtn.addEventListener('click', function() {
            // Show loading state
            findCoffeeMatchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finding match...';
            findCoffeeMatchBtn.disabled = true;
            
            // Simulate matching process
            setTimeout(() => {
                const matches = [
                    { name: 'Amina K.', role: 'Frontend Developer', location: 'Addis Ababa', interests: ['React', 'Design Systems'] },
                    { name: 'Daniel T.', role: 'Backend Engineer', location: 'Bahir Dar', interests: ['Node.js', 'API Design'] },
                    { name: 'Helen G.', role: 'Data Scientist', location: 'Mekelle', interests: ['Python', 'Machine Learning'] }
                ];
                
                const match = matches[Math.floor(Math.random() * matches.length)];
                
                coffeeMatchResult.innerHTML = `
                    <div class="match-card" style="
                        padding: 20px;
                        background: var(--color-surface);
                        border-radius: 8px;
                        margin-top: 15px;
                        border: 2px solid var(--color-primary);
                        animation: fadeIn 0.5s ease;
                    ">
                        <div style="text-align: center;">
                            <div style="
                                width: 60px;
                                height: 60px;
                                border-radius: 50%;
                                background: var(--color-primary);
                                color: var(--color-bg);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 24px;
                                font-weight: bold;
                                margin: 0 auto 15px auto;
                            ">${match.name.charAt(0)}</div>
                            <h4 style="margin: 0 0 10px 0; color: var(--color-text);">${match.name}</h4>
                            <div style="color: var(--color-text-muted); margin-bottom: 15px;">
                                ${match.role} • ${match.location}
                            </div>
                            <div style="margin-bottom: 20px;">
                                ${match.interests.map(interest => `
                                    <span style="
                                        display: inline-block;
                                        padding: 4px 8px;
                                        background: rgba(126, 255, 245, 0.1);
                                        color: var(--color-primary);
                                        border-radius: 12px;
                                        font-size: 12px;
                                        margin: 0 5px 5px 0;
                                    ">${interest}</span>
                                `).join('')}
                            </div>
                            <div style="display: flex; gap: 10px;">
                                <button class="start-chat" style="
                                    flex: 1;
                                    padding: 10px;
                                    background: var(--color-primary);
                                    color: var(--color-bg);
                                    border: none;
                                    border-radius: 6px;
                                    cursor: pointer;
                                ">
                                    <i class="fas fa-comment"></i> Start Chat
                                </button>
                                <button class="rematch" style="
                                    flex: 1;
                                    padding: 10px;
                                    background: var(--color-surface);
                                    color: var(--color-text);
                                    border: 1px solid var(--color-border);
                                    border-radius: 6px;
                                    cursor: pointer;
                                ">
                                    <i class="fas fa-random"></i> Rematch
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                // Add chat functionality
                coffeeMatchResult.querySelector('.start-chat').addEventListener('click', function() {
                    alert(`Opening chat with ${match.name}...\n\nTip: Schedule a 15-minute virtual coffee chat!`);
                });
                // Add rematch functionality
                coffeeMatchResult.querySelector('.rematch').addEventListener('click', function() {
                    coffeeMatchResult.innerHTML = '';
                    findCoffeeMatchBtn.click();
                });
                
                // Reset button
                findCoffeeMatchBtn.innerHTML = '<i class="fas fa-random"></i> Find Coffee Match';
                findCoffeeMatchBtn.disabled = false;
            }, 1500);
        });
    }   
    // G.2 Interest groups
    const interestTags = document.querySelectorAll('.interest-tag');
    interestTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const interest = this.textContent.replace('#', '');
            showInterestGroup(interest);
        });
    });
    
    // G.5 Job referral system
    initJobReferralSystem();
}

function showInterestGroup(interest) {
    alert(`Joining ${interest} interest group!\n\nYou'll now see:\n• Discussions about ${interest}\n• Related projects\n• Events and meetups\n• Members with similar interests`);
    
    // In a real app, this would add the user to the interest group
    console.log(`User joined interest group: ${interest}`);
}

function initJobReferralSystem() {
    const referralBtns = document.querySelectorAll('.referral-btn');
    const referralBoard = document.getElementById('referral-board');
    
    if (!referralBoard) return;
    
    referralBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.action;
            
            if (action === 'request') {
                showReferralRequestForm();
            } else if (action === 'offer') {
                showReferralOfferForm();
            }
        });
    });
    
    // Load initial referral listings
    loadReferralListings();
}
function loadReferralListings() {
    const referralBoard = document.getElementById('referral-board');
    if (!referralBoard) return;
    
    const listings = [
        { type: 'request', role: 'React Developer', company: 'Tech Startup', location: 'Addis Ababa', user: 'Samuel G.', date: '2 days ago' },
        { type: 'offer', role: 'Python Data Scientist', company: 'Fintech Company', location: 'Remote', user: 'Marta T.', date: '1 day ago' },
        { type: 'request', role: 'DevOps Engineer', company: 'Cloud Provider', location: 'Bahir Dar', user: 'Kaleb M.', date: '3 days ago' }
    ];
    
    referralBoard.innerHTML = listings.map(listing => `
        <div class="referral-listing" style="
            padding: 15px;
            background: var(--color-surface);
            border-radius: 8px;
            margin: 10px 0;
            border-left: 4px solid ${listing.type === 'request' ? 'var(--color-primary)' : 'var(--color-success)'};
        ">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <div style="
                        display: inline-block;
                        padding: 2px 8px;
                        background: ${listing.type === 'request' ? 'rgba(126, 255, 245, 0.1)' : 'rgba(158, 240, 26, 0.1)'};
                        color: ${listing.type === 'request' ? 'var(--color-primary)' : 'var(--color-success)'};
                        border-radius: 12px;
                        font-size: 12px;
                        margin-bottom: 8px;
                    ">
                        ${listing.type === 'request' ? 'Looking for Referral' : 'Offering Referral'}
                    </div>
                    <h4 style="margin: 0 0 5px 0; color: var(--color-text);">${listing.role}</h4>
                    <div style="color: var(--color-text-muted); font-size: 14px;">
                        ${listing.company} • ${listing.location}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 12px; color: var(--color-text-muted);">${listing.date}</div>
                    <div style="font-size: 14px; color: var(--color-text);">${listing.user}</div>
                </div>
            </div>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <button class="apply-referral" style="
                    flex: 1;
                    padding: 8px;
                    background: var(--color-primary);
                    color: var(--color-bg);
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                ">
                    ${listing.type === 'request' ? 'Offer Help' : 'Request Referral'}
                </button>
                <button class="message-user" style="
                    flex: 1;
                    padding: 8px;
                    background: var(--color-surface);
                    color: var(--color-text);
                    border: 1px solid var(--color-border);
                    border-radius: 6px;
                    cursor: pointer;
                ">
                    Message
                </button>
            </div>
        </div>
    `).join('');
    
    // Add button functionality
    referralBoard.querySelectorAll('.apply-referral').forEach(btn => {
        btn.addEventListener('click', function() {
            const role = this.closest('.referral-listing').querySelector('h4').textContent;
            const user = this.closest('.referral-listing').querySelectorAll('div')[1].querySelector('div').textContent;
            alert(`Contacting ${user} about ${role}...`);
        });
    });
    
    referralBoard.querySelectorAll('.message-user').forEach(btn => {
        btn.addEventListener('click', function() {
            const user = this.closest('.referral-listing').querySelectorAll('div')[1].querySelector('div').textContent;
            alert(`Opening chat with ${user}...`);
        });
    });
}

function showReferralRequestForm() {
    const formHTML = `
        <div style="padding: 20px; background: var(--color-surface); border-radius: 8px; margin-top: 15px;">
            <h4 style="margin: 0 0 15px 0; color: var(--color-text);">Request a Job Referral</h4>
            <form id="referral-request-form">
                <input type="text" placeholder="Job Title" style="width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-bg); color: var(--color-text);">
                <input type="text" placeholder="Company Name" style="width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-bg); color: var(--color-text);">
                <textarea placeholder="Why are you interested in this role? What skills do you have?" rows="3" style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-bg); color: var(--color-text); resize: vertical;"></textarea>
                <div style="display: flex; gap: 10px;">
                    <button type="submit" style="flex: 1; padding: 10px; background: var(--color-primary); color: var(--color-bg); border: none; border-radius: 6px; cursor: pointer;">Submit Request</button>
                    <button type="button" class="cancel-form" style="flex: 1; padding: 10px; background: var(--color-surface); color: var(--color-text); border: 1px solid var(--color-border); border-radius: 6px; cursor: pointer;">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    const container = document.querySelector('.referral-options');
    if (container) {
        const existingForm = container.querySelector('#referral-request-form');
        if (!existingForm) {
            container.insertAdjacentHTML('afterend', formHTML);
            
            // Add form submission
            document.getElementById('referral-request-form').addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Referral request submitted! Community members will see your request.');
                this.closest('div').remove();
            });
            
            // Add cancel button
            document.querySelector('.cancel-form').addEventListener('click', function() {
                this.closest('div').remove();
            });
        }
    }
}

function showReferralOfferForm() {
    const formHTML = `
        <div style="padding: 20px; background: var(--color-surface); border-radius: 8px; margin-top: 15px;">
            <h4 style="margin: 0 0 15px 0; color: var(--color-text);">Offer a Job Referral</h4>
            <form id="referral-offer-form">
                <input type="text" placeholder="Your Company" style="width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-bg); color: var(--color-text);">
                <input type="text" placeholder="Job Role" style="width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-bg); color: var(--color-text);">
                <textarea placeholder="Job description and requirements" rows="3" style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-bg); color: var(--color-text); resize: vertical;"></textarea>
                <div style="display: flex; gap: 10px;">
                    <button type="submit" style="flex: 1; padding: 10px; background: var(--color-success); color: var(--color-bg); border: none; border-radius: 6px; cursor: pointer;">Offer Referral</button>
                    <button type="button" class="cancel-form" style="flex: 1; padding: 10px; background: var(--color-surface); color: var(--color-text); border: 1px solid var(--color-border); border-radius: 6px; cursor: pointer;">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    const container = document.querySelector('.referral-options');
    if (container) {
        const existingForm = container.querySelector('#referral-offer-form');
        if (!existingForm) {
            container.insertAdjacentHTML('afterend', formHTML);
            
            // Add form submission
            document.getElementById('referral-offer-form').addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Referral offer posted! Thank you for helping the community.');
                this.closest('div').remove();
                loadReferralListings(); // Refresh listings
            });
            
            // Add cancel button
            document.querySelector('.cancel-form').addEventListener('click', function() {
                this.closest('div').remove();
            });
        }
    }
}

// ========== H. COMMUNITY RESOURCES ==========
function initCommunityResources() {
    console.log('📚 Initializing Community Resources...');
    
    // H.5 Ethiopian government tech policies updates
    const policyUpdates = document.getElementById('policy-updates');
    if (policyUpdates) {
        loadPolicyUpdates();
    }
    
    // H.4 Rate internet providers
    const providerRatings = document.querySelectorAll('.provider .rating');
    providerRatings.forEach(rating => {
        rating.addEventListener('click', function() {
            const provider = this.closest('.provider').querySelector('.provider-name').textContent;
            showRatingModal(provider);
        });
    });
}

function loadPolicyUpdates() {
    const policyUpdates = document.getElementById('policy-updates');
    if (!policyUpdates) return;
    
    const updates = [
        { title: 'New Digital Ethiopia Strategy', date: 'Nov 15, 2025', desc: 'Government announces 5-year digital transformation plan' },
        { title: 'Tech Startup Incentives', date: 'Oct 28, 2025', desc: 'Tax benefits for registered tech startups' },
        { title: 'Data Protection Guidelines', date: 'Sep 10, 2025', desc: 'New personal data protection regulations' }
    ];
    
    policyUpdates.innerHTML = updates.map(update => `
        <div class="policy-update" style="
            padding: 10px;
            border-bottom: 1px solid var(--color-border);
        ">
            <div style="font-weight: bold; color: var(--color-text);">${update.title}</div>
            <div style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 5px;">${update.date}</div>
            <div style="font-size: 14px; color: var(--color-text);">${update.desc}</div>
        </div>
    `).join('');
}

function showRatingModal(provider) {
    const modalHTML = `
        <div class="rating-modal" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        ">
            <div style="
                background: var(--color-surface);
                padding: 25px;
                border-radius: 12px;
                max-width: 400px;
                width: 90%;
                animation: slideUp 0.3s ease;
            ">
                <h3 style="margin: 0 0 15px 0; color: var(--color-text);">Rate ${provider}</h3>
                <p style="color: var(--color-text-muted); margin-bottom: 20px;">Share your experience with this internet provider to help the community</p>
                
                <div style="margin-bottom: 20px; text-align: center;">
                    <div style="font-size: 24px; color: var(--color-text-muted); margin-bottom: 10px;">Your Rating:</div>
                    <div class="star-rating" style="font-size: 30px; color: gold; cursor: pointer;">
                        <span class="star" data-rating="1">★</span>
                        <span class="star" data-rating="2">★</span>
                        <span class="star" data-rating="3">★</span>
                        <span class="star" data-rating="4">★</span>
                        <span class="star" data-rating="5">★</span>
                    </div>
                </div>
                
                <textarea placeholder="Additional comments (optional)" rows="3" style="width: 100%; padding: 10px; margin-bottom: 20px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-bg); color: var(--color-text); resize: vertical;"></textarea>
                
                <div style="display: flex; gap: 10px;">
                    <button class="submit-rating" style="flex: 1; padding: 12px; background: var(--color-primary); color: var(--color-bg); border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Submit Rating</button>
                    <button class="cancel-rating" style="flex: 1; padding: 12px; background: var(--color-surface); color: var(--color-text); border: 1px solid var(--color-border); border-radius: 6px; cursor: pointer;">Cancel</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add star rating functionality
    const stars = document.querySelectorAll('.star');
    let selectedRating = 0;
    
    stars.forEach(star => {
        star.addEventListener('mouseover', function() {
            const rating = parseInt(this.dataset.rating);
            highlightStars(rating);
        });
        
        star.addEventListener('mouseleave', function() {
            highlightStars(selectedRating);
        });
        
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.dataset.rating);
            highlightStars(selectedRating);
        });
    });
    
    function highlightStars(rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.style.color = 'gold';
            } else {
                star.style.color = 'var(--color-text-muted)';
            }
        });
    }
    
    // Submit rating
    document.querySelector('.submit-rating').addEventListener('click', function() {
        if (selectedRating === 0) {
            alert('Please select a rating first!');
            return;
        }
        
        alert(`Thank you for rating ${provider} ${selectedRating} stars!`);
        document.querySelector('.rating-modal').remove();
        
        // Update the displayed rating (in a real app, this would update the backend)
        const providerElement = Array.from(document.querySelectorAll('.provider'))
            .find(p => p.querySelector('.provider-name').textContent === provider);
        
        if (providerElement) {
            const currentRating = parseFloat(providerElement.querySelector('.rating').textContent);
            // Simulate rating update (average of old and new)
            const newRating = ((currentRating * 10) + selectedRating) / 11; // Weighted average
            providerElement.querySelector('.rating').textContent = newRating.toFixed(1) + ' ★';
        }
    });
    
    // Cancel rating
    document.querySelector('.cancel-rating').addEventListener('click', function() {
        document.querySelector('.rating-modal').remove();
    });
}

// ========== I. REALTIME FEATURES ==========
function initRealtimeFeatures() {
    console.log('⚡ Initializing Realtime Features...');
    
    // I.1 Live chat rooms
    initLiveChat();
    
    // I.3 Code pairing sessions
    initCodePairing();
    
    // I.4 Ethiopian tech news feed
    initNewsFeed();
}

function initLiveChat() {
    const chatRooms = document.querySelectorAll('.chat-room');
    const chatContainer = document.getElementById('chat-container');
    
    chatRooms.forEach(room => {
        room.addEventListener('click', function() {
            chatRooms.forEach(r => r.classList.remove('active'));
            this.classList.add('active');
            
            const roomType = this.dataset.room;
            loadChatRoom(roomType, chatContainer);
        });
    });
    
    // Load initial chat room
    if (chatRooms.length > 0) {
        const activeRoom = document.querySelector('.chat-room.active') || chatRooms[0];
        loadChatRoom(activeRoom.dataset.room, chatContainer);
    }
}

function loadChatRoom(roomType, container) {
    if (!container) return;
    
    const roomNames = {
        general: 'General Chat',
        help: 'Help & Support'
    };
    
    const sampleMessages = {
        general: [
            { user: 'Selam G.', message: 'Has anyone attended the Addis Tech Meetup?', time: '14:30' },
            { user: 'Dawit M.', message: 'Yes! It was great. They\'re having another one next week.', time: '14:32' },
            { user: 'Amina K.', message: 'Can someone recommend a good React course in Amharic?', time: '14:35' }
        ],
        help: [
            { user: 'Yohannes T.', message: 'Getting CORS error with my API deployment. Any help?', time: '15:10' },
            { user: 'Meron A.', message: 'Check your server headers. Are you allowing your frontend domain?', time: '15:12' }
        ]
    };
    
    const messages = sampleMessages[roomType] || sampleMessages.general;
    
    container.innerHTML = `
        <div class="chat-header" style="
            padding: 10px;
            border-bottom: 1px solid var(--color-border);
            color: var(--color-text);
            font-weight: bold;
        ">
            <i class="fas fa-comments"></i> ${roomNames[roomType] || roomType}
        </div>
        <div class="chat-messages" style="
            height: 200px;
            overflow-y: auto;
            padding: 10px;
        ">
            ${messages.map(msg => `
                <div class="message" style="margin-bottom: 15px;">
                    <div style="font-weight: bold; color: var(--color-primary);">${msg.user}</div>
                    <div style="
                        background: var(--color-surface);
                        padding: 8px 12px;
                        border-radius: 8px;
                        margin: 5px 0;
                        color: var(--color-text);
                        display: inline-block;
                        max-width: 80%;
                    ">${msg.message}</div>
                    <div style="font-size: 12px; color: var(--color-text-muted);">${msg.time}</div>
                </div>
            `).join('')}
        </div>
        <div class="chat-input" style="
            padding: 10px;
            border-top: 1px solid var(--color-border);
            display: flex;
            gap: 10px;
        ">
            <input type="text" placeholder="Type your message..." style="
                flex: 1;
                padding: 8px 12px;
                border: 1px solid var(--color-border);
                border-radius: 6px;
                background: var(--color-bg);
                color: var(--color-text);
            ">
            <button class="send-message" style="
                padding: 8px 16px;
                background: var(--color-primary);
                color: var(--color-bg);
                border: none;
                border-radius: 6px;
                cursor: pointer;
            ">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    `;
    
    // Add send message functionality
    const sendBtn = container.querySelector('.send-message');
    const input = container.querySelector('input');
    
    if (sendBtn && input) {
        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
        
        function sendMessage() {
            const message = input.value.trim();
            if (!message) return;
            
            const messagesContainer = container.querySelector('.chat-messages');
            const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            
            const messageHTML = `
                <div class="message" style="margin-bottom: 15px; text-align: right;">
                    <div style="font-weight: bold; color: var(--color-primary);">You</div>
                    <div style="
                        background: var(--color-primary);
                        padding: 8px 12px;
                        border-radius: 8px;
                        margin: 5px 0;
                        color: var(--color-bg);
                        display: inline-block;
                        max-width: 80%;
                        margin-left: 20%;
                    ">${message}</div>
                    <div style="font-size: 12px; color: var(--color-text-muted); text-align: right;">${time}</div>
                </div>
            `;
            
            messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
            input.value = '';
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
}

function initCodePairing() {
    const pairingSessions = document.getElementById('pairing-sessions');
    const startPairingBtn = document.getElementById('start-pairing');
    
    if (!pairingSessions || !startPairingBtn) return;
    
    // Load ongoing sessions
    loadPairingSessions();
    
    // Start pairing session
    startPairingBtn.addEventListener('click', function() {
        const languages = ['JavaScript', 'Python', 'Java', 'C#', 'TypeScript'];
        const topics = ['Debugging', 'Code Review', 'Learning', 'Project Work', 'Interview Prep'];
        
        const language = languages[Math.floor(Math.random() * languages.length)];
        const topic = topics[Math.floor(Math.random() * topics.length)];
        
        const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const modalHTML = `
            <div class="pairing-modal" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            ">
                <div style="
                    background: var(--color-surface);
                    padding: 30px;
                    border-radius: 12px;
                    max-width: 500px;
                    width: 90%;
                    text-align: center;
                ">
                    <h3 style="margin: 0 0 15px 0; color: var(--color-text);">
                        <i class="fas fa-code"></i> Start Code Pairing Session
                    </h3>
                    <p style="color: var(--color-text-muted); margin-bottom: 25px;">
                        Share this code with your partner to start pairing:
                    </p>
                    
                    <div style="
                        font-size: 48px;
                        font-weight: bold;
                        color: var(--color-primary);
                        margin: 20px 0;
                        letter-spacing: 10px;
                        font-family: monospace;
                    ">${sessionCode}</div>
                    
                    <div style="
                        background: rgba(126, 255, 245, 0.1);
                        padding: 15px;
                        border-radius: 8px;
                        margin: 20px 0;
                        text-align: left;
                    ">
                        <div style="color: var(--color-text); margin-bottom: 5px;">
                            <strong>Language:</strong> ${language}
                        </div>
                        <div style="color: var(--color-text); margin-bottom: 5px;">
                            <strong>Topic:</strong> ${topic}
                        </div>
                        <div style="color: var(--color-text);">
                            <strong>Participants:</strong> Waiting for partner...
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-top: 25px;">
                        <button class="copy-code" style="
                            flex: 1;
                            padding: 12px;
                            background: var(--color-primary);
                            color: var(--color-bg);
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                        ">
                            <i class="fas fa-copy"></i> Copy Code
                        </button>
                        <button class="close-modal" style="
                            flex: 1;
                            padding: 12px;
                            background: var(--color-surface);
                            color: var(--color-text);
                            border: 1px solid var(--color-border);
                            border-radius: 6px;
                            cursor: pointer;
                        ">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Copy code functionality
        document.querySelector('.copy-code').addEventListener('click', function() {
            navigator.clipboard.writeText(sessionCode).then(() => {
                alert('Code copied to clipboard! Share it with your partner.');
            });
        });
        
        // Close modal
        document.querySelector('.close-modal').addEventListener('click', function() {
            document.querySelector('.pairing-modal').remove();
        });
        
        // Add to ongoing sessions
        addToPairingSessions(sessionCode, language, topic);
    });
}

function loadPairingSessions() {
    const pairingSessions = document.getElementById('pairing-sessions');
    if (!pairingSessions) return;
    
    const sessions = [
        { code: 'REACT24', language: 'JavaScript', topic: 'React Hooks', participants: 2, max: 2 },
        { code: 'PYTH01', language: 'Python', topic: 'Data Analysis', participants: 1, max: 2 },
        { code: 'NODE88', language: 'Node.js', topic: 'API Design', participants: 2, max: 2 }
    ];
    
    pairingSessions.innerHTML = sessions.map(session => `
        <div class="pairing-session" style="
            padding: 15px;
            background: var(--color-surface);
            border-radius: 8px;
            margin: 10px 0;
            border-left: 4px solid var(--color-primary);
        ">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <div style="
                        font-family: monospace;
                        font-size: 24px;
                        font-weight: bold;
                        color: var(--color-primary);
                        margin-bottom: 5px;
                    ">${session.code}</div>
                    <div style="color: var(--color-text); margin-bottom: 5px;">
                        ${session.language} • ${session.topic}
                    </div>
                    <div style="color: var(--color-text-muted); font-size: 14px;">
                        ${session.participants}/${session.max} participants
                    </div>
                </div>
                <button class="join-session" style="
                    padding: 8px 16px;
                    background: ${session.participants >= session.max ? 'var(--color-surface)' : 'var(--color-primary)'};
                    color: ${session.participants >= session.max ? 'var(--color-text-muted)' : 'var(--color-bg)'};
                    border: ${session.participants >= session.max ? '1px solid var(--color-border)' : 'none'};
                    border-radius: 6px;
                    cursor: ${session.participants >= session.max ? 'not-allowed' : 'pointer'};
                " ${session.participants >= session.max ? 'disabled' : ''}>
                    ${session.participants >= session.max ? 'Full' : 'Join'}
                </button>
            </div>
        </div>
    `).join('');
    
    // Add join functionality
    pairingSessions.querySelectorAll('.join-session').forEach(btn => {
        btn.addEventListener('click', function() {
            const sessionCode = this.closest('.pairing-session').querySelector('div[style*="font-family: monospace"]').textContent;
            alert(`Joining code pairing session: ${sessionCode}`);
        });
    });
}

function addToPairingSessions(code, language, topic) {
    const pairingSessions = document.getElementById('pairing-sessions');
    if (!pairingSessions) return;
    
    const sessionHTML = `
        <div class="pairing-session" style="
            padding: 15px;
            background: var(--color-surface);
            border-radius: 8px;
            margin: 10px 0;
            border-left: 4px solid var(--color-success);
            animation: fadeIn 0.5s ease;
        ">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <div style="
                        font-family: monospace;
                        font-size: 24px;
                        font-weight: bold;
                        color: var(--color-success);
                        margin-bottom: 5px;
                    ">${code}</div>
                    <div style="color: var(--color-text); margin-bottom: 5px;">
                        ${language} • ${topic}
                    </div>
                    <div style="color: var(--color-text-muted); font-size: 14px;">
                        1/2 participants
                    </div>
                </div>
                <div style="padding: 8px 0; color: var(--color-text);">Your session</div>
            </div>
        </div>
    `;
    
    pairingSessions.insertAdjacentHTML('afterbegin', sessionHTML);
}

function initNewsFeed() {
    const newsFeed = document.getElementById('news-feed');
    if (!newsFeed) return;
    
    const news = [
        { title: 'Ethiopia Launches National AI Strategy', source: 'Tech Africa', time: '2 hours ago' },
        { title: 'Addis Tech Hub Graduates 100 Developers', source: 'Local News', time: '5 hours ago' },
        { title: 'New Fintech Regulations Announced', source: 'Business Ethiopia', time: '1 day ago' },
        { title: 'Ethiopian Startup Raises $2M Funding', source: 'VC News', time: '2 days ago' }
    ];
    
    newsFeed.innerHTML = news.map(item => `
        <div class="news-item" style="
            padding: 15px;
            border-bottom: 1px solid var(--color-border);
            transition: background 0.3s ease;
        " onmouseover="this.style.background='var(--color-surface)'" onmouseout="this.style.background='transparent'">
            <div style="font-weight: bold; color: var(--color-text); margin-bottom: 5px;">
                ${item.title}
            </div>
            <div style="display: flex; justify-content: space-between;">
                <div style="color: var(--color-text-muted); font-size: 14px;">
                    ${item.source}
                </div>
                <div style="color: var(--color-text-muted); font-size: 14px;">
                    ${item.time}
                </div>
            </div>
        </div>
    `).join('');
}

// ========== UTILITY FUNCTIONS ==========
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.global-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'global-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? 'var(--color-success)' : type === 'error' ? 'var(--color-danger)' : 'var(--color-primary)'};
        color: var(--color-bg);
        border-radius: 8px;
        z-index: 10000;
        animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span style="margin-left: 10px;">${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

function updateEthiopianTime() {
    const timeElement = document.getElementById('ethiopian-time');
    if (!timeElement) return;
    
    // Ethiopian time is UTC+3
    const now = new Date();
    const ethiopianTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    
    const options = { 
        timeZone: 'Africa/Addis_Ababa',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    const timeString = ethiopianTime.toLocaleTimeString('en-US', options);
    timeElement.textContent = timeString;
}

// Join form submission
const joinForm = document.getElementById('community-join-form');
if (joinForm) {
    joinForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const email = this.querySelector('input[type="email"]').value;
        const name = this.querySelector('input[type="text"]').value;
        const skill = this.querySelectorAll('select')[0].value;
        const location = this.querySelectorAll('select')[1].value;
        
        if (!email || !name || !skill || !location) {
            alert('Please fill in all fields!');
            return;
        }
        
        // Show success message
        showNotification(`Welcome ${name}! Your community account has been created.`, 'success');
        
        // Reset form
        this.reset();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // In a real app, this would send data to a backend
        console.log('New member joined:', { email, name, skill, location });
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

