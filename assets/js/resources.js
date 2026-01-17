document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initTimeDisplay();
    initLearningPaths();
    initResourceLibrary();
    initToolComparison();
    initInteractiveTutorials();
    initCheatsheetGenerator();
    initTechStackBuilder();
    initCommunityFeatures();
    initPerformanceOptimizations();
    
    // Add CSS for dynamic elements
    addDynamicStyles();
});

// A. Time Display
function initTimeDisplay() {
    function updateEthiopiaTime() {
        const now = new Date();
        // Ethiopia is GMT+3
        const ethiopiaTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
        
        const timeString = ethiopiaTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        document.querySelectorAll('#current-time, #footer-time').forEach(el => {
            if (el) el.textContent = `${timeString} GMT+3`;
        });
    }
    
    updateEthiopiaTime();
    setInterval(updateEthiopiaTime, 60000);
}

// B. Interactive Learning Paths
function initLearningPaths() {
    // Load saved progress
    const paths = ['web', 'mobile', 'ai'];
    paths.forEach(pathId => {
        const savedProgress = localStorage.getItem(`path-${pathId}-progress`);
        if (savedProgress) {
            const progressFill = document.querySelector(`#${pathId}-path .progress-fill`);
            const progressText = document.querySelector(`#${pathId}-path .progress-info span`);
            
            if (progressFill) progressFill.style.width = `${savedProgress}%`;
            if (progressText) progressText.textContent = `${savedProgress}% Complete`;
            
            // Update step status
            updateStepStatus(pathId, parseInt(savedProgress));
        }
    });
    
    // Add click handlers for progress buttons
    document.querySelectorAll('.btn-progress').forEach(button => {
        button.addEventListener('click', function(e) {
            const pathId = e.target.closest('.path-card').id.replace('-path', '');
            updatePathProgress(pathId, 10);
        });
    });
}

function updatePathProgress(pathId, amount) {
    const progressFill = document.querySelector(`#${pathId}-path .progress-fill`);
    const progressText = document.querySelector(`#${pathId}-path .progress-info span`);
    
    if (!progressFill || !progressText) return;
    
    const currentWidth = parseInt(progressFill.style.width) || 0;
    const newWidth = Math.min(100, currentWidth + amount);
    
    progressFill.style.width = `${newWidth}%`;
    progressText.textContent = `${newWidth}% Complete`;
    
    // Save to localStorage
    localStorage.setItem(`path-${pathId}-progress`, newWidth);
    
    // Update step status
    updateStepStatus(pathId, newWidth);
    
    // Show notification
    showNotification(`Progress updated for ${getPathName(pathId)}!`, 'success');
}

function updateStepStatus(pathId, progress) {
    const pathCard = document.getElementById(`${pathId}-path`);
    if (!pathCard) return;
    
    const steps = pathCard.querySelectorAll('.path-steps li');
    const completedSteps = Math.floor((progress / 100) * steps.length);
    
    steps.forEach((step, index) => {
        step.className = '';
        if (index < completedSteps) {
            step.classList.add('completed');
        } else if (index === completedSteps) {
            step.classList.add('in-progress');
        }
    });
}

function getPathName(pathId) {
    const names = {
        'web': 'Web Developer',
        'mobile': 'Mobile Developer',
        'ai': 'AI Track'
    };
    return names[pathId] || pathId;
}

// C. Resource Library
function initResourceLibrary() {
    // Add search functionality
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'resource-search';
    searchInput.placeholder = 'Search Ethiopian tech resources...';
    searchInput.style.cssText = `
        margin: 20px auto;
        display: block;
        padding: 12px 16px;
        width: 90%;
        max-width: 600px;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        background: var(--color-surface);
        color: var(--color-text);
        font-family: var(--font-body);
    `;
    
    const resourcesSection = document.querySelector('.resources-grid-section');
    if (resourcesSection) {
        resourcesSection.insertBefore(searchInput, resourcesSection.querySelector('.resources-grid'));
        
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            document.querySelectorAll('.resource-card').forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(searchTerm) ? 'block' : 'none';
            });
        });
    }
    
    // Add voting system
    document.querySelectorAll('.resource-card').forEach(card => {
        const voteButton = document.createElement('button');
        voteButton.className = 'btn btn-sm btn-secondary';
        voteButton.innerHTML = '<i class="fas fa-thumbs-up"></i> Vote';
        voteButton.style.marginTop = '10px';
        
        voteButton.addEventListener('click', function() {
            const resourceTitle = card.querySelector('h3').textContent;
            voteForResource(resourceTitle);
        });
        
        card.querySelector('.resource-card-body').appendChild(voteButton);
    });
}

