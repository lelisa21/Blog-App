/**
 * community.js - Community page functionality
 * Handles user posts feed, like/comment interactions, member list, join button effects, and community features
 */

/**
 * CommunityController - Manages community page functionality
 */
class CommunityController {
  constructor() {
    this.members = [];
    this.posts = [];
    this.currentUser = null;
    this.init();
  }

  init() {
    this.initMemberDirectory();
    this.initMemberSearch();
    this.initActivityFeed();
    this.initDiscussionForums();
    this.initProjectCollaboration();
    this.initGamification();
    this.initNetworking();
    this.initJoinForm();
    this.initLiveFeatures();
    this.initMentorMatching();
  }

  /**
   * Initialize member directory with search and filters
   */
  initMemberDirectory() {
    this.loadMembers();
    this.renderMembers();
  }

  /**
   * Load members from DOM or generate sample data
   */
  loadMembers() {
    const memberCards = document.querySelectorAll(
      ".developer-card, .member-card"
    );

    if (memberCards.length > 0) {
      this.members = Array.from(memberCards).map((card) => ({
        element: card,
        name:
          card.querySelector(".developer-name, .name, h3")?.textContent || "",
        title:
          card.querySelector(".developer-title, .title")?.textContent || "",
        location:
          card.querySelector(".developer-location, .location")?.textContent ||
          "",
        skills: Array.from(card.querySelectorAll(".skill-tag, .skill")).map(
          (s) => s.textContent.toLowerCase()
        ),
        avatar: card.querySelector("img")?.src || "",
        status: card
          .querySelector(".status-indicator")
          ?.classList.contains("online")
          ? "online"
          : "offline",
      }));
    } else {
      // Generate sample members if none exist
      this.members = this.generateSampleMembers();
    }
  }

  /**
   * Generate sample members for demonstration
   */
  generateSampleMembers() {
    const cities = ["Addis Ababa", "Bahir Dar", "Mekelle", "Hawassa", "Jimma"];
    const skills = ["react", "node.js", "python", "flutter", "ai", "devops"];

    return Array.from({ length: 20 }, (_, i) => ({
      name: `Developer ${i + 1}`,
      title: "Software Developer",
      location: cities[Math.floor(Math.random() * cities.length)],
      skills: skills.slice(0, Math.floor(Math.random() * 3) + 2),
      status: Math.random() > 0.5 ? "online" : "offline",
    }));
  }

  /**
   * Render members in directory
   */
  renderMembers() {
    const directory = document.querySelector(
      ".member-directory, .developers-grid"
    );
    if (!directory) return;

    // Clear existing (if dynamically rendering)
    const existingCards = directory.querySelectorAll(
      ".developer-card, .member-card"
    );
    if (existingCards.length === 0) {
      // Render members if container is empty
      this.members.forEach((member) => {
        const card = this.createMemberCard(member);
        directory.appendChild(card);
      });
    }
  }

  /**
   * Create member card element
   */
  createMemberCard(member) {
    const card = document.createElement("div");
    card.className = "developer-card";
    card.innerHTML = `
            <div class="developer-header">
                <div class="developer-avatar">${member.name.charAt(0)}</div>
                <span class="status-indicator ${member.status}"></span>
            </div>
            <h3>${member.name}</h3>
            <p class="developer-title">${member.title}</p>
            <p class="developer-location">${member.location}</p>
            <div class="developer-skills">
                ${member.skills
                  .map((skill) => `<span class="skill-tag">${skill}</span>`)
                  .join("")}
            </div>
        `;
    return card;
  }

