# Personal Resume Matcher

A private, Cloudflare-hosted resume tailoring app adapted from the ideas in [Resume Matcher](https://github.com/srbhr/Resume-Matcher). This version is intentionally single-user and uses Anthropic Claude.

## What it does

- Extracts text from your master PDF in the browser and retains it in that browser only.
- Accepts a job URL, with pasted-description fallback for blocked pages.
- Calls Claude from a Cloudflare Worker; the API key never reaches browser code.
- Applies truthful, medium-impact XYZ tailoring and downloads an ATS-friendly one-page PDF.

## Architecture

- `apps/web`: React/Vite frontend deployed to Cloudflare Pages.
- `apps/worker`: API deployed to Cloudflare Workers.
- No database, accounts, or multi-user features in v1.
- Protect both deployments with Cloudflare Access before adding the Anthropic secret.

## Deploy the Worker

```bash
npm install
cd apps/worker
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler deploy
```

Set `FRONTEND_ORIGIN` in `wrangler.toml` to the final Pages origin and deploy again. Do not commit `.dev.vars` or the API key.

## Deploy the frontend to Pages

Connect this GitHub repository in Cloudflare Pages and use:

- Root directory: `apps/web`
- Build command: `npm install && npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://resume-matcher-api.<your-subdomain>.workers.dev`

Then put both the Pages hostname and Worker hostname behind a Cloudflare Access policy restricted to your email address.

## Local checks

Copy `.dev.vars.example` to `.dev.vars` only for local Worker testing and `.env.example` to `.env` for the frontend. Run `npm run dev:worker` and `npm run dev:web` in separate terminals.

## Security notes

- The Claude key is a Worker secret, never a frontend environment variable.
- The master resume is stored in browser local storage, not uploaded for permanent storage.
- Job-page fetching rejects common local/private hostnames and limits fetched content.
- Cloudflare Access is required because this personal build intentionally has no in-app account system.