function voteForResource(resourceTitle) {
    let votes = JSON.parse(localStorage.getItem('resourceVotes')) || {};
    votes[resourceTitle] = (votes[resourceTitle] || 0) + 1;
    localStorage.setItem('resourceVotes', JSON.stringify(votes));
    
    showNotification(`Thanks for voting for "${resourceTitle}"!`, 'success');
}

// D. Tool Comparison
function initToolComparison() {
    const filterButtons = `
        <div class="tool-filter" style="margin: 20px 0; display: flex; gap: 10px; justify-content: center;">
            <button class="btn btn-sm btn-secondary filter-btn active" data-filter="">All Tools</button>
            <button class="btn btn-sm btn-secondary filter-btn" data-filter="Hosting">Hosting</button>
            <button class="btn btn-sm btn-secondary filter-btn" data-filter="Payment">Payment</button>
            <button class="btn btn-sm btn-secondary filter-btn" data-filter="Framework">Framework</button>
        </div>
    `;
    
    const tableSection = document.querySelector('.tool-comparison-section .comparison-table-container');
    if (tableSection) {
        tableSection.insertAdjacentHTML('beforebegin', filterButtons);
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const filter = this.dataset.filter;
                filterTableRows(filter);
            });
        });
    }
}

function filterTableRows(filter) {
    const rows = document.querySelectorAll('.comparison-table tbody tr');
    rows.forEach(row => {
        const category = row.cells[0].textContent;
        if (!filter || category === filter) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// E. Interactive Tutorials
function initInteractiveTutorials() {
    document.querySelectorAll('.btn-start-tutorial').forEach(button => {
        button.addEventListener('click', function() {
            const tutorialId = this.dataset.tutorial;
            const tutorialCard = this.closest('.tutorial-card');
            const stepsDiv = tutorialCard.querySelector('.tutorial-steps');
            const isVisible = stepsDiv.style.display === 'block';
            
            stepsDiv.style.display = isVisible ? 'none' : 'block';
            this.textContent = isVisible ? 'Start Tutorial' : 'Hide Steps';
            
            if (!isVisible) {
                // Load progress
                const progress = localStorage.getItem(`tutorial-${tutorialId}-progress`) || 0;
                const progressFill = tutorialCard.querySelector('.progress-fill');
                if (progressFill) progressFill.style.width = `${progress}%`;
            }
        });
    });
    
    document.querySelectorAll('.btn-mark-complete').forEach(button => {
        button.addEventListener('click', function() {
            const tutorialCard = this.closest('.tutorial-card');
            const tutorialId = tutorialCard.dataset.tutorial;
            const progressFill = tutorialCard.querySelector('.progress-fill');
            const steps = tutorialCard.querySelectorAll('.tutorial-steps li');
            
            let completed = 0;
            steps.forEach(step => {
                if (step.classList.contains('completed')) completed++;
            });
            
            if (completed < steps.length) {
                steps[completed].classList.add('completed');
                const newProgress = ((completed + 1) / steps.length) * 100;
                
                if (progressFill) progressFill.style.width = `${newProgress}%`;
                localStorage.setItem(`tutorial-${tutorialId}-progress`, newProgress);
                
                if (newProgress === 100) {
                    awardAchievement('Tutorial Complete');
                    showNotification('🎉 Tutorial completed! Achievement unlocked!', 'success');
                    this.disabled = true;
                    this.textContent = 'Completed!';
                }
            }
        });
    });
}

// F. Cheatsheet Generator
function initCheatsheetGenerator() {
    const generateBtn = document.getElementById('generateCheatsheet');
    const downloadBtn = document.getElementById('downloadCheatsheet');
    const cheatsheetType = document.getElementById('cheatsheetType');
    const output = document.getElementById('cheatsheetOutput');
    
    if (!generateBtn) return;
    
    generateBtn.addEventListener('click', function() {
        const type = cheatsheetType.value;
        if (!type) {
            showNotification('Please select a cheatsheet type', 'error');
            return;
        }
        
        const cheatsheet = generateCheatsheet(type);
        output.innerHTML = cheatsheet;
    });
    
    downloadBtn.addEventListener('click', function() {
        if (!output.innerHTML.includes('cheatsheet-content')) {
            showNotification('Generate a cheatsheet first', 'error');
            return;
        }
        
        downloadCheatsheet();
    });
}

function generateCheatsheet(type) {
    const cheatsheets = {
        'tech-stack': {
            title: 'Ethiopian Tech Stack Reference',
            content: `
                <h3>Recommended Stack for Ethiopian Market</h3>
                <ul>
                    <li><strong>Frontend:</strong> React.js (highest demand in Addis)</li>
                    <li><strong>Backend:</strong> Node.js/Express or Python/Django</li>
                    <li><strong>Mobile:</strong> Flutter (90% Android market share)</li>
                    <li><strong>Database:</strong> PostgreSQL (free) or MongoDB</li>
                    <li><strong>Hosting:</strong> HahuCloud (local, best support)</li>
                    <li><strong>Payments:</strong> Chapa API (most popular)</li>
                </ul>
            `
        },
        'deployment': {
            title: 'Ethiopian Deployment Guide',
            content: `
                <h3>Deployment Commands</h3>
                <pre><code>
# HahuCloud Deployment
git remote add hahucloud ssh://git@hahucloud.et:repo.git
git push hahucloud main

# Yegara Host Setup
ssh user@yegara.et
cd /var/www/your-project
git pull origin main
npm install
pm2 restart app
                </code></pre>
            `
        },
        'apis': {
            title: 'Ethiopian APIs Reference',
            content: `
                <h3>Local APIs for Ethiopian Developers</h3>
                <ul>
                    <li><strong>Chapa API:</strong> Payment processing</li>
                    <li><strong>HelloCash API:</strong> Mobile money</li>
                    <li><strong>TeleBirr API:</strong> Ethiopian telecom payment</li>
                    <li><strong>National Bank API:</strong> Exchange rates</li>
                </ul>
            `
        }
    };
    
    const cheatsheet = cheatsheets[type] || {
        title: 'Cheatsheet',
        content: 'Select a valid cheatsheet type'
    };
    
    return `
        <div class="cheatsheet-content">
            <h3>${cheatsheet.title}</h3>
            ${cheatsheet.content}
            <div class="cheatsheet-footer">
                <small>Generated by Ethiopian Tech Camp • ${new Date().toLocaleDateString()}</small>
            </div>
        </div>
    `;
}

function downloadCheatsheet() {
    const content = document.querySelector('.cheatsheet-content').outerHTML;
    const blob = new Blob([`<!DOCTYPE html><html><body>${content}</body></html>`], 
        { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ethiopian-cheatsheet-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Cheatsheet downloaded!', 'success');
}

// G. Tech Stack Builder
function initTechStackBuilder() {
    const stackArea = document.getElementById('stackArea');
    if (!stackArea) return;
    
    // Make components draggable
    document.querySelectorAll('.component-item').forEach(item => {
        item.setAttribute('draggable', 'true');
        
        item.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', JSON.stringify({
                id: this.dataset.component,
                category: this.dataset.category,
                name: this.querySelector('span').textContent,
                icon: this.querySelector('i').className
            }));
        });
    });
    
    // Setup drop area
    stackArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });
    
    stackArea.addEventListener('dragleave', function() {
        this.classList.remove('drag-over');
    });
    
    stackArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        const componentData = JSON.parse(e.dataTransfer.getData('text/plain'));
        addToStack(componentData);
    });
    
    // Button handlers
    document.getElementById('saveStack')?.addEventListener('click', saveStack);
    document.getElementById('clearStack')?.addEventListener('click', clearStack);
    document.getElementById('exportStack')?.addEventListener('click', exportStack);
}

