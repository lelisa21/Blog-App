// assets/js/events.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('📅 Ethiopian Tech Events - Initializing...');
    
    // Initialize all features
    initCalendarSystem();
    initEventFiltering();
    initEventCards();
    initEventManagement();
    initEventCreationModal();
    initVirtualEvents();
    initAnalytics();
    initEventFeed();
    
    // Set up theme and navigation
    initThemeToggle();
    initNavigation();
    
    console.log('✅ Events functionality loaded!');
});

// ========== A. CALENDAR SYSTEM ==========
function initCalendarSystem() {
    console.log('📆 Initializing Calendar System...');
    
    // View toggle functionality
    const viewButtons = document.querySelectorAll('.view-btn');
    const calendarViews = document.querySelectorAll('.calendar-view');
    
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            
            // Update active button
            viewButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected view
            calendarViews.forEach(view => view.classList.remove('active'));
            document.getElementById(`${view}-view`).classList.add('active');
            
            // Load data for the view
            loadCalendarView(view);
        });
    });
    
    // Initialize month view
    loadCalendarView('month');
    
    // Calendar navigation
    initCalendarNavigation();
    
    // Ethiopian/Gregorian calendar toggle
    initCalendarToggle();
}

function loadCalendarView(view) {
    switch(view) {
        case 'month':
            generateMonthCalendar();
            break;
        case 'week':
            generateWeekView();
            break;
        case 'list':
            generateListView();
            break;
    }
}

function generateMonthCalendar() {
    const calendarGrid = document.querySelector('.calendar-grid');
    const currentMonthElement = document.getElementById('current-month');
    const now = new Date();
    
    // Set current month
    const monthNames = ["January", "February", "March", "April", "May", "June",
                       "July", "August", "September", "October", "November", "December"];
    currentMonthElement.textContent = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    
    // Clear existing days (except headers)
    const existingDays = calendarGrid.querySelectorAll('.calendar-day');
    existingDays.forEach(day => day.remove());
    
    // Get first day of month and number of days
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = Sunday
    
    // Adjust for Monday start (Ethiopian style)
    const startOffset = startingDay === 0 ? 6 : startingDay - 1;
    
    // Add empty cells for days before month start
    for (let i = 0; i < startOffset; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        // Check if today
        const isToday = day === now.getDate() && new Date().getMonth() === now.getMonth();
        if (isToday) dayElement.classList.add('today');
        
        // Add day number
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);
        
        // Add events for this day (sample data)
        const events = getEventsForDay(day, now.getMonth(), now.getFullYear());
        if (events.length > 0) {
            const eventsContainer = document.createElement('div');
            eventsContainer.className = 'day-events';
            
            // Show event indicators
            events.forEach(event => {
                const eventIndicator = document.createElement('div');
                eventIndicator.className = `event-indicator ${event.type}`;
                eventIndicator.title = event.title;
                eventsContainer.appendChild(eventIndicator);
            });
            
            dayElement.appendChild(eventsContainer);
        }
        
        calendarGrid.appendChild(dayElement);
    }
}

function getEventsForDay(day, month, year) {
    // Sample events - in real app, this would come from a database
    const sampleEvents = [
        { date: { day: 15, month: 2, year: 2026 }, title: 'Ethio-Tech Summit', type: 'conference' },
        { date: { day: 10, month: 2, year: 2026 }, title: 'Flutter Workshop', type: 'workshop' },
        { date: { day: 5, month: 2, year: 2026 }, title: 'AI Meetup', type: 'meetup' },
        { date: { day: 8, month: 2, year: 2026 }, title: 'Virtual Coffee', type: 'meetup' },
        { date: { day: 20, month: 2, year: 2026 }, title: 'Hackathon', type: 'hackathon' },
        { date: { day: 13, month: 2, year: 2026 }, title: 'Enkutatash', type: 'holiday' }
    ];
    
    return sampleEvents.filter(event => 
        event.date.day === day && 
        event.date.month === month && 
        event.date.year === year
    );
}

function generateWeekView() {
    const weekGrid = document.querySelector('.week-grid');
    const currentWeekElement = document.getElementById('current-week');
    
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Start from Monday
    
    // Set week title
    const options = { month: 'short', day: 'numeric' };
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    currentWeekElement.textContent = `Week of ${weekStart.toLocaleDateString('en-US', options)} - ${weekEnd.toLocaleDateString('en-US', options)}`;
    
    // Generate week view
    weekGrid.innerHTML = '';
    
    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(weekStart);
        currentDay.setDate(weekStart.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'week-day';
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'week-day-header';
        dayHeader.innerHTML = `
            <div class="week-day-name">${currentDay.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div class="week-day-date">${currentDay.getDate()}</div>
        `;
        
        const dayEvents = document.createElement('div');
        dayEvents.className = 'week-day-events';
        
        // Add sample events
        const events = getEventsForDay(currentDay.getDate(), currentDay.getMonth(), currentDay.getFullYear());
        events.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = `week-event ${event.type}`;
            eventElement.textContent = event.title;
            dayEvents.appendChild(eventElement);
        });
        
        dayElement.appendChild(dayHeader);
        dayElement.appendChild(dayEvents);
        weekGrid.appendChild(dayElement);
    }
}

function generateListView() {
    const eventsList = document.querySelector('.events-list');
    
    // Sample events for list view
    const events = [
        { date: 'March 15, 2026', title: 'Ethio-Tech Summit 2026', type: 'conference', city: 'Addis Ababa' },
        { date: 'March 10, 2026', title: 'Flutter Mobile Development Workshop', type: 'workshop', city: 'Bahir Dar' },
        { date: 'March 5, 2026', title: 'AI in Ethiopian Agriculture', type: 'meetup', city: 'Virtual' },
        { date: 'March 8, 2026', title: 'Virtual Coffee with Ethiopian Developers', type: 'meetup', city: 'Online' },
        { date: 'March 20, 2026', title: 'Blockchain Hackathon', type: 'hackathon', city: 'Addis Ababa' }
    ];
    
    eventsList.innerHTML = events.map(event => `
        <div class="list-event-item">
            <div class="list-event-date">
                <span class="list-event-month">${event.date.split(' ')[0]}</span>
                <span class="list-event-day">${event.date.split(' ')[1].replace(',', '')}</span>
            </div>
            <div class="list-event-info">
                <h4>${event.title}</h4>
                <div class="list-event-details">
                    <span class="event-type-badge ${event.type}">${event.type}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${event.city}</span>
                </div>
            </div>
            <button class="btn-small view-details-btn">View Details</button>
        </div>
    `).join('');
    
    // Add event listeners for view details buttons
    eventsList.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const eventTitle = this.closest('.list-event-item').querySelector('h4').textContent;
            showEventDetails(eventTitle);
        });
    });
}