  /**
   * Initialize member search functionality
   */
  initMemberSearch() {
    const searchInput = document.querySelector("#member-search");
    const skillFilter = document.querySelector("#skill-filter");
    const cityFilter = document.querySelector("#city-filter");
    const availabilityFilter = document.querySelector("#availability-filter");

    if (searchInput) {
      const debouncedSearch = AppUtils.debounce((e) => {
        this.filterMembers(e.target.value);
      }, 300);

      searchInput.addEventListener("input", debouncedSearch);
    }

    if (skillFilter) {
      skillFilter.addEventListener("change", () => {
        this.filterMembers();
      });
    }

    if (cityFilter) {
      cityFilter.addEventListener("change", () => {
        this.filterMembers();
      });
    }

    if (availabilityFilter) {
      availabilityFilter.addEventListener("change", () => {
        this.filterMembers();
      });
    }
  }

  /**
   * Filter members based on search and filters
   */
  filterMembers(searchTerm = "") {
    const skillFilter = document.querySelector("#skill-filter")?.value || "";
    const cityFilter = document.querySelector("#city-filter")?.value || "";
    const availabilityFilter =
      document.querySelector("#availability-filter")?.value || "";

    const filtered = this.members.filter((member) => {
      // Search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          member.name.toLowerCase().includes(searchLower) ||
          member.title.toLowerCase().includes(searchLower) ||
          member.location.toLowerCase().includes(searchLower) ||
          member.skills.some((skill) => skill.includes(searchLower));

        if (!matchesSearch) return false;
      }

      // Skill filter
      if (
        skillFilter &&
        !member.skills.some((skill) => skill.includes(skillFilter))
      ) {
        return false;
      }

      // City filter
      if (cityFilter && !member.location.toLowerCase().includes(cityFilter)) {
        return false;
      }

      // Availability filter
      if (availabilityFilter && member.status !== availabilityFilter) {
        return false;
      }

      return true;
    });

