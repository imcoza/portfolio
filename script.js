// ============================================================================
// PORTFOLIO CONFIGURATION - Easy to customize without changing code logic
// ============================================================================

// GitHub API Configuration
const GITHUB_API_BASE = 'https://api.github.com';

// ============================================================================
// REPOSITORY SELECTION CONFIGURATION
// ============================================================================
// 
// HOW TO SELECT WHICH REPOS SHOW ON YOUR PORTFOLIO:
//
// METHOD 1: Use GitHub Topics (RECOMMENDED - No code changes needed!)
//   - Go to any repository on GitHub
//   - Click the gear icon (⚙️) next to "About"
//   - Add topic: "portfolio" or "showcase"
//   - Repos with these topics will ALWAYS appear on your portfolio
//
// METHOD 2: Auto-include based on keywords (Automatic)
//   - Repos matching keywords below are automatically included
//   - Just add relevant keywords to your repo description
//
// METHOD 3: Manual exclusion (Edit EXCLUDE_REPOS below)
//   - Add repository names to exclude specific repos
//
// ============================================================================

// Topics that mark repos to ALWAYS show (case-insensitive)
// Add these topics to your GitHub repos to control visibility
const PORTFOLIO_TOPICS = [
    'portfolio',      // Add this topic to always show a repo
    'showcase',        // Alternative topic for always showing
    'featured',        // Another option
    'nlp-portfolio'    // Specific to NLP projects
];

// Repository names to ALWAYS EXCLUDE (even if they match other criteria)
// Add repository names here to hide them (case-insensitive)
const EXCLUDE_REPOS = [
    // Add repo names here, e.g.:
    // 'test-repo',
    // 'old-project',
    // 'private-backup'
];

// Minimum relevance score for auto-included repos (lower = more repos shown)
// Repos with portfolio/showcase topics bypass this threshold
const MIN_RELEVANCE_SCORE = 5;

// Maximum number of projects to display
const MAX_PROJECTS_DISPLAY = 15;

// ============================================================================
// DISPLAY MODE: Only show pinned/selected repos
// ============================================================================
// Set to true to ONLY show repos with portfolio/showcase topics
// Set to false to show both pinned repos AND auto-included repos
const ONLY_SHOW_PINNED_REPOS = true;  // Change to false to show auto-included repos too

// GitHub Username (hardcoded)
const GITHUB_USERNAME = 'imcoza';

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const projectsGrid = document.getElementById('projects-grid');
const pinnedReposFeatured = document.getElementById('pinned-repos-featured');
const loadingState = document.getElementById('loading');
const errorState = document.getElementById('error');
const errorMessage = document.getElementById('error-message');
const viewMoreContainer = document.getElementById('view-more-container');
const viewMoreGithub = document.getElementById('view-more-github');
const githubLink = document.getElementById('github-link');

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

// Check if repo has portfolio/showcase topic
function hasPortfolioTopic(repo) {
    if (!repo.topics || repo.topics.length === 0) {
        // Debug: log repos without topics
        console.log(`Repo "${repo.name}" has no topics`);
        return false;
    }
    const topicsLower = repo.topics.map(t => t.toLowerCase());
    const hasTopic = PORTFOLIO_TOPICS.some(topic => topicsLower.includes(topic.toLowerCase()));
    if (hasTopic) {
        console.log(`✓ Repo "${repo.name}" has portfolio topic:`, repo.topics);
    }
    return hasTopic;
}

// Check if repo should be excluded
function shouldExcludeRepo(repo) {
    const repoNameLower = repo.name.toLowerCase();
    
    // Check manual exclusion list
    if (EXCLUDE_REPOS.some(excluded => excluded.toLowerCase() === repoNameLower)) {
        return true;
    }
    
    // Check exclude patterns
    if (EXCLUDE_PATTERNS.some(pattern => pattern.test(repo.name))) {
        return true;
    }
    
    return false;
}