function initCalendarNavigation() {
    // Month navigation
    const prevMonthBtn = document.querySelector('.prev-month');
    const nextMonthBtn = document.querySelector('.next-month');
    
    if (prevMonthBtn && nextMonthBtn) {
        let currentDate = new Date();
        
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            generateMonthCalendar();
        });
        
        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            generateMonthCalendar();
        });
    }
    
    // Week navigation
    const prevWeekBtn = document.querySelector('.prev-week');
    const nextWeekBtn = document.querySelector('.next-week');
    
    if (prevWeekBtn && nextWeekBtn) {
        prevWeekBtn.addEventListener('click', () => {
            // Navigate to previous week
            generateWeekView();
        });
        
        nextWeekBtn.addEventListener('click', () => {
            // Navigate to next week
            generateWeekView();
        });
    }
}

function initCalendarToggle() {
    const toggleBtn = document.getElementById('toggle-date-format');
    const gregorianSpan = toggleBtn.querySelector('.gregorian');
    const ethiopianSpan = toggleBtn.querySelector('.ethiopian');
    
    let isEthiopian = false;
    
    toggleBtn.addEventListener('click', function() {
        isEthiopian = !isEthiopian;
        
        if (isEthiopian) {
            gregorianSpan.style.display = 'none';
            ethiopianSpan.style.display = 'inline';
            
            // Convert to Ethiopian calendar
            convertToEthiopianCalendar();
            showNotification('Switched to Ethiopian Calendar');
        } else {
            gregorianSpan.style.display = 'inline';
            ethiopianSpan.style.display = 'none';
            
            // Convert back to Gregorian
            convertToGregorianCalendar();
            showNotification('Switched to Gregorian Calendar');
        }
    });
}

function convertToEthiopianCalendar() {
    // Simplified Ethiopian calendar conversion
    // In a real implementation, use a proper Ethiopian calendar library
    console.log('Converting to Ethiopian calendar...');
    
    // Update month names in calendar
    const ethiopianMonths = ["Mäskäräm", "Təqəmt", "Ḫədar", "Taḫśaś", "Tərr", "Yäkatit", 
                            "Mägabit", "Miyazya", "Gənbot", "Säne", "Ḥamle", "Nähase"];
    
    const currentMonthElement = document.getElementById('current-month');
    const monthText = currentMonthElement.textContent;
    const monthName = monthText.split(' ')[0];
    
    // Find index and convert
    const gregorianMonths = ["January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"];
    
    const monthIndex = gregorianMonths.indexOf(monthName);
    if (monthIndex !== -1) {
        const year = monthText.split(' ')[1];
        // Ethiopian year is 7-8 years behind Gregorian
        const ethiopianYear = parseInt(year) - 8;
        currentMonthElement.textContent = `${ethiopianMonths[monthIndex]} ${ethiopianYear}`;
    }
}

function convertToGregorianCalendar() {
    console.log('Converting back to Gregorian calendar...');
    
    const currentMonthElement = document.getElementById('current-month');
    const monthText = currentMonthElement.textContent;
    
    // Reset to current month
    const now = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June",
                       "July", "August", "September", "October", "November", "December"];
    
    currentMonthElement.textContent = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
}

// ========== B. EVENT FILTERING ==========
function initEventFiltering() {
    console.log('🔍 Initializing Event Filtering...');
    
    // Filter checkboxes
    const filterCheckboxes = document.querySelectorAll('.filter-checkbox input');
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', filterEvents);
    });
    
    // Virtual toggle
    const virtualToggle = document.getElementById('virtual-toggle');
    if (virtualToggle) {
        virtualToggle.addEventListener('change', filterEvents);
    }
    
    // Clear filters button
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
    
    // Sort events dropdown
    const sortSelect = document.getElementById('sort-events');
    if (sortSelect) {
        sortSelect.addEventListener('change', sortEvents);
    }
}

