# Media Downloader API

Backend-only Express API for downloading media from various platforms (via
[`btch-downloader`](https://www.npmjs.com/package/btch-downloader)) and
searching YouTube (via [`yt-search`](https://www.npmjs.com/package/yt-search)).
Ready to deploy on Vercel as a serverless function.

## Project structure

```
.
├── api/
│   └── index.js          # Vercel serverless entry point (exports the Express app)
├── src/
│   ├── app.js             # Express app: middleware, routes, error handling
│   ├── server.js          # Local dev entry point (npm run dev / npm start)
│   ├── controllers/
│   │   ├── downloader.controller.js
│   │   └── search.controller.js
│   ├── routes/
│   │   ├── downloader.routes.js
│   │   └── search.routes.js
│   ├── middleware/
│   │   ├── notFound.js
│   │   └── errorHandler.js
│   └── utils/
│       └── asyncHandler.js
├── package.json
├── vercel.json
└── .gitignore
```

## Setup

```bash
npm install
npm run dev      # starts local server with nodemon on http://localhost:3000
# or
npm start        # plain node
```

## Endpoints

### Health

- `GET /` — API status + endpoint map
- `GET /api/health` — health check

### Download (`btch-downloader`)

- `GET /api/download` — list supported platforms
- `GET /api/download/:platform?url=<link>` — generic route
- Dedicated routes (same query param, `?url=`):
  - `GET /api/download/tiktok`
  - `GET /api/download/instagram`
  - `GET /api/download/facebook`
  - `GET /api/download/twitter`
  - `GET /api/download/capcut`
  - `GET /api/download/gdrive`
  - `GET /api/download/mediafire`
  - `GET /api/download/pinterest`
  - `GET /api/download/sfilemobi`
  - `GET /api/download/soundcloud`
  - `GET /api/download/ytmp3`
  - `GET /api/download/ytmp4`
  - `GET /api/download/likee`
  - `GET /api/download/snackvideo`
  - `GET /api/download/aio` (all-in-one auto-detect)

Example:

```bash
curl "http://localhost:3000/api/download/tiktok?url=https://vt.tiktok.com/xxxxx"
```

> `btch-downloader` is pinned to `latest` in `package.json`. If a future
> release renames or removes an export, update the `PLATFORM_HANDLERS` map
> in `src/controllers/downloader.controller.js` to match. Run
> `node -e "console.log(Object.keys(require('btch-downloader')))"` after
> installing to see exactly what's exported.

### Search (`yt-search`)

- `GET /api/search/youtube?q=<query>&limit=10` — search YouTube videos
- `GET /api/search/youtube/video/:videoId` — fetch info for a specific video

Example:

```bash
curl "http://localhost:3000/api/search/youtube?q=lofi+beats&limit=5"
```

## Deploying to Vercel

1. Push this project to a Git repository (GitHub/GitLab/Bitbucket).
2. Import the repo in the [Vercel dashboard](https://vercel.com/new), or deploy via CLI:

   ```bash
   npm i -g vercel
   vercel        # preview deploy
   vercel --prod # production deploy
   ```

3. `vercel.json` routes every request to `api/index.js`, which exports the
   Express app — no extra Vercel configuration is needed. Vercel installs
   `dependencies` from `package.json` automatically during the build.

## Notes

- A basic in-memory rate limiter (60 requests/minute/IP) is applied globally
  in `src/app.js`. Since Vercel serverless functions are stateless and can
  run across multiple instances, this is best-effort protection, not a hard
  guarantee — for stricter limits, use Vercel Edge Config, Redis, or a
  gateway-level rate limiter.
- All responses are JSON: `{ success: boolean, ...data | message }`.
- Third-party sites that `btch-downloader` scrapes can change their layout
  or block requests at any time — treat failures from those endpoints as
  expected and handle them gracefully in your client.
