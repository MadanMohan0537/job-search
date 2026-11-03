# Architecture

Phase 1 is two projects in one git history. They do not share a package root.

```
find → score → tailor → apply (human-approved only) → track
```

## projects/job-copilot

The pipeline, descended from santifer/career-ops.

- Node ESM scripts at the project root: scan, score, tailor, PDF, tracker, batch runner.
- `providers/` talks to public ATS APIs.
- `web/` is a Next.js app (own `package-lock.json`) with apply/prefill routes. The apply driver fills forms and refuses submit controls. The person submits.
- `dashboard/` is a Go TUI with its own `go.mod`.
- User data (`cv.md`, `data/`, `reports/`, `output/`, `portals.yml`, interview prep) is local. `DATA_CONTRACT.md` in the project describes the split between that user layer and the system layer.

GitHub Actions for this tree live at the monorepo root and run only when `projects/job-copilot/**` changes: test, web CI, CodeQL, dependency review, no-user-data, plugin-registry validation. An issue workflow closes obvious automated scan dumps so personal pipeline output is not left on the public tracker.

## projects/resume-matcher

Tailoring without the scanner.

- `skill/` and `skills/` are the portable agent skill and reference guides.
- `templates/` holds five single-column ATS-oriented templates.
- `apps/web` is React + Vite. `apps/worker` is the `/api/tailor` Cloudflare Worker. The root `wrangler.jsonc` publishes both as one Worker: static assets plus the API.
- The npm workspace is only inside this project (`apps/web`, `apps/worker`). It is not wired to the monorepo root.

CI is `.github/workflows/resume-matcher-ci.yml` (`npm ci`, `validate:skill`, `build`) and runs when this folder changes.

## Deploy

Cloudflare Workers, via `wrangler deploy` from `projects/resume-matcher`. Not GitHub-versioned releases. Worker names stay `resume-matcher`, `resume-matcher-web`, and `resume-matcher-api`, so existing workers.dev hostnames stay put. Paths inside the Wrangler configs are relative to `projects/resume-matcher` and did not need to change when the folder moved.

## shared/

Not built yet. A later phase can put one resume schema and one copy of the overlapping skills there. Until then, do not import across the two projects just to deduplicate.

## CI location

GitHub runs workflows only from the repository-root `.github/workflows` directory. Copies that used to live in each project were removed from the tree so they cannot drift from the workflows that actually run. The old files remain in each project's imported history.
