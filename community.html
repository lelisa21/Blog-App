<?php
declare(strict_types=1);
if (session_status() !== PHP_SESSION_ACTIVE) session_start();

// DB Connection (your techblog schema)
function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=techblog;charset=utf8mb4', 'root', '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    return $pdo;
}
function jsonOut($d, $c=200){ http_response_code($c); header('Content-Type: application/json'); echo json_encode($d); exit; }
function auth(): int { return empty($_SESSION['user_id']) ? jsonOut(['error'=>'auth'],401) : (int)$_SESSION['user_id']; }
function input(){ $r=file_get_contents('php://input'); return $r?json_decode($r,true):[]; }

// API Router
if (!empty($_GET['api'])) {
    try {
        $pdo = db();
        switch ($_GET['api']) {
            case 'members':
                $w=["u.is_active=1"]; $p=[];
                if (!empty($_GET['search'])) { $w[]="(u.full_name LIKE :s OR u.username LIKE :s OR u.location LIKE :s)"; $p[':s']='%'.$_GET['search'].'%'; }
                if (!empty($_GET['location'])) { $w[]="u.location=:l"; $p[':l']=$_GET['location']; }
                if (!empty($_GET['availability'])) { $w[]="u.availability_status=:a"; $p[':a']=$_GET['availability']; }
                $join='';
                if (!empty($_GET['skill'])) { $join="LEFT JOIN user_skills us ON us.user_id=u.id"; $w[]="(us.skill_name=:sk OR u.skill_level=:sk)"; $p[':sk']=$_GET['skill']; }
                $stmt=$pdo->prepare("SELECT DISTINCT u.id,u.username,u.full_name,u.location,u.avatar,u.bio,u.availability_status,u.mentor_role,u.skill_level,u.last_seen_at FROM users u $join WHERE ".implode(' AND ',$w)." ORDER BY u.last_seen_at DESC LIMIT 50");
                $stmt->execute($p);
                $dist=$pdo->query("SELECT skill_name as skill,COUNT(*)as c FROM user_skills GROUP BY skill_name ORDER BY c DESC LIMIT 8")->fetchAll();
                jsonOut(['members'=>$stmt->fetchAll(),'skills_distribution'=>$dist]);

            case 'profile':
                $uid=auth();
                $row=$pdo->prepare("SELECT id,username,email,full_name,avatar,bio,location,skill_level,availability_status,mentor_role,last_seen_at FROM users WHERE id=:id")->execute([':id'=>$uid])->fetch();
                $skills=$pdo->prepare("SELECT skill_name FROM user_skills WHERE user_id=:id")->execute([':id'=>$uid])->fetchAll(PDO::FETCH_COLUMN);
                jsonOut(['profile'=>$row,'skills'=>$skills]);

            case 'profile_update':
                $uid=auth(); $d=input();
                $pdo->prepare("UPDATE users SET full_name=:fn,bio=:b,location=:loc,skill_level=:sl WHERE id=:id")->execute([':fn'=>$d['full_name']??'',':b'=>$d['bio']??'',':loc'=>$d['location']??'',':sl'=>$d['skill_level']??'beginner',':id'=>$uid]);
                if (!empty($d['skills']) && is_array($d['skills'])) {
                    $pdo->prepare("DELETE FROM user_skills WHERE user_id=:id")->execute([':id'=>$uid]);
                    $ins=$pdo->prepare("INSERT INTO user_skills(user_id,skill_name,proficiency_level)VALUES(:uid,:sk,'intermediate')");
                    foreach ($d['skills'] as $s) if (trim($s)) $ins->execute([':uid'=>$uid,':sk'=>trim($s)]);
                }
                jsonOut(['ok'=>true]);

            case 'availability':
                $uid=auth(); $d=input();
                if (!in_array($d['status']??'', ['online','away','busy'])) jsonOut(['error'=>'bad status'],422);
                $pdo->prepare("UPDATE users SET availability_status=:s,last_seen_at=NOW() WHERE id=:id")->execute([':s'=>$d['status'],':id'=>$uid]);
                jsonOut(['ok'=>true]);

            case 'threads':
                $cat=$_GET['category']??'general';
                $sql="SELECT t.*,u.full_name,u.avatar FROM forum_topics t JOIN users u ON t.author_id=u.id".($cat==='all'?'':' WHERE t.category=:cat')." ORDER BY t.is_pinned DESC,t.created_at DESC LIMIT 50";
                $stmt=$pdo->prepare($sql);
                $stmt->execute($cat==='all'?[]:[':cat'=>$cat]);
                jsonOut(['threads'=>$stmt->fetchAll()]);

            case 'thread_detail':
                $id=(int)($_GET['id']??0);
                $topic=$pdo->prepare("SELECT t.*,u.full_name,u.avatar FROM forum_topics t JOIN users u ON t.author_id=u.id WHERE t.id=:id")->execute([':id'=>$id])->fetch();
                if (!$topic) jsonOut(['error'=>'not found'],404);
                $replies=$pdo->prepare("SELECT r.*,u.full_name,u.avatar FROM forum_replies r JOIN users u ON r.user_id=u.id WHERE r.topic_id=:id ORDER BY r.created_at ASC")->execute([':id'=>$id])->fetchAll();
                jsonOut(['topic'=>$topic,'replies'=>$replies]);

            case 'thread_create':
                $uid=auth(); $d=input();
                $slug=strtolower(preg_replace('/[^a-z0-9]+/','-',$d['title']??''));
                $pdo->prepare("INSERT INTO forum_topics(title,content,author_id,category,slug)VALUES(:t,:c,:a,:cat,:s)")->execute([':t'=>$d['title']??'',':c'=>$d['content']??'',':a'=>$uid,':cat'=>$d['category']??'general',':s'=>$slug]);
                jsonOut(['ok'=>true,'id'=>$pdo->lastInsertId()]);

            case 'reply_create':
                $uid=auth(); $d=input();
                $pdo->prepare("INSERT INTO forum_replies(topic_id,user_id,content)VALUES(:tid,:uid,:c)")->execute([':tid'=>$d['topic_id']??0,':uid'=>$uid,':c'=>$d['content']??'']);
                jsonOut(['ok'=>true]);

            case 'match':
                $uid=auth(); $d=input(); $sk=$d['skill']??'';
                $stmt=$pdo->prepare("SELECT DISTINCT u.id,u.full_name,u.avatar,u.bio,u.location,u.mentor_role FROM users u JOIN user_skills us ON us.user_id=u.id WHERE us.skill_name=:sk AND u.id!=:uid AND u.is_active=1 LIMIT 10");
                $stmt->execute([':sk'=>$sk,':uid'=>$uid]);
                jsonOut(['matches'=>$stmt->fetchAll()]);
        }
        jsonOut(['error'=>'unknown'],404);
    } catch (Throwable $e) {
        jsonOut(['error'=>$e->getMessage()],500);
    }
}
?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ETC Community - Connect with Ethiopian Developers</title>
    <meta name="description" content="Join Ethiopia's largest tech community. Connect, collaborate, and grow with developers, students, and tech enthusiasts across Ethiopia." />

    <!-- CSS -->
    <link rel="stylesheet" href="assets/css/theme.css" />
    <link rel="stylesheet" href="assets/css/style.css" />
    <link rel="stylesheet" href="assets/css/nav.css" />
    <link rel="stylesheet" href="assets/css/responsive.css" />
    <link rel="stylesheet" href="assets/css/community/community.css" />
    <link rel="stylesheet" href="assets/css/community/collaboration.css" />
    <link rel="stylesheet" href="assets/css/community/live.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

    <!-- External libraries: Chart.js for data visualization in member directory -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js" defer></script>
