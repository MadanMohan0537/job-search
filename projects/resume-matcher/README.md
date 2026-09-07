# Resume Matcher

An open, provider-neutral resume tailoring project with two parts:

- a portable **Agent Skill** that works with skills-compatible AI agents;
- a private React + Cloudflare Worker app that can use Anthropic, Google Gemini, OpenAI, or a remote OpenAI-compatible API.

The project treats the candidate's resume as the only source of truth. It can reorder and rewrite verified evidence for a target job, but it must not invent qualifications, metrics, employers, dates, or tools.

## Why this repository is model-neutral

The reusable workflow lives in [skill/SKILL.md](skill/SKILL.md), using the open Agent Skills structure rather than vendor-specific prompt syntax. Supporting knowledge is loaded from [skill/references/](skill/references/) only when needed.

The deployed app routes requests through a small provider adapter:

| Provider | AI_PROVIDER | Secret | Optional configuration |
|---|---|---|---|
| Anthropic | anthropic | AI_API_KEY or ANTHROPIC_API_KEY | AI_MODEL |
| Google Gemini | google | AI_API_KEY or GEMINI_API_KEY | AI_MODEL |
| OpenAI | openai-compatible | AI_API_KEY or OPENAI_API_KEY | AI_MODEL |
| OpenAI-compatible service | openai-compatible | AI_API_KEY | AI_BASE_URL, AI_MODEL |

“Any model” means any text model exposed through one of these supported API shapes. Models still need enough instruction-following ability and context capacity to return the required JSON.

## Features

- Client-side PDF text extraction; the resume is stored in browser local storage.
- Evidence-grounded tailoring against pasted job text or an accessible job URL.
- Provider credentials remain in encrypted Cloudflare Worker secrets.
- Single-origin deployment of the frontend and API.
- ATS-readable, single-column PDF download.
- Portable skill instructions with a validator and CI build.

## Architecture

~~~mermaid
flowchart LR
    A[Resume PDF] -->|PDF.js in browser| B[React app]
    C[Job URL or text] --> B
    B -->|POST /api/tailor| D[Cloudflare Worker]
    D --> E{Provider adapter}
    E --> F[Anthropic]
    E --> G[Google Gemini]
    E --> H[OpenAI-compatible API]
    F --> D
    G --> D
    H --> D
    D --> B
    B --> I[ATS-readable PDF]
~~~

## Run locally

Requirements: Node.js 20+ and npm.

~~~bash
git clone https://github.com/MadanMohan0537/Resume-Matcher.git
cd Resume-Matcher
npm ci
~~~

Create apps/worker/.dev.vars for local secrets:

~~~dotenv
AI_PROVIDER=openai-compatible
AI_API_KEY=replace-me
AI_MODEL=gpt-4.1-mini
AI_BASE_URL=https://api.openai.com/v1
~~~

Then use two terminals:

~~~bash
npm run dev:worker
~~~

~~~bash
npm run dev:web
~~~

The checked-in web environment example points Vite to http://localhost:8787.

## Deploy to Cloudflare

Log in, choose a provider, add its secret, and set non-secret variables in wrangler.jsonc or the Cloudflare dashboard:

~~~bash
npx wrangler login
npx wrangler secret put AI_API_KEY
npm run deploy
~~~

Example Worker variables:

~~~json
{
  "AI_PROVIDER": "google",
  "AI_MODEL": "gemini-2.5-flash"
}
~~~

For a remote OpenAI-compatible service, also set AI_BASE_URL. Do not put keys in wrangler.jsonc, frontend variables, source files, or GitHub.

Cloudflare Git settings:

- Root directory: repository root
- Build command: npm run build
- Deploy command: npx wrangler deploy
- Configuration file: wrangler.jsonc

The health endpoint, GET /api/health, reports the configured provider and model without revealing credentials.

## Install the skill

The installable unit is [skill/](skill/). See [docs/INSTALLATION.md](docs/INSTALLATION.md) for Claude, Codex, Gemini CLI, uploaded-skill clients, and agents without a native skill loader.

~~~bash
npm run validate:skill
~~~

Example request:

> Use the resume-matcher skill to tailor my attached resume to this job description. Preserve all facts and show me the remaining evidence gaps.

## Repository layout

~~~text
Resume-Matcher/
├── skill/
│   ├── SKILL.md
│   ├── agents/openai.yaml
│   └── references/
├── docs/INSTALLATION.md
├── scripts/validate-skill.mjs
├── apps/web/
├── apps/worker/
├── .github/workflows/ci.yml
└── wrangler.jsonc
~~~

## Privacy and limitations

- Resume text remains in the browser until a tailoring request sends it to the configured AI provider.
- No resume database is included.
- Job-page fetching blocks common local/private hostnames, but deployments should still apply their own egress and abuse controls.
- Generated content must be reviewed by the candidate.
- The project does not guarantee an ATS score, interview, or hiring outcome.

## Validation

~~~bash
npm run validate:skill
npm run build
~~~

CI runs both commands on pushes and pull requests.

## License

MIT — see [LICENSE](LICENSE).

## Standards and API documentation

- [Agent Skills specification](https://agentskills.io/specification)
- [OpenAI skills overview](https://openai.com/academy/skills/)
- [Anthropic Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Gemini CLI Agent Skills](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/using-agent-skills.md)
- [Google Gemini generateContent API](https://ai.google.dev/api/generate-content)