// Filter and score repositories for relevance
function filterRelevantRepos(repos) {
    return repos
        .filter(repo => {
            // Always include repos with portfolio/showcase topics (bypass other filters)
            if (hasPortfolioTopic(repo)) {
                return true; // Skip other filters for portfolio-tagged repos
            }
            
            // If ONLY_SHOW_PINNED_REPOS is true, exclude all repos without portfolio topics
            if (ONLY_SHOW_PINNED_REPOS) {
                return false; // Only show repos with portfolio/showcase topics
            }
            
            // Below filters only apply if we're showing auto-included repos too
            // Exclude forks
            if (repo.fork) return false;
            
            // Exclude archived repos
            if (repo.archived) return false;
            
            // Check manual exclusions
            if (shouldExcludeRepo(repo)) return false;
            
            // Exclude repos with no description (likely not maintained)
            if (!repo.description || repo.description.trim().length < 10) return false;
            
            // Exclude very small repos (likely incomplete)
            if (repo.size < 1) return false;
            
            return true;
        })
        .map(repo => {
            // Repos with portfolio topics get maximum priority
            if (hasPortfolioTopic(repo)) {
                return { ...repo, relevanceScore: 1000, isPortfolioTagged: true };
            }
            
            // Calculate relevance score for auto-included repos
            let score = 0;
            const nameLower = repo.name.toLowerCase();
            const descLower = (repo.description || '').toLowerCase();
            const topicsLower = (repo.topics || []).map(t => t.toLowerCase()).join(' ');
            const combinedText = `${nameLower} ${descLower} ${topicsLower}`;
            
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
            
            return { ...repo, relevanceScore: score, isPortfolioTagged: false };
        })
        .filter(repo => {
            // Always include portfolio-tagged repos
            if (repo.isPortfolioTagged) return true;
            // Include others if they meet minimum score
            return repo.relevanceScore >= MIN_RELEVANCE_SCORE;
        })
        .sort((a, b) => {
            // Portfolio-tagged repos always come first
            if (a.isPortfolioTagged && !b.isPortfolioTagged) return -1;
            if (!a.isPortfolioTagged && b.isPortfolioTagged) return 1;
            
            // Then sort by relevance score
            if (b.relevanceScore !== a.relevanceScore) {
                return b.relevanceScore - a.relevanceScore;
            }
            
            // Then by stars
            const starDiff = (b.stargazers_count || 0) - (a.stargazers_count || 0);
            if (starDiff !== 0) return starDiff;
            
            // Finally by updated date
            return new Date(b.updated_at) - new Date(a.updated_at);
        });
}

// Fetch topics for a single repository
async function fetchRepoTopics(repo) {
    try {
        const response = await fetch(`${GITHUB_API_BASE}/repos/${repo.full_name}/topics`, {
            headers: {
                'Accept': 'application/vnd.github.mercy-preview+json'
            }
        });
        if (response.ok) {
            const data = await response.json();
            return data.names || [];
        }
    } catch (error) {
        console.warn(`Could not fetch topics for ${repo.name}:`, error);
    }
    return repo.topics || [];
}

