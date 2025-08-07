# SafePass Deployment Guide - Vercel

## Prerequisites
- GitHub account
- Vercel account (free at vercel.com)
- Supabase project with database setup

## Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

## Step 3: Environment Variables
In Vercel dashboard, go to Settings > Environment Variables and add:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from your Supabase project settings.

## Step 4: Deploy
Click "Deploy" - Vercel will build and deploy your app automatically.

## Step 5: Custom Domain (Optional)
- In Vercel dashboard, go to Domains
- Add your custom domain
- Follow DNS configuration instructions

## Automatic Deployments
Vercel automatically redeploys when you push to your main branch.

Your SafePass app will be live at: `https://your-project-name.vercel.app`