    this.renderFilteredMembers(filtered);
  }

  /**
   * Render filtered members
   */
  renderFilteredMembers(members) {
    const directory = document.querySelector(
      ".developers-grid, .member-directory"
    );
    if (!directory) return;

    // Hide all member cards
    this.members.forEach((member) => {
      if (member.element) {
        member.element.style.display = "none";
      }
    });

    // Show filtered members
    members.forEach((member) => {
      if (member.element) {
        member.element.style.display = "block";
      }
    });
  }

  /**
   * Initialize activity feed
   */
  initActivityFeed() {
    const feedContainer = document.querySelector(
      "#activities-feed, .activities-feed"
    );
    if (!feedContainer) return;

    // Load activities
    const activities = this.loadActivities();
    this.renderActivities(activities, feedContainer);

    // Auto-refresh every 30 seconds
    setInterval(() => {
      const newActivities = this.loadActivities();
      this.renderActivities(newActivities, feedContainer);
    }, 30000);
  }

  /**
   * Load activities (would come from API)
   */
  loadActivities() {
    // Sample activities
    return [
      {
        user: "Selam T.",
        action: "posted a new article",
        time: "5 minutes ago",
      },
      { user: "Dawit M.", action: "joined a project", time: "15 minutes ago" },
      {
        user: "Akila K.",
        action: "commented on a discussion",
        time: "1 hour ago",
      },
    ];
  }

  /**
   * Render activities in feed
   */
  renderActivities(activities, container) {
    container.innerHTML = activities
      .map(
        (activity) => `
            <div class="activity-item">
                <div class="activity-avatar">${activity.user.charAt(0)}</div>
                <div class="activity-content">
                    <strong>${activity.user}</strong> ${activity.action}
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `
      )
      .join("");
  }

  /**
   * Initialize discussion forums
   */
  initDiscussionForums() {
    const categoryButtons = document.querySelectorAll(
      ".category[data-category]"
    );
    const forumThreads = document.querySelector("#forum-threads");

    categoryButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const category = button.dataset.category;
        this.filterForumThreads(category);

        // Update active state
        categoryButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
      });
    });

    // Load threads
    if (forumThreads) {
      this.loadForumThreads(forumThreads);
    }
  }

  /**
   * Filter forum threads by category
   */
  filterForumThreads(category) {
    const threads = document.querySelectorAll(".forum-thread, .thread-item");
    threads.forEach((thread) => {
      if (category === "all" || thread.dataset.category === category) {
        thread.style.display = "block";
      } else {
        thread.style.display = "none";
      }
    });
  }

  /**
   * Load forum threads
   */
  loadForumThreads(container) {
    // Sample threads
    const threads = [
      {
        title: "Best practices for React in Ethiopia?",
        category: "help",
        replies: 12,
      },
      {
        title: "Looking for Flutter developers",
        category: "projects",
        replies: 5,
      },
    ];

    container.innerHTML = threads
      .map(
        (thread) => `
            <div class="forum-thread" data-category="${thread.category}">
                <h4>${thread.title}</h4>
                <span class="thread-replies">${thread.replies} replies</span>
            </div>
        `
      )
      .join("");
  }

  /**
   * Initialize project collaboration features
   */
  initProjectCollaboration() {
    const findTeamBtn = document.querySelector("#find-team-match, .find-team");
    if (findTeamBtn) {
      findTeamBtn.addEventListener("click", () => {
        this.findTeamMatch();
      });
    }

    // Load team listings
    const teamListings = document.querySelector("#team-listings");
    if (teamListings) {
      this.loadTeamListings(teamListings);
    }
  }

  /**
   * Find team match based on skills
   */
  findTeamMatch() {
    const projectType = document.querySelector("#project-type")?.value || "";
    const skillTags = Array.from(
      document.querySelectorAll("#team-skill-tags .skill-tag.active")
    ).map((tag) => tag.dataset.skill);

    // Simulate matching
    const matches = this.members
      .filter((member) => {
        return skillTags.some((skill) => member.skills.includes(skill));
      })
      .slice(0, 5);

    this.displayTeamMatches(matches);
  }

  /**
   * Display team matches
   */
  displayTeamMatches(matches) {
    const resultsContainer = document.querySelector("#match-results");
    if (!resultsContainer) return;

    if (matches.length === 0) {
      resultsContainer.innerHTML =
        "<p>No matches found. Try adjusting your criteria.</p>";
      return;
    }

    resultsContainer.innerHTML = matches
      .map(
        (member) => `
            <div class="match-card">
                <h4>${member.name}</h4>
                <p>${member.title} • ${member.location}</p>
                <button class="btn-primary">Contact</button>
            </div>
        `
      )
      .join("");
  }

  /**
   * Load team listings
   */
  loadTeamListings(container) {
    const listings = [
      {
        project: "E-commerce Platform",
        skills: ["React", "Node.js"],
        members: 2,
        needed: 3,
      },
      { project: "Mobile App", skills: ["Flutter"], members: 1, needed: 2 },
    ];

    container.innerHTML = listings
      .map(
        (listing) => `
            <div class="team-listing">
                <h4>${listing.project}</h4>
                <p>Skills: ${listing.skills.join(", ")}</p>
                <p>${listing.members}/${listing.needed} members</p>
                <button class="btn-primary">Join Team</button>
            </div>
        `
      )
      .join("");
  }

  /**
   * Initialize gamification features
   */
  initGamification() {
    this.updateLeaderboard();
    this.updateUserPoints();
    this.initBadges();
  }

  /**
   * Update leaderboard
   */
  updateLeaderboard() {
    const leaderboard = document.querySelector("#leaderboard-list");
    if (!leaderboard) return;

    const period =
      document.querySelector(".lb-tab.active")?.dataset.period || "weekly";

    // Sample leaderboard data
    const leaders = [
      { name: "Selam T.", points: 1250, rank: 1 },
      { name: "Dawit M.", points: 980, rank: 2 },
      { name: "Akila K.", points: 850, rank: 3 },
    ];

    leaderboard.innerHTML = leaders
      .map(
        (leader) => `
            <div class="leaderboard-item">
                <span class="rank">${leader.rank}</span>
                <span class="name">${leader.name}</span>
                <span class="points">${leader.points} pts</span>
            </div>
        `
      )
      .join("");

    // Period tabs
    document.querySelectorAll(".lb-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document
          .querySelectorAll(".lb-tab")
          .forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        this.updateLeaderboard();
      });
    });
  }

  /**
   * Update user points display
   */
  updateUserPoints() {
    const pointsEl = document.querySelector("#user-points");
    if (!pointsEl) return;

    const points = parseInt(localStorage.getItem("user-points") || "1245");
    pointsEl.textContent = points.toLocaleString();
  }

  /**
   * Initialize badges system
   */
  initBadges() {
    const badges = document.querySelectorAll(".badge[data-badge]");
    badges.forEach((badge) => {
      const badgeId = badge.dataset.badge;
      const earned = localStorage.getItem(`badge-${badgeId}`) === "true";

      if (earned) {
        badge.classList.add("earned");
      }
    });
  }

  /**
   * Initialize networking features
   */
  initNetworking() {
    const coffeeMatchBtn = document.querySelector("#find-coffee-match");
    if (coffeeMatchBtn) {
      coffeeMatchBtn.addEventListener("click", () => {
        this.findCoffeeMatch();
      });
    }
  }

  /**
   * Find virtual coffee match
   */
  findCoffeeMatch() {
    const resultContainer = document.querySelector("#coffee-match-result");
    if (!resultContainer) return;

    // Simulate matching
    const match = this.members[Math.floor(Math.random() * this.members.length)];

    resultContainer.innerHTML = `
            <div class="coffee-match">
                <h4>You've been matched with ${match.name}!</h4>
                <p>${match.title} • ${match.location}</p>
                <button class="btn-primary">Start Chat</button>
            </div>
        `;
  }

  /**
   * Initialize join form
   */
  initJoinForm() {
    const joinForm = document.querySelector("#community-join-form, .join-form");
    if (!joinForm) return;

    joinForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(joinForm);
      const email = joinForm.querySelector('input[type="email"]')?.value;
      const name = joinForm.querySelector('input[type="text"]')?.value;

      // Store in localStorage
      const members = JSON.parse(
        localStorage.getItem("community-members") || "[]"
      );
      if (!members.find((m) => m.email === email)) {
        members.push({ email, name, joined: new Date().toISOString() });
        localStorage.setItem("community-members", JSON.stringify(members));
      }

      // Show success message
      alert("Welcome to the community! Check your email for next steps.");
      joinForm.reset();
    });
  }

  /**
   * Initialize live features (chat, pairing, news)
   */
  initLiveFeatures() {
    this.initLiveChat();
    this.initCodePairing();
    this.initTechNews();
  }

  /**
   * Initialize live chat
   */
  initLiveChat() {
    const chatRooms = document.querySelectorAll(".chat-room");
    const chatContainer = document.querySelector("#chat-container");

    chatRooms.forEach((room) => {
      room.addEventListener("click", () => {
        const roomName = room.dataset.room;
        this.loadChatRoom(roomName, chatContainer);

        chatRooms.forEach((r) => r.classList.remove("active"));
        room.classList.add("active");
      });
    });
  }

  /**
   * Load chat room messages
   */
  loadChatRoom(roomName, container) {
    if (!container) return;

    // Sample messages
    container.innerHTML = `
            <div class="chat-message">
                <span class="chat-user">Selam:</span>
                <span class="chat-text">Hello everyone!</span>
            </div>
        `;
  }

  /**
   * Initialize code pairing sessions
   */
  initCodePairing() {
    const startPairingBtn = document.querySelector("#start-pairing");
    if (startPairingBtn) {
      startPairingBtn.addEventListener("click", () => {
        // Start pairing session
        alert("Pairing session feature coming soon!");
      });
    }
  }

  /**
   * Initialize tech news feed
   */
  initTechNews() {
    const newsFeed = document.querySelector("#news-feed");
    if (!newsFeed) return;

    // Sample news
    const news = [
      { title: "Ethiopian AI Startup Raises $2M", time: "2 hours ago" },
      { title: "New Tech Hub Opens in Addis", time: "1 day ago" },
    ];

    newsFeed.innerHTML = news
      .map(
        (item) => `
            <div class="news-item">
                <h4>${item.title}</h4>
                <span class="news-time">${item.time}</span>
            </div>
        `
      )
      .join("");
  }

  /**
   * Initialize mentor matching system
   */
  initMentorMatching() {
    const findMatchBtn = document.querySelector("#find-match");
    if (!findMatchBtn) return;

    findMatchBtn.addEventListener("click", () => {
      const role =
        document.querySelector(".role-btn.active")?.dataset.role || "mentee";
      const skill = document.querySelector("#match-skill")?.value || "";

      this.findMentorMatch(role, skill);
    });
  }

  /**
   * Find mentor/mentee match
   */
  findMentorMatch(role, skill) {
    const resultsContainer = document.querySelector("#match-results");
    if (!resultsContainer) return;

    // Filter members based on role and skill
    const matches = this.members
      .filter((member) => {
        if (skill && !member.skills.includes(skill)) return false;
        return true;
      })
      .slice(0, 3);

    resultsContainer.innerHTML = matches
      .map(
        (member) => `
            <div class="match-card">
                <h4>${member.name}</h4>
                <p>${member.title} • ${member.location}</p>
                <button class="btn-primary">Connect</button>
            </div>
        `
      )
      .join("");
  }
}