function addToStack(component) {
    const stackArea = document.getElementById('stackArea');
    
    // Check if already exists
    const existing = stackArea.querySelector(`[data-component="${component.id}"]`);
    if (existing) {
        showNotification('Component already in stack', 'error');
        return;
    }
    
    // Remove empty message
    const emptyMsg = stackArea.querySelector('.empty-stack');
    if (emptyMsg) emptyMsg.remove();
    
    // Add component to stack
    const stackItem = document.createElement('div');
    stackItem.className = 'stack-item';
    stackItem.dataset.component = component.id;
    stackItem.innerHTML = `
        <i class="${component.icon}"></i>
        <div>
            <strong>${component.name}</strong>
            <small>${component.category}</small>
        </div>
        <button class="btn-remove">&times;</button>
    `;
    
    stackItem.querySelector('.btn-remove').addEventListener('click', function() {
        stackItem.remove();
        if (!stackArea.querySelector('.stack-item')) {
            stackArea.innerHTML = '<p class="empty-stack">Drag components here to build your stack</p>';
        }
        generateStackConfig();
    });
    
    stackArea.appendChild(stackItem);
    generateStackConfig();
}

function generateStackConfig() {
    const stackItems = document.querySelectorAll('.stack-item');
    if (stackItems.length === 0) {
        document.getElementById('stackOutput').style.display = 'none';
        return;
    }
    
    const config = {
        name: 'Ethiopian Tech Stack',
        components: Array.from(stackItems).map(item => ({
            id: item.dataset.component,
            name: item.querySelector('strong').textContent,
            category: item.querySelector('small').textContent
        })),
        generated: new Date().toISOString(),
        recommendations: [
            'Optimize for 3G internet speeds',
            'Implement offline functionality',
            'Support Amharic language',
            'Use local hosting for better latency'
        ]
    };
    
    const output = document.getElementById('stackOutput');
    const configElement = document.getElementById('stackConfig');
    
    configElement.textContent = JSON.stringify(config, null, 2);
    output.style.display = 'block';
}

