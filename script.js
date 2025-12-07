// GitHub API Configuration
const GITHUB_API_BASE = 'https://api.github.com';

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const githubUsernameInput = document.getElementById('github-username');
const loadProjectsBtn = document.getElementById('load-projects');
const projectsGrid = document.getElementById('projects-grid');
const loadingState = document.getElementById('loading');
const errorState = document.getElementById('error');
const errorMessage = document.getElementById('error-message');
const viewMoreContainer = document.getElementById('view-more-container');
const viewMoreGithub = document.getElementById('view-more-github');
const githubLink = document.getElementById('github-link');
const contactForm = document.getElementById('contact-form');

// Mobile Menu Toggle
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Relevance keywords for NLP/ML projects
const RELEVANT_KEYWORDS = [
    'nlp', 'natural-language', 'language-model', 'llm', 'transformer',
    'machine-learning', 'deep-learning', 'ml', 'ai', 'artificial-intelligence',
    'neural-network', 'pytorch', 'tensorflow', 'huggingface', 'bert', 'gpt',
    'reinforcement-learning', 'rl', 'fine-tuning', 'fine-tune', 'lora',
    'computer-vision', 'cv', 'speech', 'audio', 'text', 'embedding',
    'dataset', 'model', 'training', 'inference', 'evaluation', 'benchmark',
    'indic', 'multilingual', 'conversation', 'dialogue', 'chatbot',
    'sentiment', 'classification', 'ner', 'ner', 'tokenization', 'preprocessing'
];

// Exclude patterns (repos to hide)
const EXCLUDE_PATTERNS = [
    /^test/i, /^demo/i, /^example/i, /^sample/i, /^temp/i, /^tmp/i,
    /^old/i, /^backup/i, /^archive/i, /^deprecated/i, /^wip/i,
    /portfolio/i, /website/i, /blog/i, /resume/i, /cv/i
];

// Relevant programming languages
const RELEVANT_LANGUAGES = ['Python', 'Jupyter Notebook', 'C++', 'JavaScript', 'TypeScript', 'R', 'MATLAB', 'Shell'];

// Filter and score repositories for relevance
function filterRelevantRepos(repos) {
    return repos
        .filter(repo => {
            // Exclude forks
            if (repo.fork) return false;
            
            // Exclude archived repos
            if (repo.archived) return false;
            
            // Exclude repos matching exclude patterns
            if (EXCLUDE_PATTERNS.some(pattern => pattern.test(repo.name))) return false;
            
            // Exclude repos with no description (likely not maintained)
            if (!repo.description || repo.description.trim().length < 10) return false;
            
            // Exclude very small repos (likely incomplete)
            if (repo.size < 1) return false;
            
            return true;
        })
        .map(repo => {
            // Calculate relevance score
            let score = 0;
            const nameLower = repo.name.toLowerCase();
            const descLower = (repo.description || '').toLowerCase();
            const combinedText = `${nameLower} ${descLower}`;
            
            // Check for relevant keywords
            RELEVANT_KEYWORDS.forEach(keyword => {
                if (combinedText.includes(keyword)) {
                    score += 10;
                }
            });
            
            // Bonus for relevant languages
            if (RELEVANT_LANGUAGES.includes(repo.language)) {
                score += 15;
            }
            
            // Bonus for stars (indicates quality/interest)
            score += Math.min(repo.stargazers_count * 2, 20);
            
            // Bonus for forks (indicates usefulness)
            score += Math.min(repo.forks_count, 10);
            
            // Bonus for recent updates (indicates active maintenance)
            const daysSinceUpdate = (Date.now() - new Date(repo.updated_at)) / (1000 * 60 * 60 * 24);
            if (daysSinceUpdate < 30) score += 10;
            else if (daysSinceUpdate < 90) score += 5;
            else if (daysSinceUpdate < 180) score += 2;
            
            // Bonus if has topics
            if (repo.topics && repo.topics.length > 0) {
                score += repo.topics.length * 3;
            }
            
            // Bonus if has README (indicates documentation)
            if (repo.has_wiki || repo.has_pages) score += 5;
            
            return { ...repo, relevanceScore: score };
        })
        .filter(repo => repo.relevanceScore >= 5) // Minimum relevance threshold
        .sort((a, b) => {
            // Sort by relevance score first, then by stars, then by updated date
            if (b.relevanceScore !== a.relevanceScore) {
                return b.relevanceScore - a.relevanceScore;
            }
            const starDiff = (b.stargazers_count || 0) - (a.stargazers_count || 0);
            if (starDiff !== 0) return starDiff;
            return new Date(b.updated_at) - new Date(a.updated_at);
        });
}

