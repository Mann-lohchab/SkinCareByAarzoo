# Vercel Deployment

## What this setup does

- Builds the Vite frontend from `frontend/`
- Serves the Express backend as a Vercel Function from `api/index.js`
- Uses `connect-pg-simple` with `DATABASE_URL` so sessions work on serverless
- Disables the custom WebSocket layer by default on Vercel

## Important limitation

Vercel is not a good fit for the custom `ws` server currently used in this repo. The deployment in this branch keeps the app functional, but realtime updates are disabled unless you move WebSockets to a separate host and set `VITE_WS_URL`.

## Required environment variables in Vercel

- `NODE_ENV=production`
- `DATABASE_URL`
- `SESSION_SECRET`
- `GETSTREAM_API_KEY`
- `GETSTREAM_API_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `FRONTEND_URL=https://<your-vercel-domain>`
- `APP_URL=https://<your-vercel-domain>`
- `VITE_API_URL=/api`
- `VITE_GETSTREAM_API_KEY`
- `VITE_ENABLE_REALTIME=false`

## Vercel project settings

- Framework Preset: `Vite`
- Root Directory: `.`
- Build Command: `npm run build`
- Output Directory: `frontend/dist`
- Install Command: `npm install`

## Deploy steps

1. Push this repo to GitHub.
2. Import the repo into Vercel.
3. Add the environment variables above to Production and Preview.
4. Deploy.
5. Test `/api/health` after deploy.
6. Test signup, OTP, login, bookings, chat token generation, and video-call token generation.

## Local notes

- For local frontend development, keep using `http://localhost:5173`.
- For local backend development, run the backend on port `3000`.
- Realtime still works locally through `ws://localhost:3000/ws` if you explicitly set `VITE_ENABLE_REALTIME=true`.