// Rate limit handling with retry
async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            
            if (response.status === 403) {
                const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
                const rateLimitReset = response.headers.get('X-RateLimit-Reset');
                
                if (rateLimitRemaining === '0') {
                    const resetTime = new Date(parseInt(rateLimitReset) * 1000);
                    const waitTime = Math.max(resetTime - Date.now(), 0);
                    
                    if (i < retries - 1) {
                        console.warn(`Rate limit hit. Waiting ${Math.ceil(waitTime / 1000)}s before retry...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime + 1000));
                        continue;
                    } else {
                        throw new Error(`API rate limit exceeded. Please try again after ${new Date(resetTime).toLocaleTimeString()}`);
                    }
                }
            }
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('User not found. Please check the username.');
                }
                throw new Error(`Failed to fetch: ${response.statusText}`);
            }
            
            return response;
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
}

// Load projects from GitHub - Fetches all repos and filters based on topics
async function fetchGitHubRepos(username) {
    try {
        const response = await fetchWithRetry(
            `${GITHUB_API_BASE}/users/${username}/repos?sort=updated&per_page=100&type=all`,
            {
                headers: {
                    'Accept': 'application/vnd.github.mercy-preview+json'
                }
            }
        );
        
        const repos = await response.json();
        
        console.log(`\n📦 Fetched ${repos.length} repositories from GitHub`);
        
        // Fetch topics for repos that don't have them in the initial response
        // Some repos might already have topics from the API response
        const reposWithTopics = await Promise.all(
            repos.map(async (repo) => {
                // Check if topics are already in the response
                if (repo.topics && Array.isArray(repo.topics) && repo.topics.length > 0) {
                    return repo;
                }
                // Otherwise fetch topics individually
                const topics = await fetchRepoTopics(repo);
                return { ...repo, topics };
            })
        );
        
        // Log repos with portfolio topics for debugging
        const portfolioRepos = reposWithTopics.filter(repo => hasPortfolioTopic(repo));
        console.log(`\n📌 Found ${portfolioRepos.length} repos with portfolio/showcase topics:`);
        portfolioRepos.forEach(repo => {
            console.log(`   - ${repo.name} (Topics: ${(repo.topics || []).join(', ') || 'none'})`);
        });
        
        // Apply filtering based on configuration
        const filteredRepos = filterRelevantRepos(reposWithTopics);
        
        console.log(`\n✅ Displaying ${filteredRepos.length} repositories`);
        
        return filteredRepos;
    } catch (error) {
        throw error;
    }
}

// Fetch user statistics from GitHub profile
async function fetchUserStats(username) {
    try {
        const [userResponse, reposResponse] = await Promise.all([
            fetchWithRetry(`${GITHUB_API_BASE}/users/${username}`),
            fetchWithRetry(`${GITHUB_API_BASE}/users/${username}/repos?per_page=100&type=all`)
        ]);
        
        if (!userResponse.ok || !reposResponse.ok) {
            return null;
        }
        
        const user = await userResponse.json();
        const repos = await reposResponse.json();
        
        // Calculate total stars from all repos
        const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
        
        // Get total public repositories count
        const totalRepos = user.public_repos || repos.length;
        
        // For contributions, we'll use a combination of:
        // - Total commits across all repos (approximate: repos * avg commits)
        // Since GitHub API doesn't provide direct contribution count, we'll use public_repos as base
        // and add total stars as a metric (more active = more contributions)
        const contributions = totalRepos + Math.floor(totalStars / 10); // Approximate contributions
        
        return {
            repos: totalRepos,
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

// Create featured project card from GitHub repo
function createFeaturedProjectCard(repo) {
    const card = document.createElement('div');
    card.className = 'featured-project-card';
    
    // Get icon based on repo language or default
    const getProjectIcon = (language) => {
        const iconMap = {
            'Python': 'fab fa-python',
            'JavaScript': 'fab fa-js',
            'TypeScript': 'fab fa-js-square',
            'Java': 'fab fa-java',
            'C++': 'fas fa-code',
            'C': 'fas fa-code',
            'Go': 'fab fa-go',
            'Rust': 'fab fa-rust',
            'PHP': 'fab fa-php',
            'Ruby': 'fas fa-gem',
            'Swift': 'fab fa-swift',
            'Kotlin': 'fab fa-android',
            'R': 'fas fa-chart-line',
            'MATLAB': 'fas fa-chart-bar',
            'Shell': 'fas fa-terminal',
            'HTML': 'fab fa-html5',
            'CSS': 'fab fa-css3-alt',
            'Jupyter Notebook': 'fab fa-python',
            'Dockerfile': 'fab fa-docker',
            'Vue': 'fab fa-vuejs',
            'React': 'fab fa-react',
            'Angular': 'fab fa-angular'
        };
        return iconMap[language] || 'fab fa-github';
    };
    
    const icon = getProjectIcon(repo.language);
    const description = repo.description || 'No description available.';
    const stars = repo.stargazers_count || 0;
    const forks = repo.forks_count || 0;
    
    // Get tech tags from topics or language
    const techTags = [];
    if (repo.topics && repo.topics.length > 0) {
        techTags.push(...repo.topics.slice(0, 4)); // Show up to 4 topics
    }
    if (repo.language && !techTags.includes(repo.language)) {
        techTags.push(repo.language);
    }
    if (techTags.length === 0) {
        techTags.push('GitHub');
    }
    
    const techTagsHTML = techTags.map(tag => 
        `<span class="tech-tag">${tag}</span>`
    ).join('');
    
    card.innerHTML = `
        <div class="project-icon"><i class="${icon}"></i></div>
        <h3 class="project-name">
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" style="color: var(--text-primary); text-decoration: none;">
                ${repo.name}
            </a>
        </h3>
        <p class="project-description-text">${description}</p>
        <div class="project-metric">
            <span class="metric-badge">${stars}</span>
            <span class="metric-label">${stars === 1 ? 'Star' : 'Stars'}</span>
        </div>
        <div class="project-tech">
            ${techTagsHTML}
        </div>
    `;
    
    return card;
}

// Display projects
function displayProjects(repos) {
    projectsGrid.innerHTML = '';
    if (pinnedReposFeatured) {
        pinnedReposFeatured.innerHTML = '';
    }
    
    if (repos.length === 0) {
        errorState.style.display = 'block';
        errorMessage.textContent = 'No relevant repositories found. Repositories are filtered to show only NLP/ML related projects.';
        return;
    }
    
    // Get repos with portfolio/showcase topics (pinned repos)
    const pinnedRepos = repos.filter(r => r.isPortfolioTagged);
    
    // Display pinned repos as featured project cards
    if (pinnedRepos.length > 0 && pinnedReposFeatured) {
        pinnedRepos.forEach(repo => {
            const featuredCard = createFeaturedProjectCard(repo);
            pinnedReposFeatured.appendChild(featuredCard);
        });
    }
    
    // Repos are already sorted (portfolio-tagged first, then by relevance)
    // Display remaining projects in the grid (excluding pinned repos that are already shown as featured)
    const remainingRepos = repos.filter(r => !r.isPortfolioTagged).slice(0, MAX_PROJECTS_DISPLAY);
    
    remainingRepos.forEach(repo => {
        const card = createProjectCard(repo);
        projectsGrid.appendChild(card);
    });
    
    // Show "View More" button if there are more repos
    if (repos.length > 12) {
        viewMoreContainer.style.display = 'block';
    }
    
    // Log filtering info (for debugging)
    console.log(`\n========================================`);
    console.log(`📊 PORTFOLIO FILTERING RESULTS`);
    console.log(`========================================`);
    console.log(`Total repos fetched: ${repos.length}`);
    console.log(`Repos with portfolio/showcase topics: ${pinnedRepos.length}`);
    console.log(`Displayed ${pinnedRepos.length} pinned repos as featured projects`);
    console.log(`Displayed ${remainingRepos.length} additional repos in grid`);
    
    if (pinnedRepos.length === 0 && ONLY_SHOW_PINNED_REPOS) {
        console.warn(`\n⚠️  WARNING: No repos found with portfolio/showcase topics!`);
        console.warn(`\n📝 TO FIX THIS:`);
        console.warn(`1. Go to your repository on GitHub`);
        console.warn(`2. Click the gear icon (⚙️) next to "About"`);
        console.warn(`3. Add topic: "portfolio" or "showcase"`);
        console.warn(`4. Save changes`);
        console.warn(`5. Refresh this page`);
        console.warn(`\n💡 Note: GitHub "pinned repos" ≠ GitHub "topics"`);
        console.warn(`   You need to add "portfolio" TOPIC to repos, not just pin them.`);
    }
    
    // List all repos with portfolio topics
    const allPortfolioRepos = pinnedRepos;
    if (allPortfolioRepos.length > 0) {
        console.log(`\n✅ Repos with portfolio/showcase topics:`);
        allPortfolioRepos.forEach(repo => {
            console.log(`   - ${repo.name} (Topics: ${repo.topics.join(', ')})`);
        });
    } else {
        console.log(`\n❌ No repos found with portfolio/showcase topics`);
        console.log(`\n📋 All repos and their topics:`);
        repos.slice(0, 10).forEach(repo => {
            const topics = repo.topics && repo.topics.length > 0 ? repo.topics.join(', ') : 'none';
            console.log(`   - ${repo.name}: [${topics}]`);
        });
    }
    console.log(`========================================\n`);
}

// Load projects function (auto-loads on page load)
async function loadProjects() {
    const username = GITHUB_USERNAME;
    
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
        
        // Update GitHub link (if it exists)
        if (githubLink) {
            githubLink.href = `https://github.com/${username}`;
        }
        if (viewMoreGithub) {
            viewMoreGithub.href = `https://github.com/${username}?tab=repositories`;
        }
        
        // Display projects (already filtered by fetchGitHubRepos)
        displayProjects(repos);
        
        // Hide loading
        loadingState.style.display = 'none';
        
    } catch (error) {
        loadingState.style.display = 'none';
        errorState.style.display = 'block';
        errorMessage.textContent = error.message || 'An error occurred while fetching repositories.';
    }
}

// Contact form removed - using direct contact links instead

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

// Auto-load projects on page load
window.addEventListener('DOMContentLoaded', async () => {
    // Auto-load after a short delay to ensure page is fully loaded
    setTimeout(() => {
        loadProjects();
    }, 1000);
});