function filterEvents() {
    const eventCards = document.querySelectorAll('.event-card');
    const selectedCities = getSelectedValues('city');
    const selectedTypes = getSelectedValues('type');
    const selectedTech = getSelectedValues('tech');
    const selectedDifficulty = getSelectedValues('difficulty');
    const isVirtualOnly = document.getElementById('virtual-toggle')?.checked || false;
    
    let visibleCount = 0;
    
    eventCards.forEach(card => {
        const cardCity = card.dataset.city;
        const cardType = card.dataset.type;
        const cardTech = card.dataset.tech;
        const cardDifficulty = card.dataset.difficulty;
        const cardMode = card.dataset.mode;
        
        // Check filters
        const cityMatch = selectedCities.length === 0 || selectedCities.includes(cardCity);
        const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(cardType);
        const techMatch = selectedTech.length === 0 || selectedTech.some(tech => cardTech.includes(tech));
        const difficultyMatch = selectedDifficulty.length === 0 || selectedDifficulty.includes(cardDifficulty);
        const virtualMatch = !isVirtualOnly || cardMode === 'virtual';
        
        if (cityMatch && typeMatch && techMatch && difficultyMatch && virtualMatch) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update event count display
    updateEventCount(visibleCount);
}

function getSelectedValues(filterName) {
    const checkboxes = document.querySelectorAll(`input[name="${filterName}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

function clearAllFilters() {
    // Uncheck all filter checkboxes
    document.querySelectorAll('.filter-checkbox input').forEach(cb => {
        cb.checked = cb.name === 'city' && cb.value === 'addis' || 
                     cb.name === 'type' && (cb.value === 'meetup' || cb.value === 'workshop') ||
                     cb.name === 'difficulty' && (cb.value === 'beginner' || cb.value === 'intermediate');
    });
    
    // Reset virtual toggle
    const virtualToggle = document.getElementById('virtual-toggle');
    if (virtualToggle) virtualToggle.checked = false;
    
    // Apply filters
    filterEvents();
    
    showNotification('All filters cleared');
}

function sortEvents() {
    const sortBy = document.getElementById('sort-events').value;
    const eventsContainer = document.querySelector('.events-container');
    const eventCards = Array.from(document.querySelectorAll('.event-card'));
    
    eventCards.sort((a, b) => {
        switch(sortBy) {
            case 'date':
                const dateA = new Date(a.querySelector('.event-countdown').dataset.date);
                const dateB = new Date(b.querySelector('.event-countdown').dataset.date);
                return dateA - dateB;
                
            case 'popularity':
                const countA = parseInt(a.querySelector('.attendee-count').textContent.match(/\d+/)[0]);
                const countB = parseInt(b.querySelector('.attendee-count').textContent.match(/\d+/)[0]);
                return countB - countA;
                
            case 'city':
                return a.dataset.city.localeCompare(b.dataset.city);
                
            case 'type':
                return a.dataset.type.localeCompare(b.dataset.type);
                
            default:
                return 0;
        }
    });
    
    // Reorder in DOM
    eventCards.forEach(card => eventsContainer.appendChild(card));
    
    showNotification(`Sorted by ${sortBy}`);
}

function updateEventCount(count) {
    let countDisplay = document.querySelector('.events-count');
    if (!countDisplay) {
        countDisplay = document.createElement('div');
        countDisplay.className = 'events-count';
        countDisplay.style.cssText = `
            padding: 10px;
            background: var(--color-surface);
            border-radius: 8px;
            margin: 10px 0;
            color: var(--color-text);
            font-weight: bold;
        `;
        document.querySelector('.events-section .section-header').appendChild(countDisplay);
    }
    
    countDisplay.textContent = `Showing ${count} event${count !== 1 ? 's' : ''}`;
}

// ========== C. EVENT CARDS INTERACTIONS ==========
function initEventCards() {
    console.log('🎟️ Initializing Event Cards...');
    
    // Countdown timers
    updateCountdownTimers();
    setInterval(updateCountdownTimers, 60000); // Update every minute
    
    // Interest/Going buttons
    document.querySelectorAll('.action-btn.interested, .action-btn.going').forEach(btn => {
        btn.addEventListener('click', handleEventRSVP);
    });
    
    // Share dropdown functionality
    initShareDropdowns();
    
    // Calendar dropdown functionality
    initCalendarDropdowns();
    
    // Map and meeting links
    initEventLinks();
    
    // Load more events button
    const loadMoreBtn = document.getElementById('load-more-events');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreEvents);
    }
}

function updateCountdownTimers() {
    document.querySelectorAll('.event-countdown').forEach(countdown => {
        const eventDate = new Date(countdown.dataset.date);
        const now = new Date();
        const diffMs = eventDate - now;
        
        if (diffMs > 0) {
            const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            let countdownText = '';
            if (days > 0) {
                countdownText = `${days} day${days !== 1 ? 's' : ''} left`;
            } else if (hours > 0) {
                countdownText = `${hours} hour${hours !== 1 ? 's' : ''} left`;
            } else {
                countdownText = 'Today';
            }
            
            countdown.querySelector('.countdown-timer').textContent = countdownText;
            
            // Color code based on urgency
            if (days <= 1) {
                countdown.style.color = 'var(--color-danger)';
            } else if (days <= 3) {
                countdown.style.color = 'var(--color-warning)';
            }
        } else {
            countdown.innerHTML = '<i class="fas fa-check-circle"></i> <span>Event ended</span>';
            countdown.style.color = 'var(--color-text-muted)';
        }
    });
}

function handleEventRSVP(event) {
    const button = event.target.closest('button');
    const card = button.closest('.event-card');
    const eventTitle = card.querySelector('.event-title').textContent;
    const isGoing = button.classList.contains('going');
    
    // Toggle button state
    if (button.classList.contains('active')) {
        button.classList.remove('active');
        button.innerHTML = isGoing ? 
            '<i class="fas fa-check-circle"></i> Going' : 
            '<i class="far fa-star"></i> Interested';
        
        // Update attendee count
        updateAttendeeCount(card, -1);
        
        showNotification(`Removed RSVP for "${eventTitle}"`);
    } else {
        // Remove active state from other buttons in same card
        card.querySelectorAll('.action-btn.interested, .action-btn.going').forEach(btn => {
            btn.classList.remove('active');
            btn.innerHTML = btn.classList.contains('going') ? 
                '<i class="fas fa-check-circle"></i> Going' : 
                '<i class="far fa-star"></i> Interested';
        });
        
        // Set this button as active
        button.classList.add('active');
        button.innerHTML = isGoing ? 
            '<i class="fas fa-check-circle"></i> Going ✓' : 
            '<i class="fas fa-star"></i> Interested ✓';
        
        // Update attendee count
        updateAttendeeCount(card, 1);
        
        showNotification(`You're ${isGoing ? 'going to' : 'interested in'} "${eventTitle}"`);
    }
}

function updateAttendeeCount(card, change) {
    const countElement = card.querySelector('.attendee-count');
    if (countElement) {
        const currentText = countElement.textContent;
        const match = currentText.match(/\((\d+)\)/);
        if (match) {
            const currentCount = parseInt(match[1]);
            const newCount = Math.max(0, currentCount + change);
            countElement.textContent = `(${newCount})`;
        }
    }
}

function initShareDropdowns() {
    document.querySelectorAll('.action-dropdown.share').forEach(dropdown => {
        const shareBtn = dropdown.querySelector('.action-btn');
        const dropdownContent = dropdown.querySelector('.dropdown-content');
        
        shareBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownContent.classList.toggle('show');
        });
        
        // Copy link functionality
        const copyLinkBtn = dropdownContent.querySelector('.copy-link');
        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const eventCard = dropdown.closest('.event-card');
                const eventTitle = eventCard.querySelector('.event-title').textContent;
                const eventUrl = window.location.href;
                
                navigator.clipboard.writeText(`${eventTitle} - ${eventUrl}`).then(() => {
                    showNotification('Event link copied to clipboard!');
                });
            });
        }
    });
    
    // Close dropdowns when clicking elsewhere
    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-content.show').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    });
}

function initCalendarDropdowns() {
    document.querySelectorAll('.action-dropdown.calendar').forEach(dropdown => {
        const calendarBtn = dropdown.querySelector('.action-btn');
        const dropdownContent = dropdown.querySelector('.dropdown-content');
        
        calendarBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownContent.classList.toggle('show');
        });
        
        // Calendar integration
        const eventCard = dropdown.closest('.event-card');
        const eventTitle = eventCard.querySelector('.event-title').textContent;
        const eventDate = eventCard.querySelector('.event-countdown').dataset.date;
        
        // Google Calendar
        const googleBtn = dropdownContent.querySelector('.google-calendar');
        if (googleBtn) {
            googleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${formatDateForGoogleCalendar(eventDate)}`;
                window.open(googleCalendarUrl, '_blank');
            });
        }
        
        // iCal download
        const icalBtn = dropdownContent.querySelector('.ical');
        if (icalBtn) {
            icalBtn.addEventListener('click', function(e) {
                e.preventDefault();
                downloadICalFile(eventTitle, eventDate);
            });
        }
    });
}

function formatDateForGoogleCalendar(dateString) {
    const date = new Date(dateString);
    const start = date.toISOString().replace(/-|:|\.\d+/g, '');
    const endDate = new Date(date.getTime() + 2 * 60 * 60 * 1000); // +2 hours
    const end = endDate.toISOString().replace(/-|:|\.\d+/g, '');
    return `${start}/${end}`;
}

function downloadICalFile(title, dateString) {
    const date = new Date(dateString);
    const start = date.toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z';
    const endDate = new Date(date.getTime() + 2 * 60 * 60 * 1000);
    const end = endDate.toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z';
    
    const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ETC Events//EN
BEGIN:VEVENT
SUMMARY:${title}
DTSTART:${start}
DTEND:${end}
END:VEVENT
END:VCALENDAR`;
    
    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('iCal file downloaded');
}

function initEventLinks() {
    // Map links
    document.querySelectorAll('.map-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const eventCard = this.closest('.event-card');
            const eventTitle = eventCard.querySelector('.event-title').textContent;
            const eventLocation = eventCard.querySelector('.detail-item:nth-child(2) span').textContent;
            
            alert(`Opening map for: ${eventTitle}\nLocation: ${eventLocation}`);
            // In real app, this would open Google Maps with coordinates
        });
    });
    
    // Meeting links
    document.querySelectorAll('.meeting-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const eventCard = this.closest('.event-card');
            const eventTitle = eventCard.querySelector('.event-title').textContent;
            
            alert(`Joining virtual meeting for: ${eventTitle}\nMeeting link would open here`);
            // In real app, this would redirect to Google Meet/Zoom
        });
    });
}

