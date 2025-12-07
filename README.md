# NLP Engineer Portfolio Website

A modern, responsive portfolio website designed for NLP engineers to showcase their GitHub projects and technical skills to recruiters.

## Features

- 🎨 **Modern Design**: Beautiful dark theme with gradient accents
- 📱 **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- 🔗 **GitHub Integration**: Automatically fetches and displays your GitHub repositories
- 📊 **Statistics Dashboard**: Shows repository count, stars, and contributions
- 🎯 **Project Showcase**: Highlights your top projects with descriptions, languages, and stats
- 💼 **Skills Section**: Display your technical expertise
- 📧 **Contact Form**: Easy way for recruiters to reach out
- ⚡ **Fast & Lightweight**: No heavy frameworks, pure HTML/CSS/JavaScript

## Getting Started

### 1. Basic Setup

1. Open `index.html` in your web browser
2. Enter your GitHub username in the input field
3. Click "Load Projects" to fetch and display your repositories

### 2. Customization

#### Update Personal Information

Edit `index.html` to customize:

- **About Section**: Update the about text with your own description
- **Contact Information**: 
  - Update LinkedIn profile link
  - Update email address
  - The GitHub link will be automatically updated when you load projects

#### Customize Colors

Edit `styles.css` and modify the CSS variables in the `:root` selector:

```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    --accent-color: #ec4899;
    /* ... other variables */
}
```

#### Update Skills

Edit the skills section in `index.html` to match your expertise:

```html
<div class="skill-category">
    <h3><i class="fas fa-code"></i> Programming Languages</h3>
    <div class="skill-tags">
        <span class="skill-tag">Python</span>
        <span class="skill-tag">JavaScript</span>
        <!-- Add your skills here -->
    </div>
</div>
```

### 3. Deployment

#### Option 1: GitHub Pages (Recommended)

1. Create a new repository on GitHub
2. Upload all files to the repository
3. Go to Settings → Pages
4. Select the main branch as source
5. Your portfolio will be live at `https://yourusername.github.io/repository-name`

#### Option 2: Netlify

1. Sign up for a free Netlify account
2. Drag and drop the project folder to Netlify
3. Your site will be live instantly

#### Option 3: Vercel

1. Sign up for a free Vercel account
2. Import your repository
3. Deploy with one click

## How It Works

### GitHub API Integration

The website uses the GitHub REST API to:
- Fetch your public repositories
- Get repository statistics (stars, forks, languages)
- Display project descriptions and metadata
- Show your GitHub profile statistics

**Note**: The GitHub API has rate limits:
- 60 requests per hour for unauthenticated requests
- 5,000 requests per hour for authenticated requests

For higher rate limits, you can add a GitHub Personal Access Token (see Advanced Configuration below).

### Project Display

- Projects are sorted by stars and last updated date
- Top 12 projects are displayed by default
- Each project card shows:
  - Repository name
  - Description
  - Programming languages
  - Star and fork counts
  - Last updated date
  - Direct link to GitHub repository

## Advanced Configuration

### Using GitHub Personal Access Token (Optional)

For higher API rate limits, you can use a GitHub Personal Access Token:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with `public_repo` scope
3. Update `script.js`:

```javascript
const GITHUB_TOKEN = 'your_token_here';

async function fetchGitHubRepos(username) {
    const headers = {
        'Authorization': `token ${GITHUB_TOKEN}`
    };
    const response = await fetch(
        `${GITHUB_API_BASE}/users/${username}/repos?sort=updated&per_page=100&type=all`,
        { headers }
    );
    // ... rest of the code
}
```

**⚠️ Security Note**: Never commit your token to a public repository. Use environment variables or a backend service for production.

### Customizing Project Filtering

You can modify the project filtering logic in `script.js`:

```javascript
// Filter by specific topics or keywords
const filteredRepos = repos.filter(repo => {
    return repo.topics.includes('nlp') || 
           repo.topics.includes('machine-learning') ||
           repo.name.toLowerCase().includes('nlp');
});
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## File Structure

```
portfolio/
├── index.html      # Main HTML file
├── styles.css      # All styling
├── script.js       # JavaScript functionality
└── README.md       # This file
```

## Tips for Recruiters

1. **Enter GitHub Username**: Simply enter your GitHub username to see all projects
2. **Project Highlights**: The top projects are automatically sorted by popularity
3. **Skills Match**: Check the skills section to see technical expertise
4. **Contact**: Use the contact form or links to reach out

## Troubleshooting

### Projects Not Loading

- Check if the GitHub username is correct
- Verify your internet connection
- Check browser console for API errors
- GitHub API might be rate-limited (try again later)

### Styling Issues

- Clear browser cache
- Ensure `styles.css` is properly linked
- Check browser console for CSS errors

## License

This project is open source and available for personal and commercial use.

## Contributing

Feel free to fork this project and customize it for your needs!

---

**Made with ❤️ for NLP Engineers**

