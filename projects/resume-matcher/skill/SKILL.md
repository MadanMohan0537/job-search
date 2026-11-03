---
name: resume-matcher
description: Tailor, review, or rewrite a resume against a target job description while preserving factual accuracy and producing ATS-readable output. Use when a user asks to match a resume or CV to a role, identify evidence and keyword gaps, improve achievement bullets, or generate a targeted resume. Do not use for fabricating qualifications or automatically submitting applications.
---

# Resume Matcher

Create a truthful, targeted resume from the candidate's source material and a job description. Work with the tools and file formats available in the current agent; do not depend on a particular model, vendor, connector, or document library.

## Inputs

Use the candidate's resume, CV, career notes, or verified answers as the only factual source. Obtain the complete job description from supplied text, a readable attachment, or a URL the current environment can access. If either source is missing, ask only for the missing input.

## Workflow

1. Read both sources fully. Extract candidate evidence and job requirements separately.
2. Diagnose the largest gaps briefly: missing evidence, weak bullets, poor hierarchy, or absent role language.
3. Build an evidence map before rewriting. Classify each important requirement as supported, adjacent/transferable, or unsupported.
4. Ask one batch of targeted questions only when answers could add truthful evidence or clarify ambiguous dates, scope, ownership, or outcomes.
5. Rewrite for relevance. Reorder supported content, mirror accurate job terminology, and express achievements as action + scope + outcome. Never add a metric, tool, credential, employer, title, date, or responsibility that the source does not support.
6. Produce a clean, single-column resume with standard headings. Prefer one page for early-career candidates and use a second page only when relevant evidence justifies it.
7. Verify the result against the checks below. If file-generation tools exist, provide an editable format and a text-based PDF; otherwise provide well-structured Markdown and state what was not generated.

Read [references/tailoring-guide.md](references/tailoring-guide.md) when matching against a job. Read [references/output-contract.md](references/output-contract.md) when structured JSON or application integration is requested. The additional references in this directory provide role-specific guidance when relevant.

## Required checks

- Every claim is traceable to the candidate's source or explicit answer.
- Important supported requirements appear naturally; unsupported requirements are not implied.
- Bullets describe outcomes where evidence exists and use qualitative scope where numbers do not.
- Dates, tense, capitalization, punctuation, and section order are consistent.
- Contact details are preserved exactly unless the user requests a change.
- No keyword stuffing, hidden text, columns, decorative icons, skill bars, or layout tables.
- Never claim an ATS score or guarantee interview outcomes. Explain gaps qualitatively.

## Delivery

Return the tailored resume plus a short match note containing strengths, remaining gaps, and assumptions. Keep analysis separate from resume content. Do not send, upload, overwrite, or apply with the resume unless the user explicitly authorizes that action.
