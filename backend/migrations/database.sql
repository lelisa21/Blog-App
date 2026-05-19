
DROP DATABASE IF EXISTS techblog;
CREATE DATABASE techblog;
USE techblog;


-- Users table - stores all registered users
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar VARCHAR(255) DEFAULT 'default-avatar.png',
    bio TEXT,
    location VARCHAR(100),
    skill_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
);

-- User sessions table - for login sessions
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (session_token),
    INDEX idx_expires (expires_at)
);

CREATE TABLE user_settings (
    user_id INT PRIMARY KEY,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    two_factor_auth BOOLEAN DEFAULT FALSE,
    theme ENUM('dark', 'light', 'auto') DEFAULT 'dark',
    font_size ENUM('small', 'medium', 'large') DEFAULT 'medium',
    language VARCHAR(10) DEFAULT 'en',
    profile_visibility ENUM('public', 'community', 'private') DEFAULT 'community',
    activity_visibility BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Newsletter subscribers table
CREATE TABLE newsletter_subscribers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);


-- Categories table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon_class VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
);

-- Articles table - main content
CREATE TABLE articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    excerpt TEXT,
    content LONGTEXT NOT NULL,
    featured_image VARCHAR(255),
    author_id INT NOT NULL,
    category_id INT,
    reading_time INT DEFAULT 5,
    views INT DEFAULT 0,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_status_published (status, published_at),
    INDEX idx_author (author_id),
    FULLTEXT INDEX idx_search (title, content, excerpt)
);

-- Tags table
CREATE TABLE tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Article-Tag relationship (many-to-many)
CREATE TABLE article_tags (
    article_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (article_id, tag_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Comments table (supports nested comments)
CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    article_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_id INT NULL,
    content TEXT NOT NULL,
    likes INT DEFAULT 0,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_article (article_id),
    INDEX idx_parent (parent_id)
);

-- Article likes table
CREATE TABLE article_likes (
    user_id INT NOT NULL,
    article_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, article_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- Bookmarks table
CREATE TABLE bookmarks (
    user_id INT NOT NULL,
    article_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, article_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);



-- Forum topics table
CREATE TABLE forum_topics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    author_id INT NOT NULL,
    category ENUM('general', 'help', 'jobs', 'projects', 'announcements') DEFAULT 'general',
    views INT DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id),
    INDEX idx_category_pinned (category, is_pinned, created_at),
    INDEX idx_slug (slug)
);

-- Forum replies table
CREATE TABLE forum_replies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    topic_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    likes INT DEFAULT 0,
    is_solution BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES forum_topics(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_topic (topic_id, created_at)
);

-- User skills table
CREATE TABLE user_skills (
    user_id INT NOT NULL,
    skill_name VARCHAR(50) NOT NULL,
    proficiency_level ENUM('beginner', 'intermediate', 'expert') DEFAULT 'beginner',
    PRIMARY KEY (user_id, skill_name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_skill (skill_name)
);

-- Mentorship requests table
CREATE TABLE mentorship_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mentor_id INT NOT NULL,
    mentee_id INT NOT NULL,
    skill_area VARCHAR(50),
    message TEXT,
    status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY (mentor_id) REFERENCES users(id),
    FOREIGN KEY (mentee_id) REFERENCES users(id),
    CHECK (mentor_id != mentee_id),
    INDEX idx_status (status, requested_at)
);



-- Events table
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    event_type ENUM('meetup', 'workshop', 'hackathon', 'conference', 'virtual') NOT NULL,
    venue_name VARCHAR(200),
    city VARCHAR(100),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_virtual BOOLEAN DEFAULT FALSE,
    meeting_link VARCHAR(255),
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    capacity INT DEFAULT 50,
    registration_fee DECIMAL(10, 2) DEFAULT 0,
    organizer_id INT NOT NULL,
    status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id),
    INDEX idx_dates (start_date, end_date, status),
    INDEX idx_city (city),
    INDEX idx_slug (slug)
);

-- Event attendees (RSVP) table
CREATE TABLE event_attendees (
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('interested', 'going', 'waitlist', 'cancelled') DEFAULT 'going',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checked_in BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (event_id, user_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status)
);

-- Event reminders table
CREATE TABLE event_reminders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    reminder_time DATETIME NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reminder (reminder_time, is_sent)
);


-- Resources table (downloads, tutorials, etc.)
CREATE TABLE resources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type ENUM('template', 'cheatsheet', 'tutorial', 'tool', 'ebook') NOT NULL,
    file_path VARCHAR(255),
    download_url VARCHAR(255),
    file_size INT,
    download_count INT DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    category VARCHAR(50),
    uploaded_by INT NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_type (type, download_count)
);