function loadMoreEvents() {
    const loadMoreBtn = document.getElementById('load-more-events');
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    loadMoreBtn.disabled = true;
    
    // Simulate loading more events
    setTimeout(() => {
        // Add sample events
        const eventsContainer = document.querySelector('.events-container');
        const sampleEvent = document.querySelector('.event-card').cloneNode(true);
        
        // Modify for new event
        sampleEvent.querySelector('.event-title').textContent = 'New AI Conference 2026';
        sampleEvent.querySelector('.event-countdown').dataset.date = '2026-04-10T10:00:00';
        sampleEvent.querySelector('.event-description').textContent = 'New AI conference focusing on Ethiopian applications';
        
        eventsContainer.appendChild(sampleEvent);
        
        // Re-initialize event card interactions
        initEventCards();
        
        loadMoreBtn.innerHTML = 'Load More Events';
        loadMoreBtn.disabled = false;
        
        showNotification('3 more events loaded');
    }, 1500);
}

// ========== D. EVENT CREATION MODAL ==========
function initEventCreationModal() {
    console.log('➕ Initializing Event Creation...');
    
    const submitEventBtn = document.getElementById('submit-event-btn');
    const modal = document.getElementById('event-creation-modal');
    const closeBtns = document.querySelectorAll('.close-modal');
    const form = document.getElementById('event-submission-form');
    
    if (!modal || !submitEventBtn) return;
    
    // Open modal
    submitEventBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
    
    // Close modal
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Event mode radio buttons
    const modeRadios = document.querySelectorAll('input[name="mode"]');
    const locationSection = document.getElementById('location-section');
    
    modeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'virtual') {
                locationSection.style.display = 'none';
            } else {
                locationSection.style.display = 'block';
            }
        });
    });
    
    // Map preview click
    const mapPreview = document.getElementById('location-map-preview');
    if (mapPreview) {
        mapPreview.addEventListener('click', () => {
            alert('Map selection would open here. In a real app, integrate with Google Maps API.');
        });
    }
    
    // Form submission
    if (form) {
        form.addEventListener('submit', handleEventSubmission);
    }
}

async function handleEventSubmission(e) {
    e.preventDefault();

    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value || '09:00';
    const durationHours = Number(document.getElementById('event-duration')?.value || 2);

    const startDate = new Date(`${date}T${time}:00`);
    const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

    const modeInput = document.querySelector('input[name="mode"]:checked');
    const mode = modeInput ? modeInput.value : 'in-person';
    const isVirtual = mode === 'virtual';

    const payload = {
        title: document.getElementById('event-title').value.trim(),
        description: document.getElementById('event-description').value.trim(),
        event_type: document.getElementById('event-type').value,
        venue_name: isVirtual ? 'Online' : document.getElementById('event-venue').value.trim(),
        city: isVirtual ? 'virtual' : document.getElementById('event-city').value,
        address: isVirtual ? '' : document.getElementById('event-venue').value.trim(),
        is_virtual: isVirtual,
        meeting_link: document.getElementById('event-registration-link')?.value.trim() || '',
        start_date: toMysqlDateTime(startDate),
        end_date: toMysqlDateTime(endDate),
        capacity: Number(document.getElementById('event-capacity')?.value || 50),
        registration_fee: Number(document.getElementById('event-fee')?.value || 0)
    };

    if (!payload.title || !payload.description || !payload.event_type || !date || !time) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }

    try {
        const response = await ETCApi.request('/api/events', {
            method: 'POST',
            headers: ETCAuth ? ETCAuth.authHeaders() : {},
            body: payload
        });

        console.log('Event saved:', response);

        showNotification(`Event "${payload.title}" saved successfully!`, 'success');

        document.getElementById('event-creation-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
        e.target.reset();

        // Reload page so the new event appears
        window.location.reload();

    } catch (error) {
        console.error('Event save failed:', error);
        showNotification(error.message || 'Could not save event.', 'error');
    }
}

function toMysqlDateTime(date) {
    const pad = number => String(number).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}
// ========== E. EVENT MANAGEMENT ==========
function initEventManagement() {
    console.log('📋 Initializing Event Management...');
    
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // RSVP actions
    document.querySelectorAll('.reminder-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const eventName = this.closest('.rsvp-item').querySelector('h4').textContent;
            showNotification(`Reminder set for "${eventName}"`);
        });
    });
    
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const rsvpItem = this.closest('.rsvp-item');
            const eventName = rsvpItem.querySelector('h4').textContent;
            
            if (confirm(`Are you sure you want to cancel your RSVP for "${eventName}"?`)) {
                rsvpItem.remove();
                showNotification(`RSVP cancelled for "${eventName}"`);
            }
        });
    });
    
    // Organize first event button
    const organizeBtn = document.getElementById('organize-first-event');
    if (organizeBtn) {
        organizeBtn.addEventListener('click', () => {
            document.getElementById('submit-event-btn').click();
        });
    }
}

// ========== F. EVENT FEED ==========
function initEventFeed() {
    console.log('📰 Initializing Event Feed...');
    
    const feedSources = document.querySelectorAll('.feed-sources span');
    
    feedSources.forEach(source => {
        source.addEventListener('click', function() {
            const sourceType = this.dataset.source;
            
            // Update active source
            feedSources.forEach(s => s.classList.remove('source-active'));
            this.classList.add('source-active');
            
            // Filter feed items
            filterFeedItems(sourceType);
        });
    });
}