// Load projects from GitHub
async function fetchGitHubRepos(username) {
    try {
        const response = await fetch(`${GITHUB_API_BASE}/users/${username}/repos?sort=updated&per_page=100&type=all`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('User not found. Please check the username.');
            } else if (response.status === 403) {
                throw new Error('API rate limit exceeded. Please try again later.');
            }
            throw new Error(`Failed to fetch repositories: ${response.statusText}`);
        }
        
        const repos = await response.json();
        // Filter and score repositories for relevance
        return filterRelevantRepos(repos);
    } catch (error) {
        throw error;
    }
}

// Fetch user statistics
async function fetchUserStats(username) {
    try {
        const [userResponse, reposResponse] = await Promise.all([
            fetch(`${GITHUB_API_BASE}/users/${username}`),
            fetch(`${GITHUB_API_BASE}/users/${username}/repos?per_page=100&type=all`)
        ]);
        
        if (!userResponse.ok || !reposResponse.ok) {
            return null;
        }
        
        const user = await userResponse.json();
        const repos = await reposResponse.json();
        
        const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
        const contributions = user.public_repos; // Approximate
        
        return {
            repos: user.public_repos,
            stars: totalStars,
            contributions: contributions
        };
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return null;
    }
}

// Get language colors (common programming languages)
function getLanguageColor(language) {
    const colors = {
        'Python': '#3776ab',
        'JavaScript': '#f7df1e',
        'TypeScript': '#3178c6',
        'Java': '#ed8b00',
        'C++': '#00599c',
        'C': '#a8b9cc',
        'C#': '#239120',
        'Go': '#00add8',
        'Rust': '#000000',
        'PHP': '#777bb4',
        'Ruby': '#cc342d',
        'Swift': '#fa7343',
        'Kotlin': '#7f52ff',
        'Scala': '#dc322f',
        'R': '#276dc3',
        'MATLAB': '#e16737',
        'Shell': '#89e051',
        'HTML': '#e34c26',
        'CSS': '#1572b6',
        'Jupyter Notebook': '#da5b0b',
        'Dockerfile': '#384d54',
        'Vue': '#4fc08d',
        'React': '#61dafb',
        'Angular': '#dd0031'
    };
    return colors[language] || '#6366f1';
}

// Create project card element
function createProjectCard(repo) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const languages = repo.language ? [repo.language] : [];
    const languagesHTML = languages.map(lang => 
        `<span class="language-tag" style="border-left: 3px solid ${getLanguageColor(lang)}">${lang}</span>`
    ).join('');
    
    const description = repo.description || 'No description available.';
    const stars = repo.stargazers_count || 0;
    const forks = repo.forks_count || 0;
    const updated = new Date(repo.updated_at).toLocaleDateString();
    
    card.innerHTML = `
        <div class="project-header">
            <div>
                <h3 class="project-title">
                    <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
                        ${repo.name}
                    </a>
                </h3>
                <div class="project-stats">
                    <span><i class="fas fa-star"></i> ${stars}</span>
                    <span><i class="fas fa-code-branch"></i> ${forks}</span>
                    <span><i class="fas fa-calendar"></i> ${updated}</span>
                </div>
            </div>
        </div>
        <p class="project-description">${description}</p>
        <div class="project-footer">
            <div class="project-languages">
                ${languagesHTML || '<span class="language-tag">No language detected</span>'}
            </div>
            <a href="${repo.html_url}" class="project-link" target="_blank" rel="noopener noreferrer">
                View <i class="fas fa-external-link-alt"></i>
            </a>
        </div>
    `;
    
    return card;
}

