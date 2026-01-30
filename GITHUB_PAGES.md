# GitHub Pages Deployment Guide

## Quick Deploy to GitHub Pages

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `loop-studio` (or any name you prefer)
3. Keep it **Public** (required for free GitHub Pages)
4. Don't initialize with README, .gitignore, or license
5. Click "Create repository"

### Step 2: Link Your Local Project

```bash
cd "/Users/yanivo/Documents/Ex Music"

# Add all files
git add .

# Commit
git commit -m "Initial commit: Loop Studio app"

# Add your GitHub repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/loop-studio.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Deploy to GitHub Pages

```bash
npm run deploy
```

This will:
- Build your app
- Create a `gh-pages` branch
- Push the built files to GitHub Pages
- Your site will be live at: `https://YOUR_USERNAME.github.io/loop-studio/`

### Step 4: Enable GitHub Pages (First Time Only)

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in left sidebar)
3. Under "Source", select branch: `gh-pages`
4. Click **Save**
5. Wait 1-2 minutes for deployment

Your app will be live at: `https://YOUR_USERNAME.github.io/loop-studio/`

## Update Your Deployment

After making changes:

```bash
npm run deploy
```

That's it! GitHub Pages will automatically update.

## Using a Custom Repository Name?

If you named your repo differently, update these files:

**package.json:**
```json
"homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME"
```

**vite.config.js:**
```js
base: '/YOUR_REPO_NAME/'
```

Then rebuild and deploy:
```bash
npm run build
npm run deploy
```

## Troubleshooting

**404 Error after deployment?**
- Check that `base` in vite.config.js matches your repo name
- Verify GitHub Pages is enabled in repository settings
- Wait a few minutes for DNS propagation

**Blank page?**
- Open browser console (F12) to check for errors
- Verify the `base` path is correct in vite.config.js

**Audio not working?**
- Make sure users tap the "TAP TO START" button (Web Audio API requirement)
- On iPhone, ensure silent mode is OFF