function saveStack() {
    const stackItems = document.querySelectorAll('.stack-item');
    if (stackItems.length === 0) {
        showNotification('Add components to your stack first', 'error');
        return;
    }
    
    const stackName = prompt('Name your tech stack:', 'My Ethiopian Stack');
    if (!stackName) return;
    
    const stacks = JSON.parse(localStorage.getItem('savedStacks')) || [];
    const stack = {
        id: Date.now(),
        name: stackName,
        components: Array.from(stackItems).map(item => ({
            id: item.dataset.component,
            name: item.querySelector('strong').textContent,
            category: item.querySelector('small').textContent
        })),
        created: new Date().toISOString()
    };
    
    stacks.push(stack);
    localStorage.setItem('savedStacks', JSON.stringify(stacks));
    
    showNotification(`Stack "${stackName}" saved!`, 'success');
}

function clearStack() {
    if (confirm('Clear your current tech stack?')) {
        const stackArea = document.getElementById('stackArea');
        stackArea.innerHTML = '<p class="empty-stack">Drag components here to build your stack</p>';
        document.getElementById('stackOutput').style.display = 'none';
    }
}

function exportStack() {
    const configElement = document.getElementById('stackConfig');
    if (!configElement || !configElement.textContent) {
        showNotification('Build a stack first', 'error');
        return;
    }
    
    const blob = new Blob([configElement.textContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ethiopian-stack-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Stack exported!', 'success');
}

// H. Community Features
function initCommunityFeatures() {
    // Rating system
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            ratePage(rating);
            
            // Update star display
            const stars = this.parentElement.querySelectorAll('.star');
            stars.forEach((s, index) => {
                s.style.color = index < rating ? 'var(--color-accent)' : 'var(--color-text-muted)';
            });
            
            document.querySelector('.rating-text').textContent = `You rated: ${rating}/5`;
        });
    });
    
    // Achievement checking
    checkAchievements();
    
    // Skill verification
    document.querySelectorAll('[data-skill]').forEach(button => {
        button.addEventListener('click', function() {
            const skill = this.dataset.skill;
            requestSkillVerification(skill);
        });
    });
}

