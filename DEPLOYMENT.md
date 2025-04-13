# Deployment Guide for BookSwap

## Frontend Deployment (Vercel)

1. Push your code to GitHub if not already done
2. Visit [Vercel](https://vercel.com) and sign up/login with GitHub
3. Click "New Project" and import your repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: frontend
   - Environment Variables:
     - NEXT_PUBLIC_API_URL: Your backend API URL (after deploying backend)
5. Click "Deploy"

## Backend Deployment (Render)

1. Push your code to GitHub if not already done
2. Visit [Render](https://render.com) and sign up/login
3. Click "New Web Service"
4. Connect your repository
5. Configure the service:
   - Name: bookswap-backend
   - Root Directory: backend
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node index.js`
   - Environment Variables:
     - PORT: 3001
     - NODE_ENV: production
6. Click "Create Web Service"

## After Deployment

1. Once backend is deployed, copy the Render URL (e.g., https://bookswap-backend.onrender.com)
2. Update the frontend's environment variable NEXT_PUBLIC_API_URL with this URL in Vercel
3. Redeploy the frontend if needed

Your BookSwap application should now be fully deployed and accessible online!