</head>
<body data-auth-required="true">
   <nav class="nav-link">
        <div class="nav-container">
            <a href="index.html" class="logo">
                <div class="logo-animation">
                    <div class="logo-circle circle-1"></div>
                    <div class="logo-circle circle-2"></div>
                    <div class="logo-circle circle-3"></div>
                </div>
                <img src="assets/images/logo.png" alt="ETC" width="60" loading="lazy">
            </a>

            <div class="theme-switch">
                    <button class="theme-toggle" id="themeToggle" data-tooltip="Toggle Theme"> <i class="fas fa-moon"></i> <i class="fas fa-sun"></i> </button>
                </div>
                
            <div class="nav-link">
                <a href="index.html" class="nav-item" data-tooltip="Home">
                    <i class="fas fa-home"></i>
                    <span class="nav-label">Home</span>
                </a>
                <a href="resources.html" class="nav-item active" data-tooltip="Resources">
                    <i class="fas fa-cube"></i>
                    <span class="nav-label">Resources</span>
                </a>
                <a href="articles.html" class="nav-item" data-tooltip="Articles">
                    <i class="fas fa-newspaper"></i>
                    <span class="nav-label">Articles</span>
                </a>
            </div>
        </div>
    </nav>
    <main class="container">
        <!-- Community Hero Section: Main landing area showcasing community stats and call-to-action buttons -->
        <section class="community-hero">
            <div class="hero-grid">
                <div class="hero-content">
                    <div class="hero-badge">
                        <i class="fas fa-bolt"></i>
                        <span>Live Community</span>
                    </div>
                    <h1 class="hero-title">
                        Ethiopian Tech <span class="highlight">Community Hub</span>
                    </h1>
                    <p class="hero-subtitle">
                        Connect with 5,000+ Ethiopian developers, collaborate on projects, share knowledge, and grow together.
                    </p>
                    
                    <!-- Hero Stats: Display key community metrics (members, projects, meetups) with animated counters -->
                    <div class="hero-stats">
                        <div class="stat-card">
                            <i class="fas fa-users"></i>
                            <div>
                                <!-- A.1 Realtime member counter animation -->
                                <span class="stat-number" id="live-member-count" data-target="5234">5000+</span>
                                <span class="stat-label">Members</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-code"></i>
                            <div>
                                <span class="stat-number">250+</span>
                                <span class="stat-label">Projects</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-calendar"></i>
                            <div>
                                <span class="stat-number">50+</span>
                                <span class="stat-label">Meetups</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Hero Actions: Primary call-to-action buttons for joining and exploring the community -->
                    <div class="hero-actions">
                        <a href="#join-form" class="btn-primary">
                            <i class="fas fa-door-open"></i>
                            <span>Join Community</span>
                        </a>
                        <a href="#explore" class="btn-secondary">
                            <i class="fas fa-compass"></i>
                            <span>Explore Features</span>
                        </a>
                    </div>
                </div>
                
                <div class="hero-visual">
                    <div class="avatar-grid" id="live-avatars">
                        <!-- Avatars loaded via JS for A.2 Currently online indicator -->
                    </div>
                    <div class="online-indicator">
                        <i class="fas fa-circle online"></i>
                        <!-- A.2 Currently online indicator -->
                        <span id="online-count">432 developers online now</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- A. Live Activity Dashboard: Displays real-time community metrics, top contributors, and activity heatmap -->
        <section class="activity-dashboard">
            <div class="section-header">
                <h2 class="section-title">Live Community Dashboard</h2>
                <!-- View Controls: Toggle between live, daily, and weekly activity views -->
                <div class="view-controls">
                    <button class="view-btn active" data-view="live">Live View</button>
                    <button class="view-btn" data-view="daily">Today</button>
                    <button class="view-btn" data-view="weekly">This Week</button>
                </div>
            </div>

            <!-- Dashboard Grid: Three-column layout displaying contributors, activities, and city heatmap -->
            <div class="dashboard-grid">
                <!-- A.4 Top contributors this week -->
                <div class="dashboard-card contributors-card">
                    <h3><i class="fas fa-trophy"></i> Top Contributors This Week</h3>
                    <div class="contributors-list" id="top-contributors">
                        <!-- Loaded via JS -->
                    </div>
                </div>
                
                <!-- A.3 Recent activities feed -->
                <div class="dashboard-card activities-card">
                    <h3><i class="fas fa-rss"></i> Recent Community Activity</h3>
                    <div class="activities-feed" id="activities-feed">
                        <!-- A.3 Loaded via JS -->
                    </div>
                </div>
                
                <!-- A.5 Ethiopian city activity heatmap -->
                <div class="dashboard-card heatmap-card">
                    <h3><i class="fas fa-map"></i> Ethiopian Tech Activity Heatmap</h3>
                    <div class="heatmap-container">
                        <div class="heatmap-grid">
                            <div class="city-dot addis" data-city="addis-ababa" data-activity="high">
                                <span class="city-name">Addis Ababa</span>
                            </div>
                            <div class="city-dot bahirdar" data-city="bahir-dar" data-activity="medium">
                                <span class="city-name">Bahir Dar</span>
                            </div>
                            <div class="city-dot mekelle" data-city="mekelle" data-activity="medium">
                                <span class="city-name">Mekelle</span>
                            </div>
                            <div class="city-dot hawassa" data-city="hawassa" data-activity="low">
                                <span class="city-name">Hawassa</span>
                            </div>
                            <div class="city-dot jimma" data-city="jimma" data-activity="low">
                                <span class="city-name">Jimma</span>
                            </div>
                        </div>
                        <!-- Heatmap Legend: Visual guide for interpreting city activity levels (high, medium, low) -->
                        <div class="heatmap-legend">
                            <span class="legend-item high">High Activity</span>
                            <span class="legend-item medium">Medium</span>
                            <span class="legend-item low">Low</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- B. Member Directory: Search and filter Ethiopian developers by skills, location, and availability status -->
        <section class="member-directory">
            <div class="section-header">
                <h2 class="section-title">Find Ethiopian Developers</h2>
                <!-- B.1 Search members by skill, location, availability -->
                <div class="member-search">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="member-search" placeholder="Search by name, skill, or location...">
                    </div>
                    <div class="search-filters">
                        <select id="skill-filter">
                            <option value="">All Skills</option>
                            <option value="web">Web Development</option>
                            <option value="mobile">Mobile</option>
                            <option value="ai">AI/ML</option>
                            <option value="devops">DevOps</option>
                        </select>
                        <select id="city-filter">
                            <option value="">All Cities</option>
                            <option value="addis">Addis Ababa</option>
                            <option value="bahirdar">Bahir Dar</option>
                            <option value="mekelle">Mekelle</option>
                            <option value="hawassa">Hawassa</option>
                        </select>
                        <select id="availability-filter">
                            <option value="">All Status</option>
                            <option value="online">Online</option>
                            <option value="available">Available</option>
                            <option value="busy">Busy</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="directory-content">
                <!-- B.2 Ethiopian developer skill visualization -->
                <div class="skills-visualization">
                    <h3><i class="fas fa-chart-bar"></i> Community Skills Distribution</h3>
                    <canvas id="skills-chart"></canvas>
                </div>
                
                <!-- B.3 Mentor/mentee matching system -->
                <div class="matching-system">
                    <h3><i class="fas fa-handshake"></i> Mentor-Mentee Matching</h3>
                    <div class="matching-options">
                        <div class="match-role">
                            <h4>I want to be a:</h4>
                            <div class="role-buttons">
                                <button class="role-btn active" data-role="mentor">Mentor</button>
                                <button class="role-btn" data-role="mentee">Mentee</button>
                                <button class="role-btn" data-role="both">Both</button>
                            </div>
                        </div>
                        <div class="match-filters">
                            <select id="match-skill">
                                <option value="">Select Skill Area</option>
                                <option value="web">Web Development</option>
                                <option value="mobile">Mobile Development</option>
                            </select>
                            <button id="find-match" class="btn-primary">Find Match</button>
                        </div>
                    </div>
                    <div class="match-results" id="match-results">
                        <!-- B.3 Results loaded via JS -->
                    </div>
                </div>
                
                <!-- B.4 Availability status display -->
                <div class="availability-section">
                    <h3><i class="fas fa-user-clock"></i> Set Your Availability</h3>
                    <div class="availability-options">
                        <div class="status-option" data-status="online">
                            <div class="status-indicator online"></div>
                            <span>Online</span>
                        </div>
                        <div class="status-option" data-status="away">
                            <div class="status-indicator away"></div>
                            <span>Away</span>
                        </div>
                        <div class="status-option" data-status="busy">
                            <div class="status-indicator busy"></div>
                            <span>Do Not Disturb</span>
                        </div>
                    </div>
                    <!-- B.5 Ethiopian timezone display -->
                    <div class="timezone-display">
                        <i class="fas fa-clock"></i>
                        <span>Current Ethiopian Time: </span>
                        <span id="ethiopian-time">Loading...</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- C. Discussion Forums: Community discussion threads organized by categories (jobs, projects, help, announcements) -->
        <section class="discussion-forums">
            <div class="section-header">
                <h2 class="section-title">Community Discussions</h2>
                <a href="#new-thread" class="btn-primary"><i class="fas fa-plus"></i> New Discussion</a>
            </div>
            
            <div class="forums-container">
                <!-- C.1 Categories: Filter discussion threads by topic (all, jobs, projects, help, announcements) -->
                <div class="forum-categories">
                    <div class="category active" data-category="all">
                        <i class="fas fa-comments"></i>
                        <span>All Discussions</span>
                        <span class="count">1.2k</span>
                    </div>
                    <div class="category" data-category="jobs">
                        <i class="fas fa-briefcase"></i>
                        <span>Jobs & Careers</span>
                        <span class="count">345</span>
                    </div>
                    <div class="category" data-category="projects">
                        <i class="fas fa-code-branch"></i>
                        <span>Project Collaboration</span>
                        <span class="count">289</span>
                    </div>
                    <div class="category" data-category="help">
                        <i class="fas fa-question-circle"></i>
                        <span>Technical Help</span>
                        <span class="count">456</span>
                    </div>
                    <div class="category" data-category="announcements">
                        <i class="fas fa-bullhorn"></i>
                        <span>Announcements</span>
                        <span class="count">78</span>
                    </div>
                    </div>
                    <div class="forum-threads" id="forum-threads">
                      <!-- C.2 Threaded comments with voting will be loaded here -->
                    </div>
                </div>
                
                <!-- C.5 Ethiopian tech FAQ section -->
                <div class="faq-section">
                    <h3><i class="fas fa-book"></i> Ethiopian Tech FAQ</h3>
                    <div class="faq-list">
                        <div class="faq-item">
                            <div class="faq-question">How to start freelancing in Ethiopia?</div>
                            <div class="faq-answer">Check our resources section for guides on payment methods, taxes, and finding clients locally.</div>
                        </div>
                        <div class="faq-item">
                            <div class="faq-question">Best internet providers in Addis?</div>
                            <div class="faq-answer">Community-rated: Ethio Telecom 4G, Safaricom, and private fiber providers. See reviews.</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- D. Project Collaboration: Team matching, open source projects showcase, and skill-based collaboration tools -->
        <section class="project-collaboration">
            <div class="section-header">
                <h2 class="section-title">Collaborate on Projects</h2>
                <div class="project-actions">
                    <a href="#new-project" class="btn-primary"><i class="fas fa-plus"></i> Start Project</a>
                    <a href="#find-team" class="btn-secondary"><i class="fas fa-search"></i> Find Team</a>
                </div>
            </div>
            
            <div class="projects-container">
                <!-- D.1 "Looking for team members" board -->
                <div class="team-board">
                    <h3><i class="fas fa-user-plus"></i> Looking for Team Members</h3>
                    <div class="team-listings" id="team-listings">
                        <!-- Loaded via JS -->
                    </div>
                </div>
                
                <!-- D.2 Ethiopian opensource projects showcase -->
                <div class="opensource-showcase">
                    <h3><i class="fas fa-code-branch"></i> Featured Open Source Projects</h3>
                    <div class="opensource-projects" id="opensource-projects">
                        <!-- Loaded via JS -->
                    </div>
                </div>
                
                <!-- D.3 Skill-based team matching -->
                <div class="team-matching">
                    <h3><i class="fas fa-users-cog"></i> Team Matching System</h3>
                    <div class="matching-form">
                        <select id="project-type">
                            <option value="">Select Project Type</option>
                            <option value="opensource">Open Source</option>
                            <option value="startup">Startup</option>
                            <option value="freelance">Freelance</option>
                        </select>
                        <div class="skill-tags" id="team-skill-tags">
                            <span class="skill-tag" data-skill="react">React</span>
                            <span class="skill-tag" data-skill="node">Node.js</span>
                            <span class="skill-tag" data-skill="python">Python</span>
                        </div>
                        <button id="find-team-match" class="btn-primary">Find Team Match</button>
                    </div>
                </div>
            </div>
        </section>

        <!-- E. Learning Groups: Study groups by technology, university groups, and accountability partner matching -->
        <section class="learning-groups">
            <h2 class="section-title">Learning & Study Groups</h2>
            
            <div class="groups-container">
                <!-- E.1 Study groups by technology -->
                <div class="study-groups">
                    <h3><i class="fas fa-graduation-cap"></i> Study Groups</h3>
                    <div class="groups-grid">
                        <div class="group-card" data-tech="react">
                            <div class="group-icon">
                                <i class="fab fa-react"></i>
                            </div>
                            <h4>React & Frontend</h4>
                            <p>45 members • Weekly meetings</p>
                            <div class="group-level">Beginner-Advanced</div>
                            <button class="btn-group">Join Group</button>
                        </div>
                        <div class="group-card" data-tech="python">
                            <div class="group-icon">
                                <i class="fab fa-python"></i>
                            </div>
                            <h4>Python & Data Science</h4>
                            <p>68 members • Project-based</p>
                            <div class="group-level">Intermediate</div>
                            <button class="btn-group">Join Group</button>
                        </div>
                    </div>
                </div>
                
                <!-- E.2 Ethiopian university student groups -->
                <div class="university-groups">
                    <h3><i class="fas fa-university"></i> University Groups</h3>
                    <div class="uni-list">
                        <div class="uni-item">
                            <span class="uni-name">AAiT Tech Club</span>
                            <span class="uni-members">320 members</span>
                        </div>
                        <div class="uni-item">
                            <span class="uni-name">Bahir Dar University</span>
                            <span class="uni-members">245 members</span>
                        </div>
                        <div class="uni-item">
                            <span class="uni-name">Mekelle University</span>
                            <span class="uni-members">198 members</span>
                        </div>
                    </div>
                </div>
                
                <!-- E.5 Accountability partners matching -->
                <div class="accountability-partners">
                    <h3><i class="fas fa-handshake"></i> Accountability Partners</h3>
                    <p>Find someone to keep you accountable for your learning goals</p>
                    <button id="find-partner" class="btn-primary">Find a Partner</button>
                    <div class="partners-list" id="partners-list">
                        <!-- Loaded via JS -->
                    </div>
                </div>
            </div>
        </section>

        <!-- F. Gamification System: Leaderboards, Ethiopian-themed badges, and points system to encourage community engagement -->
        <section class="gamification-system">
            <div class="section-header">
                <h2 class="section-title">Community Achievements</h2>
                <a href="#leaderboard" class="btn-secondary">View Full Leaderboard</a>
            </div>
            
            <div class="gamification-content">
                <!-- F.3 Leaderboards: Rankings of top community members with time period filters -->
                <div class="leaderboards">
                    <!-- Leaderboard Tabs: Switch between weekly, monthly, and all-time rankings -->
                    <div class="leaderboard-tabs">
                        <button class="lb-tab active" data-period="weekly">Weekly</button>
                        <button class="lb-tab" data-period="monthly">Monthly</button>
                        <button class="lb-tab" data-period="alltime">All Time</button>
                    </div>
                    <div class="leaderboard-list" id="leaderboard-list">
                        <!-- F.3 Loaded via JS -->
                    </div>
                </div>
                
                <!-- F.2 Ethiopian themed badges -->
                <div class="badges-showcase">
                    <h3><i class="fas fa-medal"></i> Ethiopian Themed Badges</h3>
                    <div class="badges-grid">
                        <div class="badge" data-badge="coffee-master">
                            <div class="badge-icon">
                                <i class="fas fa-mug-hot"></i>
                            </div>
                            <span class="badge-name">Coffee Master</span>
                            <span class="badge-desc">Host 10+ meetings</span>
                        </div>
                        <div class="badge" data-badge="simien-explorer">
                            <div class="badge-icon">
                                <i class="fas fa-mountain"></i>
                            </div>
                            <span class="badge-name">Simien Explorer</span>
                            <span class="badge-desc">Explore all features</span>
                        </div>
                        <div class="badge" data-badge="axum-contributor">
                            <div class="badge-icon">
                                <i class="fas fa-landmark"></i>
                            </div>
                            <span class="badge-name">Axum Contributor</span>
                            <span class="badge-desc">50+ contributions</span>
                        </div>
                    </div>
                </div>
                
                <!-- F.1 Points system -->
                <div class="points-system">
                    <h3><i class="fas fa-star"></i> Your Points</h3>
                    <div class="points-display">
                        <div class="total-points">
                            <span class="points-number" id="user-points">1,245</span>
                            <span class="points-label">Total Points</span>
                        </div>
                        <div class="points-breakdown">
                            <div class="points-source">
                                <span>Forum Posts</span>
                                <span>450 pts</span>
                            </div>
                            <div class="points-source">
                                <span>Project Contributions</span>
                                <span>795 pts</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- G. Networking Features: Virtual coffee matching, interest-based groups, and job referral system -->
        <section class="networking-features">
            <h2 class="section-title">Networking & Connections</h2>
            
            <div class="networking-container">
                <!-- G.1 Virtual coffee matching -->
                <div class="coffee-matching">
                    <h3><i class="fas fa-coffee"></i> Virtual Coffee Matches</h3>
                    <p>Get randomly matched with another community member for a 15-minute virtual coffee chat</p>
                    <button id="find-coffee-match" class="btn-primary">
                        <i class="fas fa-random"></i> Find Coffee Match
                    </button>
                    <div class="match-result" id="coffee-match-result">
                        <!-- G.1 Result displayed here -->
                    </div>
                </div>
                
                <!-- G.2 Interest based groups -->
                <div class="interest-groups">
                    <h3><i class="fas fa-hashtag"></i> Interest Groups</h3>
                    <div class="interest-tags">
                        <span class="interest-tag">#AI-Ethiopia</span>
                        <span class="interest-tag">#Web3-Africa</span>
                        <span class="interest-tag">#EdTech</span>
                        <span class="interest-tag">#AgriTech</span>
                        <span class="interest-tag">#RemoteWork</span>
                    </div>
                </div>
                
                <!-- G.5 Job referral system -->
                <div class="job-referral">
                    <h3><i class="fas fa-briefcase"></i> Job Referral System</h3>
                    <div class="referral-options">
                        <button class="referral-btn" data-action="request">Request Referral</button>
                        <button class="referral-btn" data-action="offer">Offer Referral</button>
                    </div>
                    <div class="referral-board" id="referral-board">
                        <!-- G.5 Loaded via JS -->
                    </div>
                </div>
            </div>
        </section>

        <!-- H. Community Resources: Shared documents, internet provider reviews, coworking spaces, and policy updates -->
        <section class="community-resources">
            <h2 class="section-title">Ethiopian Tech Resources</h2>
            
            <div class="resources-grid">
                <!-- H.1 Shared Ethiopian tech documents -->
                <div class="resource-card">
                    <h3><i class="fas fa-file-alt"></i> Shared Documents</h3>
                    <ul class="documents-list">
                        <li><a href="#"><i class="fas fa-download"></i> Ethiopian Dev Salary Survey 2025</a></li>
                        <li><a href="#"><i class="fas fa-download"></i> Local Payment Integration Guide</a></li>
                    </ul>
                </div>
                
                <!-- H.2 Local internet provider reviews -->
                <div class="resource-card">
                    <h3><i class="fas fa-wifi"></i> Internet Provider Reviews</h3>
                    <div class="provider-ratings">
                        <div class="provider">
                            <span class="provider-name">Ethio Telecom 4G</span>
                            <div class="rating">4.2 ★</div>
                        </div>
                        <div class="provider">
                            <span class="provider-name">Safaricom Ethiopia</span>
                            <div class="rating">4.5 ★</div>
                        </div>
                    </div>
                </div>
                
                <!-- H.3 Ethiopian coworking spaces directory -->
                <div class="resource-card">
                    <h3><i class="fas fa-building"></i> Coworking Spaces</h3>
                    <div class="coworking-list">
                        <div class="space-item">
                            <span class="space-name">Iceaddis (Addis)</span>
                            <span class="space-price">From 500 ETB/day</span>
                        </div>
                        <div class="space-item">
                            <span class="space-name">Blue Space (Bahir Dar)</span>
                            <span class="space-price">From 300 ETB/day</span>
                        </div>
                    </div>
                </div>
                
                <!-- H.5 Ethiopian government tech policies updates -->
                <div class="resource-card">
                    <h3><i class="fas fa-newspaper"></i> Policy Updates</h3>
                    <div class="policy-updates" id="policy-updates">
                        <!-- H.5 Loaded via JS -->
                    </div>
                </div>
            </div>
        </section>

        <!-- I. Realtime Features: Live chat rooms, code pairing sessions, and Ethiopian tech news feed -->
        <section class="realtime-features">
            <div class="section-header">
                <h2 class="section-title">Live Community Features</h2>
                <!-- Realtime Status Indicator: Shows current live activity status with animated pulse -->
                <div class="realtime-status">
                    <i class="fas fa-circle live"></i>
                    <span>Live Now</span>
                </div>
            </div>
            
            <div class="realtime-container">
                <!-- I.1 Live chat rooms by topic -->
                <div class="live-chat">
                    <h3><i class="fas fa-comments"></i> Live Chat Rooms</h3>
                    <div class="chat-rooms">
                        <div class="chat-room active" data-room="general">
                            <div class="room-status online"></div>
                            <span class="room-name">General Chat</span>
                            <span class="room-count">243 online</span>
                        </div>
                        <div class="chat-room" data-room="help">
                            <div class="room-status online"></div>
                            <span class="room-name">Help & Support</span>
                            <span class="room-count">89 online</span>
                        </div>
                    </div>
                    <div class="chat-container" id="chat-container">
                        <!-- I.1 Chat messages go here -->
                    </div>
                </div>
                
                <!-- I.3 Code pairing sessions -->
                <div class="code-pairing">
                    <h3><i class="fas fa-code"></i> Live Code Pairing</h3>
                    <div class="pairing-sessions" id="pairing-sessions">
                        <!-- I.3 Loaded via JS -->
                    </div>
                    <button id="start-pairing" class="btn-primary">
                        <i class="fas fa-video"></i> Start Pairing Session
                    </button>
                </div>
                
                <!-- I.4 Ethiopian tech news feed -->
                <div class="tech-news">
                    <h3><i class="fas fa-newspaper"></i> Ethiopian Tech News</h3>
                    <div class="news-feed" id="news-feed">
                        <!-- I.4 Loaded via JS -->
                    </div>
                </div>
            </div>
        </section>

        <!-- Join CTA: Registration form for new community members with skill and location selection -->
        <section class="join-cta" id="join-form">
            <div class="join-container">
                <h2>Ready to Join the Community?</h2>
                <p>Connect with thousands of Ethiopian developers, share knowledge, collaborate on projects, and grow your career.</p>
                <form class="join-form" id="community-join-form">
                    <div class="form-group">
                        <input type="email" placeholder="Your email address" required>
                        <input type="text" placeholder="Your name" required>
                    </div>
                    <div class="form-group">
                        <select required>
                            <option value="">Primary Skill</option>
                            <option value="web">Web Development</option>
                            <option value="mobile">Mobile Development</option>
                            <option value="ai">AI/ML</option>
                        </select>
                        <select required>
                            <option value="">Location in Ethiopia</option>
                            <option value="addis">Addis Ababa</option>
                            <option value="bahirdar">Bahir Dar</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <button type="submit" class="btn-join">
                        <i class="fas fa-user-plus"></i>
                        <span>Create Free Account</span>
                    </button>
                </form>
                <div class="join-features">
                    <span><i class="fas fa-check"></i> Free forever</span>
                    <span><i class="fas fa-check"></i> Open to all skill levels</span>
                    <span><i class="fas fa-check"></i> Connect with 5000+ developers</span>
                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="site-footer">
    </footer>
    
    <!-- API-Connected Community JavaScript -->
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🇪🇹 Ethiopian Tech Community - Initializing...');
        window.API_BASE = 'community.php?api=';
        
        initLiveDashboard();
        initMemberDirectory();
        initDiscussionForums();
        initProjectCollaboration();
        initLearningGroups();
        initGamification();
        initNetworkingFeatures();
        initRealtimeFeatures();
        initCommunityResources();
        
        updateEthiopianTime();
        setInterval(updateEthiopianTime, 1000);
    });

    // Live Dashboard
    function initLiveDashboard() {
        fetch(`${window.API_BASE}members&limit=1`)
            .then(r=>r.json())
            .then(d=>{
                const count = d.members ? d.members.length : 5000;
                animateCounter(document.getElementById('live-member-count'), 0, count, 2000);
            }).catch(()=>{});
            
        updateOnlineUsers();
        setInterval(updateOnlineUsers, 30000);
        loadActivitiesFeed();
        setInterval(loadActivitiesFeed, 60000);
        loadTopContributors();
        initCityHeatmap();
    }

    function animateCounter(el,start,end,dur){
        if(!el)return;let t=null;
        const s=(x)=>{if(!t)t=x;const p=Math.min((x-t)/dur,1);el.textContent=Math.floor(p*(end-start)+start).toLocaleString();if(p<1)requestAnimationFrame(s);};
        requestAnimationFrame(s);
    }

    function updateOnlineUsers(){
        const c=Math.floor(Math.random()*200)+400;
        const el=document.getElementById('online-count');
        if(el)el.textContent=`${c} developers online now`;
        updateLiveAvatars(c);
    }

    function updateLiveAvatars(count){
        const grid=document.getElementById('live-avatars');
        if(!grid)return;
        grid.innerHTML='';
        const colors=['#7efff5','#ffd166','#784fb6','#ff5e6c','#9ef01a'];
        for(let i=0;i<Math.min(12,Math.floor(count/40));i++){
            const a=document.createElement('div');
            a.className='avatar';
            a.style.cssText=`width:40px;height:40px;border-radius:50%;background:${colors[i%colors.length]};display:flex;align-items:center;justify-content:center;color:#000;font-weight:bold;font-size:14px;`;
            a.textContent='ET';
            grid.appendChild(a);
        }
    }

    function loadActivitiesFeed(){
        const feed=document.getElementById('activities-feed');
        if(!feed)return;
        const acts=[{user:'Selam G.',action:'started a new React project',time:'2 min ago'},{user:'Dawit M.',action:'joined the Python study group',time:'5 min ago'},{user:'Amina K.',action:'shared a job opportunity',time:'12 min ago'}];
        feed.innerHTML=acts.map(a=>`<div class="activity-item" style="padding:10px;border-bottom:1px solid var(--color-border);animation:fadeIn 0.3s ease;"><strong style="color:var(--color-primary);">${a.user}</strong><span style="color:var(--color-text);"> ${a.action}</span><small style="color:var(--color-text-muted);float:right;">${a.time}</small></div>`).join('');
    }

    function loadTopContributors(){
        const c=document.getElementById('top-contributors');
        if(!c)return;
        const list=[{name:'Elias Z.',points:1250},{name:'Beti T.',points:980},{name:'Kaleb M.',points:875}];
        c.innerHTML=list.map((p,i)=>`<div class="contributor" style="display:flex;align-items:center;padding:10px;background:${i<3?'rgba(126,255,245,0.1)':'transparent'};border-radius:8px;margin:5px 0;"><div style="width:30px;height:30px;border-radius:50%;background:var(--color-primary);color:var(--color-bg);display:flex;align-items:center;justify-content:center;font-weight:bold;margin-right:10px;">${i+1}</div><div style="flex:1;"><div style="font-weight:bold;color:var(--color-text);">${p.name}</div></div><div style="background:var(--color-primary);color:var(--color-bg);padding:4px 8px;border-radius:12px;font-size:12px;font-weight:bold;">${p.points} pts</div></div>`).join('');
    }

    function initCityHeatmap(){
        document.querySelectorAll('.city-dot').forEach(d=>{
            d.addEventListener('mouseenter',function(){this.style.transform='scale(1.2)';this.style.transition='transform 0.3s ease';});
            d.addEventListener('mouseleave',function(){this.style.transform='scale(1)';});
            d.addEventListener('click',function(){alert(`🏙️ ${this.dataset.city}\n\n📊 1000+ developers\n• 50+ active projects\n• Weekly meetups`);});
        });
    }

    // Member Directory - LIVE API
    function initMemberDirectory(){
        loadMembers();
        ['member-search','skill-filter','city-filter','availability-filter'].forEach(id=>{
            document.getElementById(id)?.addEventListener('change',loadMembers);
            document.getElementById(id)?.addEventListener('input',debounce(loadMembers,300));
        });
        initSkillsChart();
        initMatchingSystem();
        initAvailabilityStatus();
    }

    async function loadMembers(){
        const s=document.getElementById('member-search')?.value||'';
        const sk=document.getElementById('skill-filter')?.value||'';
        const loc=document.getElementById('city-filter')?.value||'';
        const av=document.getElementById('availability-filter')?.value||'';
        try{
            const r=await fetch(`${window.API_BASE}members&search=${encodeURIComponent(s)}&skill=${encodeURIComponent(sk)}&location=${encodeURIComponent(loc)}&availability=${encodeURIComponent(av)}`);
            const d=await r.json();
            renderMembers(d.members||[]);
            if(d.skills_distribution)updateSkillsChart(d.skills_distribution);
        }catch(e){console.error(e);}
    }

    function renderMembers(members){
        const container=document.getElementById('members-list');
        if(!container){
            const dir=document.querySelector('.directory-content');
            if(!dir)return;
            const div=document.createElement('div');div.id='members-list';div.style='margin-top:30px;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;';
            dir.appendChild(div);
        }
        const el=document.getElementById('members-list');
        if(!members.length){el.innerHTML='<div style="grid-column:1/-1;text-align:center;color:var(--color-text-muted);">No members found</div>';return;}
        el.innerHTML=members.map(m=>`<div style="background:var(--color-surface);padding:20px;border-radius:12px;border:1px solid var(--color-border);"><div style="display:flex;align-items:center;gap:15px;margin-bottom:15px;"><img src="${m.avatar||'assets/images/default-avatar.png'}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;"><div><h4 style="margin:0;color:var(--color-text);">${m.full_name||m.username}</h4><div style="color:var(--color-text-muted);font-size:14px;">@${m.username}</div></div></div><div style="margin-bottom:10px;"><span style="display:inline-block;padding:4px 8px;background:rgba(126,255,245,0.1);color:var(--color-primary);border-radius:12px;font-size:12px;">${m.skill_level||'Developer'}</span><span style="display:inline-block;padding:4px 8px;background:${m.availability_status==='online'?'rgba(0,255,0,0.2)':'rgba(128,128,128,0.2)'};color:${m.availability_status==='online'?'#0f0':'#888'};border-radius:12px;font-size:12px;margin-left:5px;"><i class="fas fa-circle" style="font-size:8px;"></i> ${m.availability_status}</span></div><p style="color:var(--color-text-muted);font-size:14px;margin:0;line-height:1.4;">${m.bio||'No bio'}</p></div>`).join('');
    }

    let skillsChart;
    function initSkillsChart(){
        const c=document.getElementById('skills-chart');
        if(!c)return;
        const ctx=c.getContext('2d');
        skillsChart=new Chart(ctx,{type:'bar',data:{labels:[],datasets:[{label:'Developers',data:[],backgroundColor:'rgba(126,255,245,0.7)',borderColor:'rgb(126,255,245)',borderWidth:1}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'var(--color-text)'}}},scales:{y:{beginAtZero:true,ticks:{color:'var(--color-text-muted)'},grid:{color:'var(--color-border)'}},x:{ticks:{color:'var(--color-text)'},grid:{display:false}}}});
    }

    function updateSkillsChart(dist){
        if(!skillsChart||!dist)return;
        skillsChart.data.labels=dist.map(x=>x.skill);
        skillsChart.data.datasets[0].data=dist.map(x=>x.c);
        skillsChart.update();
    }

    function initMatchingSystem(){
        document.querySelectorAll('.role-btn').forEach(b=>b.addEventListener('click',function(){document.querySelectorAll('.role-btn').forEach(x=>x.classList.remove('active'));this.classList.add('active');}));
        document.getElementById('find-match')?.addEventListener('click',async function(){
            const skill=document.getElementById('match-skill')?.value;
            if(!skill)return alert('Select skill');
            this.disabled=true;this.innerHTML='<i class="fas fa-spinner fa-spin"></i>';
            try{
                const r=await fetch(`${window.API_BASE}match`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({skill})});
                const d=await r.json();
                const res=document.getElementById('match-results');
                res.innerHTML=(d.matches||[]).map(m=>`<div style="padding:15px;background:var(--color-surface);border-radius:8px;margin:10px 0;border-left:4px solid var(--color-primary);"><div style="display:flex;justify-content:space-between;align-items:center;"><div><h4 style="margin:0;color:var(--color-text);">${m.full_name}</h4><div style="color:var(--color-text-muted);font-size:14px;">${m.location||'Ethiopia'} • ${m.mentor_role}</div></div><button onclick="alert('Request sent to ${m.full_name}')" style="padding:8px 16px;background:var(--color-primary);color:var(--color-bg);border:none;border-radius:6px;cursor:pointer;">Connect</button></div></div>`).join('');
            }catch(e){alert('Error');}
            finally{this.disabled=false;this.innerHTML='Find Match';}
        });
    }

    function initAvailabilityStatus(){
        document.querySelectorAll('.status-option').forEach(o=>o.addEventListener('click',async function(){
            const s=this.dataset.status;
            document.querySelectorAll('.status-option').forEach(x=>x.style.opacity='0.5');this.style.opacity='1';
            try{await fetch(`${window.API_BASE}availability`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:s})});}catch(e){}
        }));
    }

    // Forums - LIVE API
    function initDiscussionForums(){
        loadForumThreads('all');
        document.querySelectorAll('.category').forEach(c=>c.addEventListener('click',function(){document.querySelectorAll('.category').forEach(x=>x.classList.remove('active'));this.classList.add('active');loadForumThreads(this.dataset.category);}));
        initFAQ();
    }

    async function loadForumThreads(cat){
        const container=document.getElementById('forum-threads');
        if(!container)return;
        container.innerHTML='<div style="padding:40px;text-align:center;color:var(--color-text-muted);"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
        try{
            const r=await fetch(`${window.API_BASE}threads&category=${encodeURIComponent(cat)}`);
            const d=await r.json();
            if(!d.threads||!d.threads.length){container.innerHTML='<div style="padding:40px;text-align:center;color:var(--color-text-muted);">No discussions yet</div>';return;}
            container.innerHTML=d.threads.map(t=>`<div style="padding:20px;background:var(--color-surface);border-radius:8px;margin:10px 0;border:1px solid var(--color-border);"><div style="display:flex;gap:15px;"><img src="${t.avatar||'default-avatar.png'}" style="width:40px;height:40px;border-radius:50%;"><div style="flex:1;"><h4 style="margin:0 0 8px 0;color:var(--color-text);">${t.title}</h4><div style="color:var(--color-text-muted);font-size:14px;">By <strong>${t.full_name}</strong> • ${new Date(t.created_at).toLocaleDateString()} <span style="margin-left:15px;padding:2px 8px;background:rgba(126,255,245,0.1);color:var(--color-primary);border-radius:12px;font-size:12px;">${t.category}</span></div></div></div></div>`).join('');
        }catch(e){container.innerHTML='<div style="padding:40px;text-align:center;color:var(--color-text-muted);">Failed to load</div>';}
    }

    function initFAQ(){
        document.querySelectorAll('.faq-item').forEach(i=>{
            const q=i.querySelector('.faq-question'),a=i.querySelector('.faq-answer');
            a.style.display='none';
            q.addEventListener('click',()=>{a.style.display=a.style.display==='none'?'block':'none';q.style.fontWeight=a.style.display==='none'?'normal':'bold';});
        });
    }

    // Project Collaboration
    function initProjectCollaboration(){
        loadTeamListings();loadOpenSourceProjects();initTeamMatching();
    }

    function loadTeamListings(){
        const c=document.getElementById('team-listings');
        if(!c)return;
        const list=[{title:'E-commerce Platform',skills:['React','Node.js'],members:2,needed:3},{title:'Mobile Health App',skills:['Flutter','Firebase'],members:1,needed:2}];
        c.innerHTML=list.map(l=>`<div style="padding:15px;background:var(--color-surface);border-radius:8px;margin:10px 0;border-left:4px solid var(--color-primary);"><h4 style="margin:0 0 10px 0;color:var(--color-text);">${l.title}</h4><div style="margin-bottom:10px;">${l.skills.map(s=>`<span style="display:inline-block;padding:4px 8px;background:rgba(126,255,245,0.1);color:var(--color-primary);border-radius:12px;font-size:12px;margin-right:5px;">${s}</span>`).join('')}</div><div style="display:flex;justify-content:space-between;align-items:center;"><div style="color:var(--color-text-muted);font-size:14px;">${l.members} members • Need ${l.needed}</div><button class="join-team" style="padding:6px 12px;background:var(--color-primary);color:var(--color-bg);border:none;border-radius:6px;cursor:pointer;font-size:14px;">Join</button></div></div>`).join('');
        c.querySelectorAll('.join-team').forEach(b=>b.addEventListener('click',()=>alert('Request sent!')));
    }

    function loadOpenSourceProjects(){
        const c=document.getElementById('opensource-projects');
        if(!c)return;
        const p=[{name:'EthioCalendar.js',desc:'Ethiopian calendar library',stars:245},{name:'AmharicNLP',desc:'NLP toolkit',stars:189}];
        c.innerHTML=p.map(x=>`<div style="padding:15px;background:var(--color-surface);border-radius:8px;margin:10px 0;"><div style="display:flex;justify-content:space-between;"><div><h4 style="margin:0 0 5px 0;color:var(--color-text);">${x.name}</h4><p style="margin:0;color:var(--color-text-muted);font-size:14px;">${x.desc}</p></div><div style="color:var(--color-primary);font-weight:bold;"><i class="fas fa-star"></i> ${x.stars}</div></div><button style="margin-top:10px;padding:8px 16px;width:100%;background:rgba(126,255,245,0.1);color:var(--color-primary);border:1px solid var(--color-primary);border-radius:6px;cursor:pointer;">Contribute</button></div>`).join('');
    }

    function initTeamMatching(){/* placeholder */}

    // Learning Groups
    function initLearningGroups(){
        document.querySelectorAll('.btn-group').forEach(b=>b.addEventListener('click',function(){alert(`Joined!`);this.textContent='Joined ✓';this.disabled=true;}));
        document.getElementById('find-partner')?.addEventListener('click',()=>{
            const list=document.getElementById('partners-list');
            if(!list)return;
            list.innerHTML=[{name:'Alex M.',goal:'Learn React'}].map(p=>`<div style="padding:15px;background:var(--color-surface);border-radius:8px;margin:10px 0;"><div style="display:flex;justify-content:space-between;"><div><h4 style="margin:0;color:var(--color-text);">${p.name}</h4><div style="color:var(--color-text-muted);font-size:14px;">${p.goal}</div></div><button style="padding:6px 12px;background:var(--color-primary);color:var(--color-bg);border:none;border-radius:6px;cursor:pointer;">Connect</button></div></div>`).join('');
        });
    }

    // Gamification
    function initGamification(){updateUserPoints();initBadges();loadLeaderboards();}
    function updateUserPoints(){const el=document.getElementById('user-points');if(el)el.textContent=(1245+Math.floor(Math.random()*100)).toLocaleString();}
    function initBadges(){document.querySelectorAll('.badge').forEach(b=>{b.addEventListener('mouseenter',()=>b.style.transform='translateY(-5px)');b.addEventListener('mouseleave',()=>b.style.transform='translateY(0)');b.addEventListener('click',()=>alert(b.querySelector('.badge-name').textContent));});}
    function loadLeaderboards(){
        const c=document.getElementById('leaderboard-list');
        if(!c)return;
        const data=[{rank:1,name:'Elias Z.',points:450},{rank:2,name:'Beti T.',points:380}];
        c.innerHTML=data.map(e=>`<div style="display:flex;align-items:center;padding:12px;background:${e.rank===1?'rgba(126,255,245,0.1)':'transparent'};border-radius:8px;margin:5px 0;border-left:${e.rank<=3?'4px solid var(--color-primary)':'none'};"><div style="width:30px;height:30px;border-radius:50%;background:${e.rank===1?'gold':e.rank===2?'silver':'#cd7f32'};color:#000;display:flex;align-items:center;justify-content:center;font-weight:bold;margin-right:15px;">${e.rank}</div><div style="flex:1;"><div style="font-weight:bold;color:var(--color-text);">${e.name}</div></div><div style="background:var(--color-primary);color:var(--color-bg);padding:6px 12px;border-radius:20px;font-weight:bold;">${e.points} pts</div></div>`).join('');
        document.querySelectorAll('.lb-tab').forEach(t=>t.addEventListener('click',function(){document.querySelectorAll('.lb-tab').forEach(x=>x.classList.remove('active'));this.classList.add('active');}));
    }

    // Networking
    function initNetworkingFeatures(){
        document.getElementById('find-coffee-match')?.addEventListener('click',function(){
            const res=document.getElementById('coffee-match-result');
            this.innerHTML='<i class="fas fa-spinner fa-spin"></i>';this.disabled=true;
            setTimeout(()=>{
                res.innerHTML=`<div style="padding:20px;background:var(--color-surface);border-radius:8px;margin-top:15px;border:2px solid var(--color-primary);text-align:center;"><h4>Daniel T.</h4><p>Backend Engineer • Bahir Dar</p><button style="padding:10px 20px;background:var(--color-primary);color:var(--color-bg);border:none;border-radius:6px;cursor:pointer;">Start Chat</button></div>`;
                this.innerHTML='<i class="fas fa-random"></i> Find Coffee Match';this.disabled=false;
            },1500);
        });
        initJobReferralSystem();
    }

    function initJobReferralSystem(){/* placeholder */}

    // Resources
    function initCommunityResources(){
        const p=document.getElementById('policy-updates');
        if(p)p.innerHTML=[{t:'New Digital Strategy',d:'Nov 15, 2025'}].map(x=>`<div style="padding:10px;border-bottom:1px solid var(--color-border);"><div style="font-weight:bold;color:var(--color-text);">${x.t}</div><div style="font-size:12px;color:var(--color-text-muted);">${x.d}</div></div>`).join('');
    }

    // Realtime
    function initRealtimeFeatures(){initLiveChat();initCodePairing();initNewsFeed();}
    function initLiveChat(){
        const rooms=document.querySelectorAll('.chat-room');
        const container=document.getElementById('chat-container');
        rooms.forEach(r=>r.addEventListener('click',function(){rooms.forEach(x=>x.classList.remove('active'));this.classList.add('active');loadChatRoom(this.dataset.room,container);}));
        if(rooms.length)loadChatRoom(rooms[0].dataset.room,container);
    }

    function loadChatRoom(room,container){
        if(!container)return;
        const msgs=[{user:'Selam',text:'Hello!',time:'14:30'},{user:'Dawit',text:'Hi there',time:'14:32'}];
        container.innerHTML=`<div style="height:200px;overflow-y:auto;padding:10px;">${msgs.map(m=>`<div style="margin-bottom:15px;"><div style="font-weight:bold;color:var(--color-primary);">${m.user}</div><div style="background:var(--color-surface);padding:8px 12px;border-radius:8px;display:inline-block;">${m.text}</div></div>`).join('')}</div><div style="padding:10px;border-top:1px solid var(--color-border);display:flex;gap:10px;"><input type="text" placeholder="Type..." style="flex:1;padding:8px;background:var(--color-bg);color:var(--color-text);border:1px solid var(--color-border);border-radius:6px;"><button style="padding:8px 16px;background:var(--color-primary);color:var(--color-bg);border:none;border-radius:6px;cursor:pointer;"><i class="fas fa-paper-plane"></i></button></div>`;
    }

    function initCodePairing(){/* placeholder */}
    function initNewsFeed(){
        const f=document.getElementById('news-feed');
        if(!f)return;
        f.innerHTML=[{t:'Ethiopia AI Strategy',s:'Tech Africa',time:'2h ago'}].map(n=>`<div style="padding:15px;border-bottom:1px solid var(--color-border);"><div style="font-weight:bold;color:var(--color-text);">${n.t}</div><div style="display:flex;justify-content:space-between;color:var(--color-text-muted);font-size:14px;"><span>${n.s}</span><span>${n.time}</span></div></div>`).join('');
    }

    function updateEthiopianTime(){
        const el=document.getElementById('ethiopian-time');
        if(!el)return;
        el.textContent=new Date().toLocaleTimeString('en-US',{timeZone:'Africa/Addis_Ababa',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
    }

    function debounce(fn,ms){let t;return (...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms);};}
    </script>
</body>
</html>