/**
 * EventsController - Manages events page functionality
 * Incorporated from events.js
 */
class EventsController {
  constructor() {
    this.events = [];
    this.filteredEvents = [];
    this.currentView = "month";
    this.currentDate = new Date();
    this.filters = {
      city: [],
      type: [],
      tech: [],
      difficulty: [],
      mode: "all",
    };
    this.init();
  }

  init() {
    this.loadEvents();
    this.initCalendar();
    this.initViewToggle();
    this.initFilters();
    this.initEventCards();
    this.initRSVP();
    this.initCountdownTimers();
    this.initEventSubmission();
    this.initEthiopianCalendar();
  }

  loadEvents() {
    const eventCards = document.querySelectorAll(".event-card");
    this.events = Array.from(eventCards).map((card) => ({
      element: card,
      id: card.dataset.id || Math.random().toString(36).substr(2, 9),
      title: card.querySelector(".event-title, h3")?.textContent || "",
      date: this.extractEventDate(card),
      city: card.dataset.city || "",
      type: card.dataset.type || "",
      tech: (card.dataset.tech || "").split(",").map((t) => t.trim()),
      difficulty: card.dataset.difficulty || "",
      mode: card.dataset.mode || "in-person",
      description:
        card.querySelector(".event-description, p")?.textContent || "",
      attendees: this.extractAttendees(card),
    }));

    this.filteredEvents = [...this.events];
  }

