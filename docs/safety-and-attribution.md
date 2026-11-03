# Safety and attribution

## Human approval

Applications are human-approved. Agents and scripts may find, score, tailor, and prefill. They may not submit. They may not auto-apply to Meta, EY, TikTok, or Burns & McDonnell. The root [`AGENTS.md`](../AGENTS.md) is the rule. Job Copilot's apply driver also refuses submit controls in code; do not remove that refusal.

Personal search data does not belong in this public repository: master resumes, tailored resumes, cover letters, tracker files, scan reports, and batch outputs. Example env files only.

## What was excluded from the import

Both source histories were scanned with gitleaks 8.30.1 and trufflehog 3.99.8 before merge. Only `main` was imported. Open pull requests were left on the source repositories.

**AI-Job-Copilot (`projects/job-copilot`).** These paths were removed from the imported history with `git filter-repo --invert-paths` because they are personal job-search material, not product source:

- `generate_all_pdfs.mjs` and `generate_all_cl_pdfs.mjs` — one-off generators with a real tailored resume (contact details, employers, and company-specific variants) and a local Windows path.
- `batch/processed-batch1.json`, `batch/processed-batch2.json`, `batch/processed-batch3.json` — evaluated postings with notes written against a specific candidate's background.

No verified secrets were found. Remaining gitleaks hits are test fixtures and a public job-board constant:

- `providers/vdab.mjs` — `VEJ_KEY_MONITOR`, documented in that file as a public VDAB frontend constant, not an account credential. The test asserts the same value.
- `tests/providers/wttj.test.mjs` — a hex placeholder and a base64 string that decodes to the words "Algolia secured key".
- `test-all.mjs` — fixture report filenames, not keys.
- Trufflehog's GitHub OAuth detector flagged contributor logins in `.all-contributorsrc` and `CONTRIBUTORS.md`. None were verified, and none use a `gho_` token prefix.

**Resume-Matcher (`projects/resume-matcher`).**

- Vendored `node_modules/**` was removed from history. It had already been deleted on `main` (commit that added `.gitignore`) but the blobs were still reachable. They included large platform binaries. Trufflehog reported unverified Cloudflare API token shapes and private-key blocks inside published miniflare/wrangler files. After the strip, a rescan of this history reported no gitleaks and no trufflehog findings.
- Draft pull request material was not on `main` and was not imported. That includes the tailored resume for BMS Product Owner Workforce Planning (R1605351) and the personal `resume/MASTER.md` / `resume/PROFILE.md` from the Cursor-first workflow branch. Those branches stay on the source repo.

Example env files that remain are placeholders (`your_gemini_api_key_here`, `AI_API_KEY=replace-me`, `VITE_API_URL=http://localhost:8787`).

Follow-up on the import branch, removed from the tree (still in earlier commits, not personal contact data): `modes/_custom.md` is user-layer house rules, so the no-user-data guard keeps blocking that path and only `modes/_custom.template.md` stays tracked. `batch/append-scan-results.mjs` and `batch/sync-completed-reports.mjs` are one-off dumps of a specific search, including apply/skip notes, and are not product source.

## Attribution

Job Copilot builds on Career-Ops by santifer, MIT. Keep [`projects/job-copilot/LICENSE`](../projects/job-copilot/LICENSE), [`CITATION.cff`](../projects/job-copilot/CITATION.cff), and [`CONTRIBUTORS.md`](../projects/job-copilot/CONTRIBUTORS.md) with that tree. Do not describe the monorepo as the author of the upstream engine.

Resume Matcher is MIT, copyright Madan Mohan, in [`projects/resume-matcher/LICENSE`](../projects/resume-matcher/LICENSE).

Source repositories were not archived, renamed, or deleted by this import.
