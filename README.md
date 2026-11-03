# job-search

A local-first job-search product: find openings, score them, tailor materials from the candidate's own record, apply only after a person approves, and track what happened.

It is for someone running a real search who wants the repetitive reading and formatting done in one place, and who still wants to be the person who submits.

## Approach

The loop is **find → score → tailor → apply (human-approved only) → track**.

1. **Find.** Pull postings from public ATS boards (Greenhouse, Ashby, Lever, Workday, Amazon, SmartRecruiters, iCIMS, and others) without spending model tokens on the scan itself.
2. **Score.** Judge fit and legitimacy, including ghost-job signals. Scores are signals, not proof that a role is open or that an employer will sponsor a candidate.
3. **Tailor.** Rewrite a resume or cover letter from the candidate's own sources. Reorder and rephrase. Do not invent employers, titles, dates, credentials, or metrics.
4. **Apply.** Prefill is allowed. Submission is not. A person reviews the form and submits it. Nothing in this repo is allowed to auto-submit.
5. **Track.** Keep the decision, the artifacts, and the follow-up on the machine that owns the search, not in this public repository.

Two projects implement that loop today. Phase 1 does not merge them into one package. Each keeps its own install.

| Project | Path | Role |
|---|---|---|
| Job Copilot | [`projects/job-copilot`](projects/job-copilot) | Scanners, fit and ghost-job scoring, fact-checked tailoring, Playwright PDF, tracker, Go TUI dashboard, Next.js app with apply/prefill routes |
| Resume Matcher | [`projects/resume-matcher`](projects/resume-matcher) | Evidence-grounded tailoring skill, five ATS-oriented templates, React/Vite app, Cloudflare Worker API |

Shared resume schema and shared skills are deferred. See [`shared/README.md`](shared/README.md).

## What exists today

**Job Copilot** is the pipeline. It is a working fork of [Career-Ops by santifer](https://github.com/santifer/career-ops) (MIT). The upstream license, citation, and contributor record stay in the project tree: [`LICENSE`](projects/job-copilot/LICENSE), [`CITATION.cff`](projects/job-copilot/CITATION.cff), [`CONTRIBUTORS.md`](projects/job-copilot/CONTRIBUTORS.md). Fork-specific docs do not replace that authorship. Read the project [README](projects/job-copilot/README.md) for scanners, modes, and the local data contract.

**Resume Matcher** is the tailoring surface that can run without the pipeline: a portable agent skill, reference guides, templates, and a small web app. The API is a Cloudflare Worker. Worker names are `resume-matcher`, `resume-matcher-web`, and `resume-matcher-api`. See the project [README](projects/resume-matcher/README.md).

This repository's history for each tree is the source repository's `main` history, rewritten so the files live under `projects/`. Personal tailored resumes and one vendored `node_modules` snapshot were removed before import. Details are in [`docs/safety-and-attribution.md`](docs/safety-and-attribution.md).

## How success is measured

There is no star count and no placement metric in this repo. A change is successful when all of these stay true:

- A posting is not treated as worth an application until a person has seen the fit score and the legitimacy notes.
- Tailored text still matches the candidate's source files. The Job Copilot fact gate (`verify-cv-facts.mjs`) is there to stop numbers, dates, and tools that the sources do not support.
- No application is submitted by an agent, a script, or a browser driver. Prefill ends with the person looking at the form.
- The tracker records the human decision (apply, skip, or later outcome) without committing that record to git.
- Resume Matcher output is still something the candidate can defend line by line against the master resume they provided.

## Limits

- **No auto-submit.** Human approval is required for every application. See [`AGENTS.md`](AGENTS.md).
- **Never auto-apply** to Meta, EY, TikTok, or Burns & McDonnell. Do not prefill those with the intention of an unattended submit.
- Scores, liveness checks, and ATS templates do not guarantee that a posting is real, that an employer will reply, or that an ATS will parse a PDF the way a person expects.
- Candidate documents (`cv.md`, reports, batch outputs, tailored resumes) stay on the candidate's machine. This public repo ships examples only.
- Phase 1 has no root npm workspace. Install each project on its own.
- Job Copilot's updater (`update-system.mjs`) still assumes it is running inside that project directory. Do not point it at the monorepo root. Its system-path manifest also predates some fork files; `node test-all.mjs --quick` reports that gap.

## Install

From a checkout of this repo:

```bash
# Job Copilot (Node 18+, Go for the dashboard)
cd projects/job-copilot
npm install --ignore-scripts
npm run lint
npm run test:parity
cd dashboard && go test ./...

# Web UI (Node 22+, its own lockfile)
cd ../web
npm ci
npm test
npm run build

# Resume Matcher (Node 22, npm workspaces)
cd ../../resume-matcher
npm ci
npm run validate:skill
npm run build
```

`npm install` at the Job Copilot root uses `--ignore-scripts` so Playwright does not download a browser during install. Visual CV tests (`npm run test:cv-visual`) need Chromium (`npx playwright install chromium`) and are not part of the default install.

## Deploy

Resume Matcher deploys to **Cloudflare Workers** with Wrangler from `projects/resume-matcher`. These are live Worker publishes (`wrangler deploy`), not versioned GitHub releases. Do not rename the Workers. Existing names:

| Config | Worker name | Command (from `projects/resume-matcher`) |
|---|---|---|
| `wrangler.jsonc` | `resume-matcher` | `npm run build && npx wrangler deploy` |
| `apps/web/wrangler.jsonc` | `resume-matcher-web` | `npx wrangler deploy --config apps/web/wrangler.jsonc` |
| `apps/worker/wrangler.toml` | `resume-matcher-api` | `npx wrangler deploy --config apps/worker/wrangler.toml` |

A dry run bundles without publishing: add `--dry-run` to the Wrangler command. The web asset deploy expects `apps/web/dist` from `npm run build`.

## Layout

```
job-search/
├── README.md
├── AGENTS.md
├── .env.example          # index only; no secrets
├── docs/
├── shared/               # phase 2 placeholder
└── projects/
    ├── job-copilot/
    └── resume-matcher/
```

GitHub Actions runs only from [`.github/workflows`](.github/workflows). Each workflow is path-filtered to the project it belongs to.