  extractEventDate(card) {
    const dateEl = card.querySelector("[data-date], .event-date");
    if (dateEl && dateEl.dataset.date) {
      return new Date(dateEl.dataset.date);
    }

    const dateText = card.querySelector(".detail-item")?.textContent || "";
    const dateMatch = dateText.match(/(\w+\s+\d+,\s+\d{4})/);
    if (dateMatch) {
      return new Date(dateMatch[1]);
    }

    return new Date();
  }

  extractAttendees(card) {
    const attendeeEl = card.querySelector(".attendee-count");
    if (!attendeeEl) return 0;
    const match = attendeeEl.textContent.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  initCalendar() {
    const monthView = document.querySelector("#month-view");
    if (!monthView) return;

    this.renderCalendar();

    const prevBtn = monthView.querySelector(".prev-month");
    const nextBtn = monthView.querySelector(".next-month");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
      });
    }
  }

  renderCalendar() {
    const calendarGrid = document.querySelector(".calendar-grid");
    if (!calendarGrid) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthHeader = document.querySelector("#current-month");
    if (monthHeader) {
      monthHeader.textContent = this.currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }

    const existingDays = calendarGrid.querySelectorAll(
      ".calendar-day:not(.day-header)"
    );
    existingDays.forEach((day) => day.remove());

    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement("div");
      emptyDay.className = "calendar-day empty";
      calendarGrid.appendChild(emptyDay);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement("div");
      dayCell.className = "calendar-day";
      dayCell.textContent = day;

      const dayDate = new Date(year, month, day);
      const dayEvents = this.getEventsForDate(dayDate);

      if (dayEvents.length > 0) {
        dayCell.classList.add("has-events");
        dayCell.dataset.eventCount = dayEvents.length;
        dayCell.setAttribute(
          "title",
          `${dayEvents.length} event(s) on this day`
        );
        dayCell.addEventListener("click", () => {
          this.showDayEvents(dayDate, dayEvents);
        });
      }

      const today = new Date();
      if (dayDate.toDateString() === today.toDateString()) {
        dayCell.classList.add("today");
      }

      calendarGrid.appendChild(dayCell);
    }
  }

  getEventsForDate(date) {
    return this.filteredEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  }

  showDayEvents(date, events) {
    let modal = document.querySelector("#day-events-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "day-events-modal";
      modal.className = "modal";
      modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Events on ${date.toLocaleDateString()}</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body" id="day-events-list"></div>
                </div>
            `;
      document.body.appendChild(modal);

      modal.querySelector(".close-modal").addEventListener("click", () => {
        modal.style.display = "none";
      });
    }

    const eventsList = modal.querySelector("#day-events-list");
    eventsList.innerHTML = events
      .map(
        (event) => `
            <div class="day-event-item">
                <h4>${event.title}</h4>
                <p>${event.type} • ${event.city}</p>
            </div>
        `
      )
      .join("");

    modal.style.display = "block";
  }

  initViewToggle() {
    const viewButtons = document.querySelectorAll(".view-btn, [data-view]");
    viewButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const view = button.dataset.view || button.textContent.toLowerCase();
        this.switchView(view);
      });
    });
  }

  switchView(view) {
    this.currentView = view;

    document.querySelectorAll(".view-btn, [data-view]").forEach((btn) => {
      const btnView = btn.dataset.view || btn.textContent.toLowerCase();
      if (btnView === view) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    document.querySelectorAll(".calendar-view").forEach((viewEl) => {
      const viewId = viewEl.id;
      if (viewId.includes(view)) {
        viewEl.classList.add("active");
      } else {
        viewEl.classList.remove("active");
      }
    });

    if (view === "list") {
      this.renderListView();
    }
  }

  renderListView() {
    const listView = document.querySelector("#list-view");
    if (!listView) return;

    const eventsList = listView.querySelector(".events-list");
    if (!eventsList) return;

    const sortedEvents = [...this.filteredEvents].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    eventsList.innerHTML = sortedEvents
      .map((event) => {
        const eventCard = event.element.cloneNode(true);
        return eventCard.outerHTML;
      })
      .join("");
  }

  initFilters() {
    const cityFilters = document.querySelectorAll('input[name="city"]');
    cityFilters.forEach((filter) => {
      filter.addEventListener("change", () => {
        this.updateFilters();
      });
    });

    const typeFilters = document.querySelectorAll('input[name="type"]');
    typeFilters.forEach((filter) => {
      filter.addEventListener("change", () => {
        this.updateFilters();
      });
    });

    const techFilters = document.querySelectorAll('input[name="tech"]');
    techFilters.forEach((filter) => {
      filter.addEventListener("change", () => {
        this.updateFilters();
      });
    });

    const difficultyFilters = document.querySelectorAll(
      'input[name="difficulty"]'
    );
    difficultyFilters.forEach((filter) => {
      filter.addEventListener("change", () => {
        this.updateFilters();
      });
    });

    const virtualToggle = document.querySelector("#virtual-toggle");
    if (virtualToggle) {
      virtualToggle.addEventListener("change", (e) => {
        this.filters.mode = e.target.checked ? "virtual" : "in-person";
        this.updateFilters();
      });
    }

    const clearFilters = document.querySelector("#clear-filters");
    if (clearFilters) {
      clearFilters.addEventListener("click", () => {
        this.clearFilters();
      });
    }
  }

  updateFilters() {
    this.filters.city = Array.from(
      document.querySelectorAll('input[name="city"]:checked')
    ).map((input) => input.value);

    this.filters.type = Array.from(
      document.querySelectorAll('input[name="type"]:checked')
    ).map((input) => input.value);

    this.filters.tech = Array.from(
      document.querySelectorAll('input[name="tech"]:checked')
    ).map((input) => input.value);

    this.filters.difficulty = Array.from(
      document.querySelectorAll('input[name="difficulty"]:checked')
    ).map((input) => input.value);

    this.applyFilters();
  }

  applyFilters() {
    this.filteredEvents = this.events.filter((event) => {
      if (
        this.filters.city.length > 0 &&
        !this.filters.city.includes(event.city)
      ) {
        return false;
      }

      if (
        this.filters.type.length > 0 &&
        !this.filters.type.includes(event.type)
      ) {
        return false;
      }

      if (this.filters.tech.length > 0) {
        const hasMatchingTech = this.filters.tech.some((filterTech) =>
          event.tech.includes(filterTech)
        );
        if (!hasMatchingTech) return false;
      }

      if (
        this.filters.difficulty.length > 0 &&
        !this.filters.difficulty.includes(event.difficulty)
      ) {
        return false;
      }

      if (this.filters.mode !== "all" && event.mode !== this.filters.mode) {
        return false;
      }

      return true;
    });

    this.renderFilteredEvents();
    this.updateEventCount();
  }

  renderFilteredEvents() {
    const eventsContainer = document.querySelector(".events-container");
    if (!eventsContainer) return;

    this.events.forEach((event) => {
      event.element.style.display = "none";
    });

    this.filteredEvents.forEach((event) => {
      event.element.style.display = "block";
    });

    if (this.filteredEvents.length === 0) {
      let noResults = eventsContainer.querySelector(".no-results");
      if (!noResults) {
        noResults = document.createElement("div");
        noResults.className = "no-results";
        noResults.innerHTML = `
                    <i class="fas fa-calendar-times"></i>
                    <h3>No events found</h3>
                    <p>Try adjusting your filters</p>
                `;
        eventsContainer.appendChild(noResults);
      }
      noResults.style.display = "block";
    } else {
      const noResults = eventsContainer.querySelector(".no-results");
      if (noResults) noResults.style.display = "none";
    }
  }

  updateEventCount() {
    const countEl = document.querySelector(".events-count");
    if (countEl) {
      countEl.textContent = `${this.filteredEvents.length} event${
        this.filteredEvents.length !== 1 ? "s" : ""
      }`;
    }
  }

  clearFilters() {
    document.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      input.checked = false;
    });

    const virtualToggle = document.querySelector("#virtual-toggle");
    if (virtualToggle) virtualToggle.checked = false;

    this.filters = {
      city: [],
      type: [],
      tech: [],
      difficulty: [],
      mode: "all",
    };

    this.applyFilters();
  }

  initEventCards() {
    const eventCards = document.querySelectorAll(".event-card");
    eventCards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        card.style.transform = "translateY(-5px)";
        card.style.transition = "transform 0.3s ease";
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0)";
      });
    });
  }

  initRSVP() {
    const interestedBtns = document.querySelectorAll(
      '.interested, [data-action="interested"]'
    );
    const goingBtns = document.querySelectorAll(
      '.going, [data-action="going"]'
    );

    interestedBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const eventCard = btn.closest(".event-card");
        this.handleRSVP(eventCard, "interested");
      });
    });

    goingBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const eventCard = btn.closest(".event-card");
        this.handleRSVP(eventCard, "going");
      });
    });
  }

  handleRSVP(eventCard, action) {
    const eventId =
      eventCard.dataset.id ||
      eventCard.querySelector(".event-title")?.textContent;
    const statusKey = `event-${eventId}-rsvp`;

    const currentStatus = localStorage.getItem(statusKey);
    if (currentStatus === action) {
      localStorage.removeItem(statusKey);
      eventCard.classList.remove(`rsvp-${action}`);
    } else {
      localStorage.setItem(statusKey, action);
      eventCard.classList.remove("rsvp-interested", "rsvp-going");
      eventCard.classList.add(`rsvp-${action}`);
    }

    const buttons = eventCard.querySelectorAll(".interested, .going");
    buttons.forEach((btn) => {
      if (btn.textContent.toLowerCase().includes(action)) {
        btn.classList.toggle("active");
      }
    });
  }

  initCountdownTimers() {
    const countdownElements = document.querySelectorAll(
      ".countdown-timer, [data-date]"
    );

    countdownElements.forEach((element) => {
      const dateAttr =
        element.closest(".event-countdown")?.dataset.date ||
        element.dataset.date;
      if (!dateAttr) return;

      const eventDate = new Date(dateAttr);
      this.updateCountdown(element, eventDate);

      setInterval(() => {
        this.updateCountdown(element, eventDate);
      }, 60000);
    });
  }

  updateCountdown(element, eventDate) {
    const now = new Date();
    const diff = eventDate - now;

    if (diff <= 0) {
      element.textContent = "Event passed";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      element.textContent = `${days} day${days !== 1 ? "s" : ""} left`;
    } else if (hours > 0) {
      element.textContent = `${hours} hour${hours !== 1 ? "s" : ""} left`;
    } else {
      element.textContent = `${minutes} minute${minutes !== 1 ? "s" : ""} left`;
    }
  }

  initEventSubmission() {
    const submitBtn = document.querySelector("#submit-event-btn");
    const modal = document.querySelector("#event-creation-modal");
    const form = document.querySelector("#event-submission-form");

    if (submitBtn && modal) {
      submitBtn.addEventListener("click", () => {
        modal.style.display = "block";
      });
    }

    const closeBtns = document.querySelectorAll(".close-modal");
    closeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (modal) modal.style.display = "none";
      });
    });

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("Event submitted");
        if (modal) modal.style.display = "none";
      });
    }
  }

  initEthiopianCalendar() {
    const toggleBtn = document.querySelector("#toggle-date-format");
    if (!toggleBtn) return;

    let isEthiopian = false;

    toggleBtn.addEventListener("click", () => {
      isEthiopian = !isEthiopian;

      const gregorianSpan = toggleBtn.querySelector(".gregorian");
      const ethiopianSpan = toggleBtn.querySelector(".ethiopian");

      if (isEthiopian) {
        if (gregorianSpan) gregorianSpan.style.display = "none";
        if (ethiopianSpan) ethiopianSpan.style.display = "inline";
      } else {
        if (gregorianSpan) gregorianSpan.style.display = "inline";
        if (ethiopianSpan) ethiopianSpan.style.display = "none";
      }
    });
  }
}

// Initialize community controller when DOM is ready
function initCommunity() {
  if (
    document.querySelector(
      ".community-hero, .member-directory, .discussion-forums"
    )
  ) {
    window.communityController = new CommunityController();
  }
}

// Initialize events controller when DOM is ready
function initEvents() {
  if (document.querySelector(".events-main, .event-card, #month-view")) {
    window.eventsController = new EventsController();
  }
}

// Auto-initialize if on community page
document.addEventListener("DOMContentLoaded", () => {
  const isCommunityPage =
    window.location.pathname.includes("community.html") ||
    document.querySelector(".community-hero, .member-directory");

  if (isCommunityPage) {
    initCommunity();
  }

  // Also check for events page
  const isEventsPage =
    window.location.pathname.includes("events.html") ||
    document.querySelector(".events-main, .event-card");

  if (isEventsPage) {
    initEvents();
  }
});

// Export for manual initialization
window.initCommunity = initCommunity;
window.initEvents = initEvents;