// Display projects
function displayProjects(repos) {
    projectsGrid.innerHTML = '';
    
    if (repos.length === 0) {
        errorState.style.display = 'block';
        errorMessage.textContent = 'No relevant repositories found. Repositories are filtered to show only NLP/ML related projects.';
        return;
    }
    
    // Repos are already sorted by relevance score
    // Display top 12 most relevant projects
    const topRepos = repos.slice(0, 12);
    
    topRepos.forEach(repo => {
        const card = createProjectCard(repo);
        projectsGrid.appendChild(card);
    });
    
    // Show "View More" button if there are more repos
    if (repos.length > 12) {
        viewMoreContainer.style.display = 'block';
    }
    
    // Log filtering info (for debugging)
    console.log(`Displayed ${topRepos.length} relevant repositories out of ${repos.length} filtered repos`);
}

// Load projects button handler
loadProjectsBtn.addEventListener('click', async () => {
    const username = githubUsernameInput.value.trim();
    
    if (!username) {
        errorState.style.display = 'block';
        errorMessage.textContent = 'Please enter a GitHub username.';
        return;
    }
    
    // Hide error, show loading
    errorState.style.display = 'none';
    loadingState.style.display = 'block';
    projectsGrid.innerHTML = '';
    viewMoreContainer.style.display = 'none';
    
    try {
        // Fetch repositories and stats
        const [repos, stats] = await Promise.all([
            fetchGitHubRepos(username),
            fetchUserStats(username)
        ]);
        
        // Update stats
        if (stats) {
            document.getElementById('github-repos').textContent = stats.repos || 0;
            document.getElementById('github-stars').textContent = stats.stars || 0;
            document.getElementById('github-contributions').textContent = stats.contributions || 0;
        }
        
        // Update GitHub link
        githubLink.href = `https://github.com/${username}`;
        githubLink.textContent = `github.com/${username}`;
        viewMoreGithub.href = `https://github.com/${username}?tab=repositories`;
        
        // Display projects
        displayProjects(repos);
        
        // Hide loading
        loadingState.style.display = 'none';
        
        // Scroll to projects section
        document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        loadingState.style.display = 'none';
        errorState.style.display = 'block';
        errorMessage.textContent = error.message || 'An error occurred while fetching repositories.';
    }
});

// Allow Enter key to trigger load
githubUsernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loadProjectsBtn.click();
    }
});

// Contact form handler
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const name = contactForm.querySelector('input[type="text"]').value;
    const email = contactForm.querySelector('input[type="email"]').value;
    const message = contactForm.querySelector('textarea').value;
    
    // In a real application, you would send this to a backend
    // For now, we'll just show a success message
    alert(`Thank you for your message, ${name}! I'll get back to you at ${email} soon.`);
    
    // Reset form
    contactForm.reset();
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe project cards for animation
document.addEventListener('DOMContentLoaded', () => {
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Try to load username from localStorage
window.addEventListener('DOMContentLoaded', () => {
    const savedUsername = localStorage.getItem('githubUsername');
    if (savedUsername) {
        githubUsernameInput.value = savedUsername;
    }
});

// Save username to localStorage when loading projects
loadProjectsBtn.addEventListener('click', () => {
    const username = githubUsernameInput.value.trim();
    if (username) {
        localStorage.setItem('githubUsername', username);
    }
});

// Auto-load projects on page load if username is set
window.addEventListener('DOMContentLoaded', async () => {
    const username = githubUsernameInput.value.trim() || localStorage.getItem('githubUsername');
    if (username && username.trim()) {
        githubUsernameInput.value = username;
        localStorage.setItem('githubUsername', username);
        // Auto-load after a short delay to ensure page is fully loaded
        setTimeout(() => {
            loadProjectsBtn.click();
        }, 1000);
    }
});

