# GitHub Pages Deployment Script for Windows PowerShell
# This script helps you deploy your portfolio to GitHub Pages

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Portfolio Deployment to GitHub Pages" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "✓ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git is not installed. Please install Git first." -ForegroundColor Red
    Write-Host "  Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Check if we're in a git repository
if (Test-Path .git) {
    Write-Host "✓ Git repository detected" -ForegroundColor Green
} else {
    Write-Host "! Initializing new git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✓ Git repository initialized" -ForegroundColor Green
}

# Get repository name
$repoName = Read-Host "Enter GitHub repository name (e.g., 'portfolio' or 'nlp-portfolio')"
if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = "portfolio"
    Write-Host "Using default name: $repoName" -ForegroundColor Yellow
}

# Get GitHub username
$githubUsername = Read-Host "Enter your GitHub username (e.g., 'imcoza')"
if ([string]::IsNullOrWhiteSpace($githubUsername)) {
    $githubUsername = "imcoza"
    Write-Host "Using default username: $githubUsername" -ForegroundColor Yellow
}

$repoUrl = "https://github.com/$githubUsername/$repoName.git"

Write-Host ""
Write-Host "Repository URL: $repoUrl" -ForegroundColor Cyan
Write-Host ""

# Check if remote exists
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "✓ Remote 'origin' already exists: $remoteExists" -ForegroundColor Green
    $updateRemote = Read-Host "Update remote URL? (y/n)"
    if ($updateRemote -eq 'y' -or $updateRemote -eq 'Y') {
        git remote set-url origin $repoUrl
        Write-Host "✓ Remote URL updated" -ForegroundColor Green
    }
} else {
    Write-Host "! Adding remote 'origin'..." -ForegroundColor Yellow
    git remote add origin $repoUrl
    Write-Host "✓ Remote added" -ForegroundColor Green
}

# Add all files
Write-Host ""
Write-Host "Adding files to git..." -ForegroundColor Yellow
git add index.html styles.css script.js README.md DEPLOYMENT.md

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    $commitMessage = Read-Host "Enter commit message (or press Enter for default)"
    if ([string]::IsNullOrWhiteSpace($commitMessage)) {
        $commitMessage = "Deploy portfolio website"
    }
    
    git commit -m $commitMessage
    Write-Host "✓ Files committed" -ForegroundColor Green
} else {
    Write-Host "! No changes to commit" -ForegroundColor Yellow
}

# Push to GitHub
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "Note: You may need to authenticate with GitHub" -ForegroundColor Cyan

try {
    git branch -M main
    git push -u origin main
    Write-Host ""
    Write-Host "✓ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Next Steps:" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Go to: https://github.com/$githubUsername/$repoName/settings/pages" -ForegroundColor Yellow
    Write-Host "2. Under 'Source', select 'main' branch" -ForegroundColor Yellow
    Write-Host "3. Select '/ (root)' folder" -ForegroundColor Yellow
    Write-Host "4. Click 'Save'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Your site will be live at:" -ForegroundColor Green
    Write-Host "  https://$githubUsername.github.io/$repoName" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "It may take 1-2 minutes for the site to go live." -ForegroundColor Yellow
} catch {
    Write-Host ""
    Write-Host "✗ Error pushing to GitHub" -ForegroundColor Red
    Write-Host "  Make sure:" -ForegroundColor Yellow
    Write-Host "  - The repository exists on GitHub" -ForegroundColor Yellow
    Write-Host "  - You have push access" -ForegroundColor Yellow
    Write-Host "  - You're authenticated (check: git config --global user.name)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  You can create the repository manually at:" -ForegroundColor Cyan
    Write-Host "  https://github.com/new" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")




