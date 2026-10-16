<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/dd28b62d-fa33-400b-a4de-428dc5d2f0de

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Database

The Express API uses SQLite for local persistence. On first startup it creates `data/mn-tshirt.sqlite` and seeds it from the data in `server.ts`. API changes are saved automatically and restored when the server restarts.

To use a different database location, set `DATABASE_PATH` before starting the server:

```powershell
$env:DATABASE_PATH = 'D:\data\mn-tshirt.sqlite'
npm run dev
```
