# TechBlog – Ethiopian Bloggers and Developers Website 

 ![License](https://img.shields.io/badge/license-MIT-white.svg)
 
  ## 🛠️Tools and Technologies We Will Use 
  
  [![Tools and Technologies](https://skillicons.dev/icons?i=html,css,js,github,git,vscode)](https://skillicons.dev)


---

##  Project Overview
TechBlog-Ethiopia is a comprehensive, modern tech blog platform designed to be the ultimate knowledge sharing hub for Ethiopian developers. It combines cutting-edge frontend technologies with an exceptional user experience to create a community-driven platform for tech enthusiasts, developers, and lifelong learners.


<br>

## 🎯 **CORE PURPOSE**
**A simple, clean Ethiopian tech blog sharing programming tutorials and local tech insights.**

### **1. HOME PAGE (`index.html`)**
- Show featured Ethiopian tech articles
- Display recent posts by Ethiopian developers
- Simple "About TechBlog Ethiopia" intro
- Newsletter signup for local tech updates

### **2. BLOG PAGE (`articles.html`)**
- List all technical articles
- Filter by categories (Web Dev, Mobile, Ethiopian Tech)
- Search articles by title/content
- Show post date and reading time

### **3. SINGLE POST (`post.html`)**
- Display full article with proper formatting
- Code snippets with syntax highlighting
- Author info (Ethiopian developer)
- Related posts suggestions

### **4. ABOUT PAGE (`about.html`)**
- Story behind TechBlog Ethiopia
- Mission to support Ethiopian developers
- Author/team information
- Contact methods

### **5. CONTACT PAGE (`contact.html`)**
- Simple contact form
- Email, social media links
- Location (Ethiopia-based)

### **6. RESOURCES PAGE (`resources.html`)**
- Curated list of useful tools for Ethiopian developers
- Local tech communities and meetups
- Learning resources relevant to Ethiopia

## 🛠 **MINIMUM TECHNICAL FEATURES**

### **CONTENT**
- Technical tutorials that work in Ethiopia
- Code examples tested in local environment
- Articles focused on technologies used in Ethiopian market

### **DESIGN**
- Clean, readable layout
- Mobile-friendly for Ethiopia's mobile-first users
- Fast loading for varying internet speeds

### **FUNCTIONALITY**
- Working contact form
- Working newsletter signup
- Basic search and filtering
- Code copy functionality

## ⚡ **WHAT MAKES IT ETHIOPIAN**
- Content relevant to Ethiopian developers
- Local tech ecosystem focus
- Solutions considering Ethiopian infrastructure
- Community-oriented approach

<br>

## 3. Project Structure

```
TechBlog/
project-root/
├── assets/
|   |──images/
|   |──icons/
│   ├── css/
│   │   ├── main.css 
│   │   ├── animations.css 
│   │   ├── index.css
│   │   ├── articles.css
│   │   ├── post.css
│   │   ├── about.css
│   │   ├── contact.css
│   │   └── resources.css 
│   └── js/
│       ├── main.js 
│       ├── utils.js 
│       ├── animations.js 
│       ├── index.js 
│       ├── articles.js
│       ├── post.js 
│       ├── about.js
│       ├── contact.js
│       └── resources.js 
|   |──docs/
├── index.html 
├── articles.html
├── post.html
├── main.html
├── resources.html
├── about.html 
├── contact.html
├── footer.html 
├── sitemap.xml
└── README.md 

```

---

## 4. Technologies Used
- HTML5: Page structure  
- CSS3: Styling and responsive layout  
- JavaScript (Vanilla): Search, filter, theme switching, and interactivity  
- Git and GitHub: Version control  
- VS Code: Development environment  

<br>

## 5. How to Run the Project
No installation or setup is required.

1. Clone the repository:
   ```
   git clone https://github.com/lelisa21/Blog-App.git
   ```
2. Open `index.html` in any web browser.

Everything runs on the client side.

<br>

## 6. Version Control Workflow

### Branching Strategy
A simple and clean structure:

```
main           → stable production code
html-branch    → active development
css-branch
js-branch
feature/...    → new features
```

Example feature branches but not added to repo:
```
feature/search
feature/category-filter
feature/theme-switcher
feature/responsive-nav
```

### Commit Message Style
 use clear and descriptive messages:

- Add: new feature or file
- Fix: bug fixes
- Update: improvements or modifications
- Remove: deleted files or unused code
- Refactor: code restructuring

Examples:
```
Add: search bar functionality
Fix: mobile menu alignment issue
Update: improve dark mode colors
Refactor: simplify filter logic
```

### Pull Request Guidelines

1. Create a feature branch  
2. Commit changes regularly  
3. Push branch and open a pull request to `development`  
4. Include a clear summary of what changed  
5. Merge after review  

<br>

## 7. Roadmap (Planned Improvements)
- Add bookmarking using LocalStorage  
- Allow users to like posts  
- Add tag-based filtering  
- Implement a reading progress indicator  
- Add a simple client-side admin mode
- Future upgrade to a backend using PHP  and reltime upadte  by using Socket.io