function filterFeedItems(sourceType) {
    const feedItems = document.querySelectorAll('.feed-item');
    
    feedItems.forEach(item => {
        if (sourceType === 'all' || item.classList.contains(sourceType)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// ========== G. VIRTUAL EVENTS ==========
function initVirtualEvents() {
    console.log('💻 Initializing Virtual Events...');
    
    // Timezone converter
    const timezoneSelect = document.getElementById('timezone-select');
    if (timezoneSelect) {
        timezoneSelect.addEventListener('change', updateVirtualEventTimes);
    }
    
    // Join meeting button
    document.querySelectorAll('.join-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const eventTitle = this.closest('.virtual-event-card').querySelector('h3').textContent;
            showNotification(`Joining virtual event: ${eventTitle}`);
            // In real app, redirect to meeting URL
        });
    });
    
    // Networking button
    document.querySelectorAll('.network-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            showNotification('Opening networking interface...');
            // In real app, open networking/chat interface
        });
    });
}

function updateVirtualEventTimes() {
    const timezone = document.getElementById('timezone-select').value;
    const timezoneDisplays = document.querySelectorAll('.virtual-event-card .detail-item:nth-child(3) span');
    
    timezoneDisplays.forEach(display => {
        if (timezone === 'eat') {
            display.textContent = 'Also: 12:00 PM EST | 5:00 PM GMT';
        } else if (timezone === 'est') {
            display.textContent = 'Also: 7:00 PM EAT | 5:00 PM GMT';
        } else if (timezone === 'gmt') {
            display.textContent = 'Also: 7:00 PM EAT | 12:00 PM EST';
        }
    });
}

// ========== H. ANALYTICS ==========
function initAnalytics() {
    console.log('📊 Initializing Analytics...');
    
    const analyticsPeriod = document.getElementById('analytics-period');
    if (analyticsPeriod) {
        analyticsPeriod.addEventListener('change', updateAnalytics);
    }
}

function updateAnalytics() {
    const period = document.getElementById('analytics-period').value;
    
    // Update analytics based on period
    const growthStat = document.querySelector('.growth-stat:nth-child(2) .stat-value');
    if (growthStat) {
        if (period === 'month') {
            growthStat.textContent = '+324';
        } else if (period === 'quarter') {
            growthStat.textContent = '+892';
        } else if (period === 'year') {
            growthStat.textContent = '+2,847';
        }
    }
    
    showNotification(`Analytics updated for ${period}`);
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
        color: white;
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

function showEventDetails(eventTitle) {
    alert(`Event Details: ${eventTitle}\n\nMore details would appear here in a full implementation.`);
}

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            showNotification(`Switched to ${newTheme} theme`);
        });
        
        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
    }
}

function initNavigation() {
    // Add active class to current page in nav
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('#nav-placeholder a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .calendar-day {
        animation: fadeIn 0.3s ease;
    }
    
    .event-card {
        animation: fadeIn 0.5s ease;
    }
    
    .modal-content {
        animation: slideInRight 0.3s ease;
    }
`;
document.head.appendChild(style);

console.log('✅ Ethiopian Tech Events functionality complete!');


// ========== BACKEND CONNECTION FOR P-5 EVENTS ==========
// Add this block at the very bottom of assets/js/events.js
window.backendEvents = window.backendEvents || [];

document.addEventListener('DOMContentLoaded', function () {
    setupBackendEventHandlers();
    syncLocationFieldsForEventMode();

    document.querySelectorAll('input[name="mode"]').forEach(radio => {
        radio.addEventListener('change', syncLocationFieldsForEventMode);
    });

    loadEventsFromBackend();
});

function apiAuthHeaders() {
    return window.ETCAuth && typeof ETCAuth.authHeaders === 'function'
        ? ETCAuth.authHeaders()
        : {};
}

async function loadEventsFromBackend() {
    if (!window.ETCApi) {
        console.warn('ETCApi was not found. Make sure assets/js/api.js loads before events.js.');
        return;
    }

    try {
        const response = await ETCApi.request('/api/events', {
            headers: apiAuthHeaders(),
        });

        window.backendEvents = response.data.events || [];
        renderBackendEventCards(window.backendEvents);

        const activeView = document.querySelector('.view-btn.active')?.dataset.view || 'month';
        loadCalendarView(activeView);
    } catch (error) {
        console.error('Could not load events from backend:', error);
        showNotification(error.message || 'Could not load events from backend.', 'error');
    }
}

function renderBackendEventCards(events) {
    const container = document.querySelector('.events-container');
    if (!container) return;

    if (!events.length) {
        container.innerHTML = `
            <div class="empty-events-message">
                <h3>No events found</h3>
                <p>Create the first event using the Submit an Event button.</p>
            </div>
        `;
        updateEventCount(0);
        return;
    }

    container.innerHTML = events.map(event => {
        const type = event.event_type || 'meetup';
        const city = event.city || (event.is_virtual ? 'virtual' : 'other');
        const mode = event.is_virtual ? 'virtual' : 'in-person';
        const goingCount = Number(event.going_count || 0);
        const interestedCount = Number(event.interested_count || 0);
        const mapQuery = [event.venue_name, event.address, cityLabel(city)].filter(Boolean).join(', ');
        const mapUrl = event.is_virtual && event.meeting_link
            ? event.meeting_link
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery || event.title)}`;
        const start = parseEventDate(event.start_date);
        const end = parseEventDate(event.end_date);

        return `
            <div class="event-card ${escapeHtml(type)}" data-event-id="${event.id}" data-city="${escapeHtml(city)}" data-type="${escapeHtml(type)}" data-tech="${escapeHtml(type)}" data-difficulty="intermediate" data-mode="${mode}">
                <div class="event-header">
                    <div class="event-type-badge ${escapeHtml(type)}">${escapeHtml(typeLabel(type))}</div>
                    <div class="event-countdown" data-date="${toInputDateTime(start)}">
                        <i class="fas fa-clock"></i> <span class="countdown-timer">Loading...</span>
                    </div>
                </div>

                <h3 class="event-title">${escapeHtml(event.title)}</h3>
                <p class="event-description">${escapeHtml(event.description || '')}</p>

                <div class="event-details">
                    <div class="detail-item">
                        <i class="fas fa-calendar-day"></i>
                        <span>${escapeHtml(formatEventDateRange(start, end))}</span>
                    </div>
                    <div class="detail-item">
                        <i class="${event.is_virtual ? 'fas fa-video' : 'fas fa-map-marker-alt'}"></i>
                        <span>${escapeHtml(event.is_virtual ? 'Online Event' : (event.venue_name || cityLabel(city)))}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-users"></i>
                        <span>Capacity: ${Number(event.capacity || 0)} attendees</span>
                    </div>
                </div>

                <div class="event-tech-tags">
                    <span class="tech-tag ${escapeHtml(type)}">${escapeHtml(typeLabel(type))}</span>
                    <span class="tech-tag">${escapeHtml(cityLabel(city))}</span>
                </div>

                <div class="event-attendees">
                    <h4>Attendees <span class="attendee-count">(${goingCount})</span></h4>
                    <p>${interestedCount} interested</p>
                </div>

                <div class="event-actions">
                    <button class="action-btn interested ${event.user_rsvp === 'interested' ? 'active' : ''}" data-rsvp-status="interested">
                        <i class="${event.user_rsvp === 'interested' ? 'fas' : 'far'} fa-star"></i> Interested${event.user_rsvp === 'interested' ? ' ✓' : ''}
                    </button>
                    <button class="action-btn going ${event.user_rsvp === 'going' ? 'active' : ''}" data-rsvp-status="going">
                        <i class="fas fa-check-circle"></i> Going${event.user_rsvp === 'going' ? ' ✓' : ''}
                    </button>
                    <button class="action-btn reminder" data-event-id="${event.id}"><i class="far fa-bell"></i> Reminder</button>
                    <button class="action-btn edit-event" data-event-id="${event.id}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="action-btn delete-event" data-event-id="${event.id}"><i class="fas fa-trash"></i> Delete</button>
                    <a href="${escapeHtml(mapUrl)}" target="_blank" class="map-link"><i class="fas fa-map-marked-alt"></i> ${event.is_virtual ? 'Open Link' : 'View Map'}</a>
                </div>
            </div>
        `;
    }).join('');

    updateEventCount(events.length);
    updateCountdownTimers();
}

