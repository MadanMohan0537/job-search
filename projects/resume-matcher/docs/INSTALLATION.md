# Install the Resume Matcher skill

The portable skill is the `skill/` directory. It follows the Agent Skills convention: a root `SKILL.md` plus optional references. The web application is separate; installing the skill does not require deploying the app.

## Claude

```bash
cp -R skill ~/.claude/skills/resume-matcher
```

For clients that accept uploaded skills, zip the contents of `skill/` so `SKILL.md` is at the archive root, then upload the ZIP.

## OpenAI Codex

```bash
cp -R skill ~/.codex/skills/resume-matcher
```

Restart Codex after installing. The optional `agents/openai.yaml` supplies Codex UI metadata; other agents can ignore it.

## Gemini CLI

```bash
gemini skills install https://github.com/MadanMohan0537/Resume-Matcher
```

If a client expects the skill at the repository root, copy or upload the `skill/` directory directly.

## Other agents

Any Agent Skills-compatible client can use the `skill/` directory. If a client has no native skill loader, add `skill/SKILL.md` as project or system instructions and make the files under `skill/references/` available as context.

## Validate

```bash
npm run validate:skill
```

Then try: “Use the resume-matcher skill to tailor my attached resume to this job description without inventing facts.”