function ratePage(rating) {
    const pageRatings = JSON.parse(localStorage.getItem('pageRatings')) || {};
    pageRatings['resources'] = rating;
    localStorage.setItem('pageRatings', JSON.stringify(pageRatings));
    
    showNotification(`Thanks for your ${rating} star rating!`, 'success');
}

function checkAchievements() {
    const achievements = [
        { id: 'first_visit', name: 'First Resource', condition: () => true },
        { id: 'tutorial_complete', name: 'Tutorial Complete', condition: () => {
            const tutorials = ['ethio-website', 'mobile-app'];
            return tutorials.some(t => localStorage.getItem(`tutorial-${t}-progress`) === '100');
        }},
        { id: 'stack_built', name: 'Stack Builder', condition: () => {
            return document.querySelectorAll('.stack-item').length >= 3;
        }}
    ];
    
    achievements.forEach(achievement => {
        if (achievement.condition()) {
            const badge = document.querySelector(`[data-achieved="false"]`);
            if (badge) {
                badge.dataset.achieved = 'true';
                badge.style.opacity = '1';
                badge.style.borderColor = 'var(--color-success)';
            }
        }
    });
}

function requestSkillVerification(skill) {
    const skillNames = {
        'html_css': 'HTML/CSS',
        'javascript': 'JavaScript',
        'react': 'React.js'
    };
    
    const skillName = skillNames[skill] || skill;
    
    if (confirm(`Request verification for ${skillName}?`)) {
        showNotification(`Verification requested for ${skillName}!`, 'success');
        awardAchievement('Skill Verification Requested');
    }
}

function awardAchievement(name) {
    const achievements = JSON.parse(localStorage.getItem('achievements')) || [];
    if (!achievements.includes(name)) {
        achievements.push(name);
        localStorage.setItem('achievements', JSON.stringify(achievements));
        
        showNotification(`🏆 Achievement unlocked: ${name}`, 'success');
    }
}

// I. Performance Optimizations
function initPerformanceOptimizations() {
    // Lazy load images
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // Offline detection
    window.addEventListener('online', () => {
        showNotification('Back online! Resources synced.', 'success');
    });
    
    window.addEventListener('offline', () => {
        showNotification('You are offline. Some features limited.', 'error');
    });
    
    // Save form data for recovery
    document.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('input', function() {
            const form = this.closest('form');
            if (form) {
                saveFormState(form);
            }
        });
    });
    
    // Restore form data
    restoreFormState();
}

function saveFormState(form) {
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => data[key] = value);
    localStorage.setItem(`form-${form.id || 'default'}`, JSON.stringify(data));
}