function setupBackendEventHandlers() {
    document.addEventListener('click', async function (event) {
        const rsvpButton = event.target.closest('.action-btn.interested, .action-btn.going');

        if (rsvpButton) {
            await handleEventRSVP(event);
            return;
        }

        const reminderButton = event.target.closest('.action-btn.reminder');

        if (reminderButton) {
            event.preventDefault();
            await setBackendReminder(reminderButton.dataset.eventId);
            return;
        }

        const editButton = event.target.closest('.action-btn.edit-event');

        if (editButton) {
            event.preventDefault();
            await quickEditBackendEvent(editButton.dataset.eventId);
            return;
        }

        const deleteButton = event.target.closest('.action-btn.delete-event');

        if (deleteButton) {
            event.preventDefault();
            await deleteBackendEvent(deleteButton.dataset.eventId);
        }
    });
}

async function handleEventSubmission(e) {
    e.preventDefault();

    console.log('P-5 form submit started');

    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value || '09:00';
    const durationHours = Number(document.getElementById('event-duration')?.value || 2);

    const mode = document.querySelector('input[name="mode"]:checked')?.value || 'in-person';
    const isVirtual = mode === 'virtual';

    const rawVenue = document.getElementById('event-venue')?.value || '';
    const venueName = rawVenue.trim().slice(0, 190);

    const startDate = new Date(`${date}T${time}:00`);
    const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

    const selectedTech = Array.from(document.querySelectorAll('input[name="tech-stack"]:checked'))
        .map(input => input.value);

    const payload = {
        title: document.getElementById('event-title').value.trim(),
        description: document.getElementById('event-description').value.trim(),
        event_type: document.getElementById('event-type').value,
        venue_name: isVirtual ? 'Online' : (venueName || 'TBD Venue'),
        city: isVirtual ? 'virtual' : document.getElementById('event-city').value,
        address: isVirtual ? '' : venueName,
        is_virtual: isVirtual,
        meeting_link: document.getElementById('event-registration-link')?.value.trim() || '',
        start_date: toMysqlDateTime(startDate),
        end_date: toMysqlDateTime(endDate),
        capacity: Number(document.getElementById('event-capacity')?.value || 50),
        registration_fee: Number(document.getElementById('event-fee')?.value || 0),
        tech_stack: selectedTech
    };

    console.log('P-5 payload:', payload);

    if (!payload.title || !payload.description || !payload.event_type || !date || !time) {
        showNotification('Please fill in title, description, event type, date, and time.', 'error');
        return;
    }

    if (!payload.is_virtual && !payload.city) {
        showNotification('Please select a city.', 'error');
        return;
    }

    try {
        const response = await ETCApi.request('/api/events', {
            method: 'POST',
            headers: apiAuthHeaders(),
            body: payload
        });

        console.log('P-5 event saved:', response);

        showNotification(`Event "${payload.title}" saved to the database!`, 'success');

        document.getElementById('event-creation-modal').style.display = 'none';
        document.body.style.overflow = 'auto';

        e.target.reset();
        syncLocationFieldsForEventMode();

        await loadEventsFromBackend();

    } catch (error) {
        console.error('Event submission failed:', error);
        showNotification(error.message || 'Could not save event.', 'error');
    }
}
async function handleEventRSVP(event) {
    event.preventDefault();

    const button = event.target.closest('button');
    const card = button?.closest('.event-card');
    const eventId = card?.dataset.eventId;
    const eventTitle = card?.querySelector('.event-title')?.textContent || 'this event';

    if (!eventId) return;

    const status = button.dataset.rsvpStatus || (button.classList.contains('going') ? 'going' : 'interested');
    const isCancelling = button.classList.contains('active');

    try {
        button.disabled = true;

        if (isCancelling) {
            await ETCApi.request(`/api/events/${eventId}/rsvp`, {
                method: 'DELETE',
                headers: apiAuthHeaders(),
            });

            showNotification(`RSVP cancelled for "${eventTitle}"`, 'success');
        } else {
            await ETCApi.request(`/api/events/${eventId}/rsvp`, {
                method: 'POST',
                headers: apiAuthHeaders(),
                body: { status },
            });

            showNotification(`You are marked as ${status} for "${eventTitle}"`, 'success');
        }

        await loadEventsFromBackend();
    } catch (error) {
        console.error('RSVP failed:', error);
        showNotification(error.message || 'Could not save RSVP.', 'error');
    } finally {
        button.disabled = false;
    }
}

async function setBackendReminder(eventId) {
    const event = window.backendEvents.find(item => String(item.id) === String(eventId));

    if (!event) return;

    const start = parseEventDate(event.start_date);
    const defaultReminder = new Date(start.getTime() - 24 * 60 * 60 * 1000);
    const entered = prompt('Reminder time (YYYY-MM-DD HH:MM:SS):', toMysqlDateTime(defaultReminder));

    if (entered === null) return;

    try {
        await ETCApi.request(`/api/events/${eventId}/reminder`, {
            method: 'POST',
            headers: apiAuthHeaders(),
            body: { reminder_time: entered },
        });

        showNotification(`Reminder saved for "${event.title}"`, 'success');
    } catch (error) {
        console.error('Reminder failed:', error);
        showNotification(error.message || 'Could not save reminder.', 'error');
    }
}

