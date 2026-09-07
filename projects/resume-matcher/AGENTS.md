# AGENTS.md: Universal AI Assistant Guidelines

This document provides instructions for any autonomous coding agent or AI assistant (GitHub Copilot, Cline, Roo-Code, Cursor, Windsurf, Antigravity) operating in this repository.

## Repository Purpose
Resume Matcher is a multi-model, truth-grounded AI resume tailoring engine and universal skill ecosystem. It supports:
1. **Interactive Full-Stack Web Application:** React + Vite (`apps/web`) powered by a single Cloudflare Worker deployment (`apps/worker`).
2. **Universal Skill Adapters:** Claude (`skills/claude`), ChatGPT (`skills/chatgpt`), Gemini (`skills/gemini`), Local LLMs (`skills/local-llm`), and Universal Prompt (`skills/universal-prompt.md`).
3. **Knowledge Base & References:** Detailed guides on ATS parsing, bullet writing formulas, and metrics by archetype (`skills/references/`).
4. **5 ATS-Guaranteed Templates:** Spec and preview files in `templates/`.

## Coding & Architectural Guidelines
- **Zero Hallucination Guarantee:** The core AI prompt must always enforce that the candidate's master resume is the sole factual source.
- **Multi-Model Provider Support:** The worker API (`apps/worker/src/index.ts`) must maintain support for Anthropic, OpenAI, Gemini, DeepSeek, and custom OpenAI-compatible endpoints.
- **Client-Side Privacy:** Resumes and user API keys must never be persisted to a central database or server logs.
- **Build Commands:**
  - Full build: `npm run build`
  - Web only: `npm run build:web`
  - Worker only: `npm run build:worker`
