# TechBlog – A Minimal and Responsive Blog Website 

 ![License](https://img.shields.io/badge/license-MIT-white.svg)
 
  # 🛠️Tools and Technologies We Will Use 
  
  [![Tools and Technologies](https://skillicons.dev/icons?i=html,css,js,github,git,vscode)](https://skillicons.dev)

A simple and user-friendly tech blog built entirely with HTML, CSS, and JavaScript.  
The project focuses on clean design, responsive layout, and essential blog functionalities without using any frameworks or backend services.

---

## 1. Overview
TechBlog is a front-end only project created to demonstrate core web development skills. It provides a structured layout for browsing articles, filtering posts by category, performing client-side search, and switching between light and dark themes.

The design emphasizes clarity, readability, and ease of use. All interactivity is handled with vanilla JavaScript, making this project lightweight and easy to understand.

<br>

## 2. Features

### Core Features
- Multi-page website (Home, Articles, Categories, Contact)
- Display of blog articles using HTML templates or JavaScript
- Client-side search functionality
- Category-based filtering
- Light and dark theme switcher
- Fully responsive design using CSS media queries
- Clean and readable article layout

### Small Enhancements (All Front-End Only)
- Featured article section on the homepage
- Recently added articles list
- Smooth scroll for navigation
- Simple CSS animations and transitions
- Sticky navigation bar
- Back-to-top button
- Optional reading progress bar on article pages

<br>

## 3. Project Structure

```
TechBlog/
│
├── index.html
├── articles.html
├── categories.html
├── contact.html
│
├── css/
│   ├── style.css
│   ├── responsive.css
│   └── theme.css
│
├── js/
│   ├── data.js
│   ├── search.js
│   ├── filter.js
│   ├── theme.js
│   └── app.js
│
└── assets/
    ├── images/
    └── icons/
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
   git clone https://github.com/lelisa21/TechBlog.git
   ```
2. Open `index.html` in any web browser.

Everything runs on the client side.

<br>

## 6. Version Control Workflow

### Branching Strategy
A simple and clean structure:

```
main           → stable production code
development    → active development
feature/...    → new features
```

Example feature branches:
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
- Future upgrade to a backend using Node.js, Express, and MongoDB  