async function quickEditBackendEvent(eventId) {
    const event = window.backendEvents.find(item => String(item.id) === String(eventId));

    if (!event) return;

    const title = prompt('Event title:', event.title);
    if (title === null) return;

    const description = prompt('Event description:', event.description || '');
    if (description === null) return;

    const startDate = prompt('Start date/time (YYYY-MM-DD HH:MM:SS):', event.start_date);
    if (startDate === null) return;

    const endDate = prompt('End date/time (YYYY-MM-DD HH:MM:SS):', event.end_date);
    if (endDate === null) return;

    try {
        await ETCApi.request(`/api/events/${eventId}`, {
            method: 'PUT',
            headers: apiAuthHeaders(),
            body: {
                title: title.trim(),
                description: description.trim(),
                start_date: startDate.trim(),
                end_date: endDate.trim(),
            },
        });

        showNotification('Event updated successfully.', 'success');
        await loadEventsFromBackend();
    } catch (error) {
        console.error('Update failed:', error);
        showNotification(error.message || 'Could not update event.', 'error');
    }
}

async function deleteBackendEvent(eventId) {
    const event = window.backendEvents.find(item => String(item.id) === String(eventId));
    const eventTitle = event?.title || 'this event';

    if (!confirm(`Delete "${eventTitle}"?`)) return;

    try {
        await ETCApi.request(`/api/events/${eventId}`, {
            method: 'DELETE',
            headers: apiAuthHeaders(),
        });

        showNotification('Event deleted successfully.', 'success');
        await loadEventsFromBackend();
    } catch (error) {
        console.error('Delete failed:', error);
        showNotification(error.message || 'Could not delete event.', 'error');
    }
}

function getEventsForDay(day, month, year) {
    return (window.backendEvents || []).filter(event => {
        const eventDate = parseEventDate(event.start_date);

        return eventDate.getDate() === day &&
            eventDate.getMonth() === month &&
            eventDate.getFullYear() === year;
    }).map(event => ({
        ...event,
        type: event.event_type,
    }));
}