function restoreFormState() {
    document.querySelectorAll('form').forEach(form => {
        const saved = localStorage.getItem(`form-${form.id || 'default'}`);
        if (saved) {
            const data = JSON.parse(saved);
            Object.keys(data).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) field.value = data[key];
            });
        }
    });
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.ethiopian-notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `ethiopian-notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function addDynamicStyles() {
    const styles = `
        .ethiopian-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: var(--radius-md);
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            box-shadow: var(--shadow-md);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        }
        
        .ethiopian-notification.success {
            border-left: 4px solid var(--color-success);
        }
        
        .ethiopian-notification.error {
            border-left: 4px solid var(--color-danger);
        }
        
        .notification-close {
            background: none;
            border: none;
            color: var(--color-text-muted);
            cursor: pointer;
            font-size: 18px;
            padding: 0 4px;
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .tutorial-card {
            margin-bottom: 20px;
            transition: var(--transition-normal);
        }
        
        .tutorial-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }
        
        .tutorial-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .tutorial-meta {
            display: flex;
            gap: 15px;
            margin: 10px 0;
            color: var(--color-text-secondary);
            font-size: 0.9em;
        }
        
        .tutorial-steps ol {
            margin: 15px 0;
            padding-left: 20px;
        }
        
        .tutorial-steps li {
            margin: 8px 0;
            padding: 8px;
            border-radius: var(--radius-sm);
            transition: var(--transition-fast);
        }
        
        .tutorial-steps li.completed {
            background: var(--color-success);
            color: white;
            text-decoration: line-through;
        }
        
        .tutorial-progress {
            margin-top: 15px;
        }
        
        .progress-bar {
            height: 8px;
            background: var(--color-surface);
            border-radius: var(--radius-full);
            overflow: hidden;
            margin-bottom: 10px;
        }
        
        .progress-fill {
            height: 100%;
            background: var(--gradient-primary);
            transition: width 0.3s ease;
        }
        
        .cheatsheet-content {
            padding: 20px;
            background: var(--color-card);
            border-radius: var(--radius-md);
            margin-top: 15px;
        }
        
        .cheatsheet-content pre {
            background: var(--color-surface);
            padding: 15px;
            border-radius: var(--radius-sm);
            overflow-x: auto;
            margin: 10px 0;
        }
        
        .cheatsheet-footer {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid var(--color-border);
            color: var(--color-text-muted);
            font-size: 0.9em;
        }
        
        .stack-builder-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }
        
        @media (max-width: 768px) {
            .stack-builder-container {
                grid-template-columns: 1fr;
            }
        }
        
        .component-item {
            padding: 12px;
            margin: 8px 0;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-sm);
            cursor: grab;
            transition: var(--transition-fast);
        }
        
        .component-item:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-sm);
            border-color: var(--color-primary);
        }
        
        .component-item:active {
            cursor: grabbing;
        }
        
        .stack-area {
            min-height: 200px;
            padding: 20px;
            border: 2px dashed var(--color-border);
            border-radius: var(--radius-md);
            margin: 15px 0;
            transition: var(--transition-fast);
        }
        
        .stack-area.drag-over {
            border-color: var(--color-primary);
            background: var(--color-hover);
        }
        
        .stack-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            margin: 8px 0;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-sm);
        }
        
        .stack-item .btn-remove {
            margin-left: auto;
            background: none;
            border: none;
            color: var(--color-danger);
            cursor: pointer;
            font-size: 18px;
        }
        
        .stack-actions {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }
        
        .stack-output {
            margin-top: 20px;
            padding: 20px;
        }
        
        .stack-output pre {
            background: var(--color-surface);
            padding: 15px;
            border-radius: var(--radius-sm);
            overflow-x: auto;
            margin: 10px 0;
            font-size: 0.9em;
        }
        
        .community-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .community-card {
            padding: 20px;
            transition: var(--transition-normal);
        }
        
        .community-card:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-md);
        }
        
        .community-card-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .stars {
            display: flex;
            gap: 5px;
            margin: 10px 0;
        }
        
        .star {
            font-size: 24px;
            color: var(--color-text-muted);
            cursor: pointer;
            transition: var(--transition-fast);
        }
        
        .star:hover {
            color: var(--color-accent);
            transform: scale(1.2);
        }
        
        .achievements-preview {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }
        
        .achievement-badge {
            padding: 8px 12px;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-sm);
            display: flex;
            align-items: center;
            gap: 8px;
            opacity: 0.5;
            transition: var(--transition-fast);
        }
        
        .achievement-badge[data-achieved="true"] {
            opacity: 1;
            border-color: var(--color-success);
            background: var(--color-success);
            color: white;
        }
        
        .verification-options {
            display: flex;
            gap: 8px;
            margin-top: 15px;
            flex-wrap: wrap;
        }
        
        .btn-sm {
            padding: 6px 12px;
            font-size: 0.9em;
        }
        
        .button-group {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        
        .resource-search:focus {
            outline: none;
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px rgba(126, 255, 245, 0.2);
        }
        
        .tool-filter {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin: 20px 0;
            flex-wrap: wrap;
        }
        
        .filter-btn.active {
            background: var(--color-primary);
            color: var(--color-bg);
            border-color: var(--color-primary);
        }
        
        .section-card {
            margin: 40px 0;
            padding: 30px;
            background: var(--gradient-card);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-sm);
        }
        
        .glass {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        [data-theme="light"] .glass {
            background: rgba(255, 255, 255, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}
