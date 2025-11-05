# Yeahhhh
## Ankala

### Unsplash integration
- Set `VITE_UNSPLASH_ACCESS_KEY` in your `.env` (see Unsplash dashboard).
- We hotlink Unsplash images directly and trigger the official download endpoint so usage counts correctly.
- Each image now renders attribution links (`Photo by … on Unsplash`) as required by their API guidelines.
- Keep your Unsplash secret key private; only the access key belongs in the client.

### Local dev notes
- The trip planner UI runs on Vite. For the `/api/*` helpers (e.g. osm-search), either run `vercel dev` alongside `npm run dev`, or rely on the built-in dev fallback which calls Nominatim directly.
- For AI trip generation during local dev run both `npm run dev` (Vite, port 5173) and `vercel dev` (Serverless, port 3000). The frontend calls `http://localhost:3000/api/*` automatically when `import.meta.env.DEV` is true.