function generateWeekView() {
    const weekGrid = document.querySelector('.week-grid');
    const currentWeekElement = document.getElementById('current-week');

    if (!weekGrid || !currentWeekElement) return;

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    currentWeekElement.textContent = `Week of ${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
    weekGrid.innerHTML = '';

    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(weekStart);
        currentDay.setDate(weekStart.getDate() + i);

        const events = getEventsForDay(
            currentDay.getDate(),
            currentDay.getMonth(),
            currentDay.getFullYear()
        );

        const dayElement = document.createElement('div');
        dayElement.className = 'week-day';

        dayElement.innerHTML = `
            <div class="week-day-header">
                <div class="week-day-name">${currentDay.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div class="week-day-date">${currentDay.getDate()}</div>
            </div>
            <div class="week-day-events">
                ${events.map(event => `
    <span 
        class="p5-event-dot ${p5Escape(event.event_type || 'meetup')}" 
        title="${p5Escape(event.title)}"
    ></span>
`).join('')} || '<small>No events</small>'}
            </div>
        `;

        weekGrid.appendChild(dayElement);
    }
}

function generateListView() {
    const eventsList = document.querySelector('.events-list');

    if (!eventsList) return;

    const events = window.backendEvents || [];

    if (!events.length) {
        eventsList.innerHTML = '<p>No events found.</p>';
        return;
    }

    eventsList.innerHTML = events.map(event => `
        <div class="list-event ${escapeHtml(event.event_type)}">
            <div class="list-event-date">${escapeHtml(formatEventDateRange(parseEventDate(event.start_date), parseEventDate(event.end_date)))}</div>
            <div class="list-event-content">
                <h4>${escapeHtml(event.title)}</h4>
                <p>${escapeHtml(event.description || '')}</p>
                <span class="event-type ${escapeHtml(event.event_type)}">${escapeHtml(typeLabel(event.event_type))}</span>
                <span class="event-city">${escapeHtml(event.is_virtual ? 'Online' : cityLabel(event.city))}</span>
            </div>
        </div>
    `).join('');
}

function loadMoreEvents() {
    showNotification('All events are loaded from the database.', 'success');
}

function syncLocationFieldsForEventMode() {
    const mode = document.querySelector('input[name="mode"]:checked')?.value || 'in-person';
    const isVirtual = mode === 'virtual';
    const locationSection = document.getElementById('location-section');
    const city = document.getElementById('event-city');
    const venue = document.getElementById('event-venue');

    if (locationSection) {
        locationSection.style.display = isVirtual ? 'none' : 'block';
    }

    [city, venue].forEach(field => {
        if (!field) return;

        field.required = !isVirtual;
        field.disabled = isVirtual;
    });
}

function parseEventDate(value) {
    return new Date(String(value).replace(' ', 'T'));
}

function toMysqlDateTime(date) {
    const pad = number => String(number).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

function toInputDateTime(date) {
    const pad = number => String(number).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

function formatEventDateRange(start, end) {
    const datePart = start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    const startTime = start.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });

    const endTime = end.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });

    return `${datePart} | ${startTime} - ${endTime}`;
}

function cityLabel(city) {
    const labels = {
        addis: 'Addis Ababa',
        bahirdar: 'Bahir Dar',
        mekelle: 'Mekelle',
        hawassa: 'Hawassa',
        jimma: 'Jimma',
        virtual: 'Online',
        other: 'Other',
    };

    return labels[city] || city || 'Unknown';
}

function typeLabel(type) {
    const labels = {
        meetup: 'Meetup',
        workshop: 'Workshop',
        hackathon: 'Hackathon',
        conference: 'Conference',
        virtual: 'Virtual Event',
    };

    return labels[type] || type || 'Event';
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


// ===== FINAL P-5 FORM SUBMIT FIX =====
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('event-submission-form');

    if (!form) {
        console.error('P-5 ERROR: event-submission-form was not found.');
        return;
    }

    // Stop browser HTML validation from blocking our JS request silently
    form.setAttribute('novalidate', 'novalidate');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        console.log('P-5 submit handler started');

        const date = document.getElementById('event-date')?.value || '';
        const time = document.getElementById('event-time')?.value || '09:00';
        const durationHours = Number(document.getElementById('event-duration')?.value || 2);

        const startDate = new Date(`${date}T${time}:00`);
        const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

        const mode = document.querySelector('input[name="mode"]:checked')?.value || 'in-person';
        const isVirtual = mode === 'virtual';

        const payload = {
            title: document.getElementById('event-title')?.value.trim() || '',
            description: document.getElementById('event-description')?.value.trim() || '',
            event_type: document.getElementById('event-type')?.value || '',
            venue_name: isVirtual ? 'Online' : (document.getElementById('event-venue')?.value.trim() || 'TBD Venue'),
            city: isVirtual ? 'virtual' : (document.getElementById('event-city')?.value || 'addis'),
            address: isVirtual ? '' : (document.getElementById('event-venue')?.value.trim() || ''),
            is_virtual: isVirtual,
            meeting_link: document.getElementById('event-registration-link')?.value.trim() || '',
            start_date: p5ToMysqlDateTime(startDate),
            end_date: p5ToMysqlDateTime(endDate),
            capacity: Number(document.getElementById('event-capacity')?.value || 50),
            registration_fee: Number(document.getElementById('event-fee')?.value || 0)
        };

        console.log('P-5 payload:', payload);

        if (!payload.title || !payload.description || !payload.event_type || !date) {
            alert('Please fill in event title, description, event type, and date.');
            return;
        }

        try {
            const response = await ETCApi.request('/api/events', {
                method: 'POST',
                headers: window.ETCAuth ? ETCAuth.authHeaders() : {},
                body: payload
            });

            console.log('P-5 event saved:', response);
            alert('Event saved successfully!');

            document.getElementById('event-creation-modal').style.display = 'none';
            document.body.style.overflow = 'auto';

            form.reset();

            if (typeof loadEventsFromBackend === 'function') {
                await loadEventsFromBackend();
            } else {
                window.location.reload();
            }

        } catch (error) {
            console.error('P-5 event save failed:', error);
            alert(error.message || 'Could not save event. Check Console and PHP server.');
        }
    }, true);
});

function p5ToMysqlDateTime(date) {
    const pad = number => String(number).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

// ===== P-5 CALENDAR VIEW FIX: MONTH, WEEK, LIST =====
let p5CalendarDate = new Date();

function initCalendarNavigation() {
    const prevMonthBtn = document.querySelector('.prev-month');
    const nextMonthBtn = document.querySelector('.next-month');
    const prevWeekBtn = document.querySelector('.prev-week');
    const nextWeekBtn = document.querySelector('.next-week');

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            p5CalendarDate.setMonth(p5CalendarDate.getMonth() - 1);
            generateMonthCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            p5CalendarDate.setMonth(p5CalendarDate.getMonth() + 1);
            generateMonthCalendar();
        });
    }

    if (prevWeekBtn) {
        prevWeekBtn.addEventListener('click', () => {
            p5CalendarDate.setDate(p5CalendarDate.getDate() - 7);
            generateWeekView();
        });
    }

    if (nextWeekBtn) {
        nextWeekBtn.addEventListener('click', () => {
            p5CalendarDate.setDate(p5CalendarDate.getDate() + 7);
            generateWeekView();
        });
    }
}

function generateMonthCalendar() {
    const calendarGrid = document.querySelector('.calendar-grid');
    const currentMonthElement = document.getElementById('current-month');

    if (!calendarGrid || !currentMonthElement) return;

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const year = p5CalendarDate.getFullYear();
    const month = p5CalendarDate.getMonth();

    currentMonthElement.textContent = `${monthNames[month]} ${year}`;

    calendarGrid.querySelectorAll('.calendar-day, .calendar-placeholder').forEach(item => item.remove());

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const startingDay = firstDay.getDay();
    const startOffset = startingDay === 0 ? 6 : startingDay - 1;

    for (let i = 0; i < startOffset; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDay = new Date(year, month, day);
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';

        const today = new Date();
        if (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ) {
            dayElement.classList.add('today');
        }

        const events = p5GetEventsForSpecificDate(currentDay);

        dayElement.innerHTML = `
            <div class="day-number">${day}</div>
            <div class="day-events">
                ${events.map(event => `
                    <span 
                        class="p5-event-dot ${p5Escape(event.event_type || 'meetup')}" 
                        title="${p5Escape(event.title)}"
                    ></span>
                `).join('')}
            </div>
        `;

        calendarGrid.appendChild(dayElement);
    }
}

function generateWeekView() {
    const weekGrid = document.querySelector('.week-grid');
    const currentWeekElement = document.getElementById('current-week');

    if (!weekGrid || !currentWeekElement) return;

    const weekStart = new Date(p5CalendarDate);
    const day = weekStart.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    weekStart.setDate(weekStart.getDate() + diffToMonday);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    currentWeekElement.textContent = `Week of ${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;

    weekGrid.innerHTML = '';

    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(weekStart);
        currentDay.setDate(weekStart.getDate() + i);

        const events = p5GetEventsForSpecificDate(currentDay);

        const dayElement = document.createElement('div');
        dayElement.className = 'week-day';

        dayElement.innerHTML = `
            <div class="week-day-header">
                <div class="week-day-name">${currentDay.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div class="week-day-date">${currentDay.getDate()}</div>
            </div>
            <div class="week-day-events">
                ${
                    events.length
                        ? events.map(event => `
                            <div class="week-event ${p5Escape(event.event_type || 'meetup')}">
                                <strong>${p5Escape(event.title)}</strong><br>
                                <small>${p5FormatTime(event.start_date)} - ${p5FormatTime(event.end_date)}</small><br>
                                <small>${p5Escape(event.is_virtual ? 'Online' : event.venue_name || event.city || '')}</small>
                            </div>
                        `).join('')
                        : '<small>No events</small>'
                }
            </div>
        `;

        weekGrid.appendChild(dayElement);
    }
}

function generateListView() {
    const eventsList = document.querySelector('.events-list');

    if (!eventsList) return;

    const events = p5GetBackendEvents();

    if (!events.length) {
        eventsList.innerHTML = '<p>No events found.</p>';
        return;
    }

    eventsList.innerHTML = events.map(event => `
        <div class="list-event-item">
            <div class="list-event-date">
                <span class="list-event-month">${p5ParseDate(event.start_date).toLocaleDateString('en-US', { month: 'short' })}</span>
                <span class="list-event-day">${p5ParseDate(event.start_date).getDate()}</span>
            </div>
            <div class="list-event-info">
                <h4>${p5Escape(event.title)}</h4>
                <div class="list-event-details">
                    <span class="event-type-badge ${p5Escape(event.event_type || 'meetup')}">${p5Escape(event.event_type || 'meetup')}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${p5Escape(event.is_virtual ? 'Online' : event.venue_name || event.city || '')}</span>
                    <span><i class="far fa-clock"></i> ${p5FormatTime(event.start_date)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function p5GetBackendEvents() {
    return Array.isArray(window.backendEvents) ? window.backendEvents : [];
}

function p5GetEventsForSpecificDate(date) {
    return p5GetBackendEvents().filter(event => {
        const eventDate = p5ParseDate(event.start_date);

        return (
            eventDate.getFullYear() === date.getFullYear() &&
            eventDate.getMonth() === date.getMonth() &&
            eventDate.getDate() === date.getDate()
        );
    });
}

function p5ParseDate(value) {
    return new Date(String(value || '').replace(' ', 'T'));
}

function p5FormatTime(value) {
    const date = p5ParseDate(value);

    if (isNaN(date.getTime())) return '';

    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    });
}

function p5Escape(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}