-- Resource ratings table
CREATE TABLE resource_ratings (
    resource_id INT NOT NULL,
    user_id INT NOT NULL,
    rating TINYINT CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (resource_id, user_id),
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User learning progress table
CREATE TABLE user_learning_progress (
    user_id INT NOT NULL,
    resource_id INT NOT NULL,
    progress_percent INT DEFAULT 0,
    completed_at TIMESTAMP NULL,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, resource_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- Static site pages (about, etc.)
CREATE TABLE site_pages (
    slug VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    meta_description TEXT,
    content JSON NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Contact messages table
CREATE TABLE contact_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    user_agent TEXT,
    ip_address VARCHAR(45),
    is_read BOOLEAN DEFAULT FALSE,
    replied_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_read (is_read, created_at)
);


-- Insert default admin user (password: admin123)
-- Hash below is bcrypt of 'admin123' (cost=10). Use setup.php which auto-generates a fresh hash.
INSERT INTO users (username, email, password_hash, full_name, is_active) VALUES
('admin', 'admin@etc.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', TRUE);

-- Insert sample categories
INSERT INTO categories (name, slug, description) VALUES
('Web Development', 'web-development', 'Articles about web development'),
('Mobile Development', 'mobile-development', 'Mobile app development guides'),
('AI & Machine Learning', 'ai-ml', 'Artificial intelligence and ML content'),
('DevOps', 'devops', 'DevOps and cloud computing');

-- Insert sample tags
INSERT INTO tags (name, slug) VALUES
('php', 'php'),
('javascript', 'javascript'),
('python', 'python'),
('react', 'react'),
('flutter', 'flutter');

-- Downloadable resources and learning-path trackers (uploaded_by = admin user id 1)
INSERT INTO resources (title, description, type, file_path, download_url, file_size, category, uploaded_by, is_featured) VALUES
('Ethiopian Tech Templates', 'Contract templates and project proposals for Ethiopian developers.', 'template', 'storage/downloads/ethiopian-tech-templates.html', NULL, 24576, 'downloads', 1, TRUE),
('Localized Cheatsheets', 'React/Chapa setup and deployment quick-reference guides.', 'cheatsheet', 'storage/downloads/localized-cheatsheets.html', NULL, 18432, 'downloads', 1, TRUE),
('Offline Tutorials', 'PDF-style guides optimized for slow internet access.', 'ebook', 'storage/downloads/offline-tutorials.html', NULL, 51200, 'downloads', 1, TRUE),
('Ethiopian Web Developer Path', 'Interactive learning path for web development in Ethiopia.', 'tutorial', NULL, NULL, NULL, 'learning-path-web', 1, FALSE),
('Mobile App Developer Path', 'Flutter and Android-focused path for the Ethiopian market.', 'tutorial', NULL, NULL, NULL, 'learning-path-mobile', 1, FALSE),
('AI & Data Science Track', 'Python, ML, and local AI projects learning path.', 'tutorial', NULL, NULL, NULL, 'learning-path-ai', 1, FALSE),
('Developer Resources Hub', 'Meta resource for rating the resources page.', 'tool', NULL, NULL, NULL, 'hub', 1, TRUE);

-- About page static content
INSERT INTO site_pages (slug, title, meta_description, content) VALUES
('about', 'About Ethiopian Tech Community', 'About ETC — mission, values, and team behind this mini project.', JSON_OBJECT(
    'hero', JSON_OBJECT(
        'title', 'About Ethiopian Tech Community',
        'subtitle', 'ETC is a vibrant, volunteer-driven platform dedicated to empowering Ethiopian developers through knowledge sharing, collaboration, and community building in Ethiopia''s fast-growing tech ecosystem.'
    ),
    'story', JSON_ARRAY(
        'Powered by TechBlog Ethiopia, ETC serves as the go-to hub for high-quality tutorials, articles, resources, events, and discussions tailored to Ethiopian developers.',
        'We bridge local talent with global opportunities, highlight Ethiopian innovations, and support the nation''s Digital Ethiopia 2025 vision by fostering digital skills and inclusive growth.',
        'Whether you''re a beginner or seasoned pro, ETC welcomes all to learn, share, and connect.'
    ),
    'mission', JSON_ARRAY(
        'Deliver accessible, high-quality content in web dev, mobile, AI, cybersecurity, and emerging tech.',
        'Connect Ethiopian developers with mentorship, jobs, and global networks.',
        'Showcase local startups, success stories, and innovations.',
        'Contribute to building a thriving digital economy in Ethiopia.'
    ),
    'values', JSON_ARRAY(
        JSON_OBJECT('name', 'Inclusivity', 'description', 'Open to all backgrounds, levels, and locations.'),
        JSON_OBJECT('name', 'Collaboration', 'description', 'Embracing open-source and community-driven progress.'),
        JSON_OBJECT('name', 'Innovation', 'description', 'Encouraging creative solutions to real-world challenges.'),
        JSON_OBJECT('name', 'Empowerment', 'description', 'Equipping Ethiopians to excel in tech globally.')
    ),
    'team', JSON_ARRAY('Lelisa', 'Ruth', 'Sami', 'Hanif', 'Sefefe', 'Sahleselase'),
    'image', '/assets/images/Addis Ababa Ethiopia.jpg',
    'contact', JSON_OBJECT(
        'email', 'hello@techblogethiopia.com',
        'telegram', '@ETC_Ethiopia',
        'discord', 'discord.gg/etc-ethiopia',
        'location', 'Addis Ababa, Ethiopia'
    )
));

-- Sample community members (password for all: admin123)
INSERT INTO users (username, email, password_hash, full_name, bio, location, skill_level, is_active) VALUES
('lelisa', 'lelisa@etc.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lelisa Bekele', 'Full-stack developer passionate about Ethiopian startups.', 'Addis Ababa', 'advanced', TRUE),
('ruth', 'ruth@etc.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ruth Tadesse', 'Mobile engineer building Flutter apps for local businesses.', 'Hawassa', 'intermediate', TRUE),
('sami', 'sami@etc.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sami Nurhussein', 'Backend developer and open-source contributor.', 'Addis Ababa', 'advanced', TRUE);

INSERT INTO user_skills (user_id, skill_name, proficiency_level) VALUES
(2, 'PHP', 'expert'),
(2, 'JavaScript', 'expert'),
(3, 'Flutter', 'expert'),
(3, 'Dart', 'intermediate'),
(4, 'MySQL', 'expert'),
(4, 'API Design', 'expert');

-- Sample published articles
INSERT INTO articles (title, slug, excerpt, content, author_id, category_id, reading_time, status, published_at) VALUES
('Building REST APIs with PHP for Ethiopian Startups', 'building-rest-apis-php-ethiopia',
 'Learn how to structure a clean PHP API that works well on modest hosting and slow connections.',
 '<p>Ethiopian startups need backends that are simple to deploy and maintain. This guide walks through routing, JWT auth, and MySQL patterns used in the TechBlog project.</p>',
 1, 1, 6, 'published', NOW()),
('Flutter Payment Integration with Chapa', 'flutter-chapa-payment-integration',
 'Step-by-step guide to accepting payments in Ethiopian Birr using Chapa.',
 '<p>Mobile apps in Ethiopia increasingly need local payment gateways. We cover sandbox setup, webhook verification, and UX patterns for unreliable networks.</p>',
 3, 2, 8, 'published', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('Intro to Machine Learning with Python', 'intro-machine-learning-python-ethiopia',
 'A beginner-friendly path to ML using datasets relevant to East Africa.',
 '<p>From NumPy basics to a simple crop-yield predictor — practical ML for developers in Addis and beyond.</p>',
 4, 3, 10, 'published', DATE_SUB(NOW(), INTERVAL 7 DAY));

INSERT INTO article_tags (article_id, tag_id) VALUES
(1, 1), (1, 2),
(2, 2), (2, 5),
(3, 3);

-- Sample events
INSERT INTO events (title, slug, description, event_type, venue_name, city, is_virtual, start_date, end_date, capacity, organizer_id, status) VALUES
('Addis Developer Meetup', 'addis-developer-meetup',
 'Monthly in-person meetup for web and mobile developers in Addis Ababa.',
 'meetup', 'Iceaddis', 'Addis Ababa', FALSE,
 DATE_ADD(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY) + INTERVAL 3 HOUR, 80, 1, 'upcoming'),
('ETC Virtual Hackathon 2026', 'etc-virtual-hackathon-2026',
 '48-hour online hackathon focused on fintech and education tools for Ethiopia.',
 'hackathon', NULL, NULL, TRUE,
 DATE_ADD(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 32 DAY), 200, 2, 'upcoming');

-- Sample forum topics
INSERT INTO forum_topics (title, slug, content, author_id, category, is_pinned) VALUES
('Best hosting options for PHP apps in Ethiopia?', 'best-hosting-php-ethiopia',
 'Looking for affordable hosting with MySQL support. What are you using for side projects?',
 3, 'help', TRUE),
('Hiring: Junior React developer in Addis', 'hiring-junior-react-addis',
 'Our startup is hiring a junior frontend dev. Remote-friendly twice per week.',
 2, 'jobs', FALSE);

INSERT INTO forum_replies (topic_id, user_id, content, is_solution) VALUES
(1, 4, 'I use a VPS with Nginx + PHP-FPM. Works well if you configure OPcache.', TRUE),
(1, 1, 'Shared hosting is fine for prototypes — migrate when traffic grows.', FALSE);


-- Show all tables
SHOW TABLES;

-- Show table counts
SELECT 
    'users' as table_name, COUNT(*) as count FROM users UNION
SELECT 'articles', COUNT(*) FROM articles UNION
SELECT 'comments', COUNT(*) FROM comments UNION
SELECT 'events', COUNT(*) FROM events;


