# Deployment Instructions

## Option 1: Netlify (Recommended - Easiest)

### Via Netlify CLI:

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod
```

3. Follow the prompts:
   - Authorize with your Netlify account
   - Choose "Create & configure a new site"
   - Pick your team
   - Set publish directory to: `dist`

### Via Netlify Web Interface:

1. Go to https://app.netlify.com
2. Click "Add new site" → "Deploy manually"
3. Drag and drop the `dist` folder
4. Your site will be live instantly!

## Option 2: Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Follow the prompts to authenticate and deploy

## Option 3: GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to package.json scripts:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

3. Deploy:
```bash
npm run deploy
```

## Option 4: Surge

1. Install Surge:
```bash
npm install -g surge
```

2. Deploy:
```bash
cd dist
surge
```

## Testing Before Deployment

Start the dev server to test locally:
```bash
npm run dev
```

Or preview the production build:
```bash
npm run preview
```

## Important Notes for Mobile

- The app requires user interaction to start audio (Web Audio API requirement)
- iPhone users must turn OFF silent mode for audio to work
- App is optimized for mobile and tablet devices
- Touch-friendly interface with responsive design
