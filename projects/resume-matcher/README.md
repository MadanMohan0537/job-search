<div align="center">

# 🎯 Resume Matcher

### Universal Multi-Model AI Resume Tailoring Engine & Agent Skill
**A recruiter-grade, ATS-guaranteed resume tailoring intelligence system built to work seamlessly with ANY AI model.**

<p align="center">
  <a href="#-supported-ai-models--platforms"><img src="https://img.shields.io/badge/AI%20Models-Claude%20%7C%20ChatGPT%20%7C%20Gemini%20%7C%20DeepSeek%20%7C%20Ollama-blueviolet?style=for-the-badge" alt="Multi-Model AI"></a>
  <a href="#-the-5-ats-guaranteed-templates"><img src="https://img.shields.io/badge/ATS-Guaranteed%20(5%20Templates)-0b7a52?style=for-the-badge" alt="ATS Guaranteed"></a>
  <a href="#-privacy--zero-database-guarantee"><img src="https://img.shields.io/badge/Privacy-100%25%20Client--Side%20%26%20Zero--DB-0284c7?style=for-the-badge" alt="Private"></a>
  <a href="#-continuous-integration--validation"><img src="https://img.shields.io/badge/CI-Passing%20(Agent%20Skills%20Spec)-10b981?style=for-the-badge" alt="CI Passing"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-58a6ff?style=for-the-badge" alt="MIT License"></a>
</p>

<img src="./assets/preview-executive.png" alt="Executive Serif Resume Template Preview" width="620">

</div>

---

## 📖 Table of Contents

- [Why Resume Matcher?](#-why-resume-matcher)
- [Architecture](#-architecture)
- [The 5 ATS-Guaranteed Templates](#-the-5-ats-guaranteed-templates)
- [Supported AI Models & Platforms](#-supported-ai-models--platforms)
- [Quickstart: Choose Your Surface](#-quickstart-choose-your-surface)
  - [1. Universal Zero-Install Prompt](#1-universal-zero-install-prompt-any-llm)
  - [2. Anthropic Claude (Claude.ai & Claude Code)](#2-anthropic-claude-claudeai--claude-code)
  - [3. OpenAI ChatGPT & Codex](#3-openai-chatgpt--codex)
  - [4. Google Gemini & Gemini CLI](#4-google-gemini--gemini-cli)
  - [5. Local LLMs (Ollama & LM Studio)](#5-local-llms-ollama--lm-studio)
  - [6. AI Coding Agents (Cursor, Windsurf, Antigravity)](#6-ai-coding-assistants-cursor-windsurf-antigravity)
- [Full-Stack Web Application](#-full-stack-web-application)
  - [Local Development](#local-development)
  - [Cloudflare Deployment](#cloudflare-deployment)
- [Evidence-Grounded Tailoring Philosophy](#-evidence-grounded-tailoring-philosophy)
- [Real-World Examples](#-real-world-examples)
- [Knowledge Base & References](#-knowledge-base--references)
- [Continuous Integration & Validation](#-continuous-integration--validation)
- [Privacy & Zero-Database Guarantee](#-privacy--zero-database-guarantee)
- [License](#-license)

---

## 🌟 Why Resume Matcher?

Most resume optimization tools suffer from two major flaws:
1. **Vendor Lock-In:** Traditional skill repositories (like `pm-resume-builder-skill`) are locked exclusively to Anthropic Claude, requiring proprietary desktop formats and Claude-only MCPs.
2. **Hallucination Risk:** Generic AI resume generators invent fake metrics, inflated titles, or exaggerated credentials that immediately crumble under interview scrutiny.

**Resume Matcher solves both problems:**
- **Truly Multi-Model:** Operates interchangeably across **Anthropic Claude**, **OpenAI ChatGPT / Codex**, **Google Gemini**, **DeepSeek**, **Local Open-Source LLMs (Ollama/LM Studio)**, and **Agentic IDEs (Cursor/Windsurf/Antigravity)**.
- **Strict Evidence-Grounded Truth:** The candidate's master resume is the **sole factual source**. It reorders, reframes, and highlights verified evidence using the **Google XYZ formula** and **PM TAR formula** without ever fabricating credentials, metrics, or employers.
- **Dual-Mode Flexibility:** Use it as a lightweight **portable agent skill** in your favorite AI chat/editor, OR run the **private full-stack web application** powered by Cloudflare Workers and React.

---

## 🏛 Architecture

```mermaid
flowchart TD
    subgraph Clients["User Surfaces"]
        WebUI["Interactive Web App (React + Vite)"]
        ChatAgents["Chat LLMs (ChatGPT / Claude / Gemini / DeepSeek)"]
        AgentIDEs["Coding Agents (Cursor / Windsurf / Antigravity)"]
    end

    subgraph SkillLayer["Universal Skill & Standards (agentskills.io)"]
        CanonicalSkill["skill/SKILL.md (Canonical Spec)"]
        Knowledge["skill/references/ (12 Industry Guides)"]
        Templates["templates/ (5 ATS Typography Specs)"]
    end

    subgraph BackendWorker["Multi-Model Cloudflare Worker API (/api/tailor)"]
        Router["Provider Adapter Router"]
        AnthropicAdapter["Anthropic API (Claude 3.7 / 3.5)"]
        OpenAIAdapter["OpenAI API (GPT-4o / o3-mini)"]
        GeminiAdapter["Google Gemini API (Gemini 2.5 Flash/Pro)"]
        DeepSeekAdapter["DeepSeek API (V3 / R1)"]
        CustomAdapter["OpenAI-Compatible / Ollama (/v1)"]
    end

    WebUI -->|Client PDF.js Parsing| WebUI
    WebUI -->|POST /api/tailor (BYOK or Server Key)| BackendWorker
    ChatAgents -->|Reads Instructions| CanonicalSkill
    AgentIDEs -->|Loads Rules & SKILL.md| CanonicalSkill
    CanonicalSkill --> Knowledge
    CanonicalSkill --> Templates
    Router --> AnthropicAdapter
    Router --> OpenAIAdapter
    Router --> GeminiAdapter
    Router --> DeepSeekAdapter
    Router --> CustomAdapter
    BackendWorker -->|Standard Output Contract| WebUI
    WebUI -->|ATS Single-Column Render| PDF["ATS-Parseable PDF & Text"]
```

---

## 📄 The 5 ATS-Guaranteed Templates

Every template is single-column, standard font, graphics-free, and verified to parse cleanly across Greenhouse, Lever, Workday, Ashby, Taleo, and iCIMS.

| Preview | Template | Best For | Styling & Typography Details |
|---|---|---|---|
| <img src="./templates/01-executive-serif/preview.png" width="140"> | **01 Executive Serif** | Senior, Staff, Lead, Director, VP, CPO, and Ex-Founders | Classic EB Garamond / Georgia serif, centered header, 0.5pt full-width underline dividers, authoritative executive presence |
| <img src="./templates/02-modern-minimal/preview.png" width="140"> | **02 Modern Minimal** | Mid-level PMs, Software Engineers, and tech company roles | Clean Inter / Helvetica sans-serif, left-aligned header, subtle dividers, modern tech aesthetic |
| <img src="./templates/03-growth-metrics/preview.png" width="140"> | **03 Growth & Metrics** | Growth PMs, Monetization, Data Engineers, and Performance | Features a **"Selected Impact & Growth Highlights"** callout strip directly under the summary |
| <img src="./templates/04-ai-product/preview.png" width="140"> | **04 AI Product & Tech** | AI/ML PMs, ML Engineers, and Data Scientists | Dedicated section for AI models, evaluation pipelines, and latency/cost/quality tradeoffs |
| <img src="./templates/05-associate-onepager/preview.png" width="140"> | **05 Associate One-Pager** | APMs, early-career engineers, switchers, and new grads | High-density single-page format maximizing impact from projects, internships, and core technical skills |

> Full layout specifications, font pairings, and line spacing benchmarks are documented in [`skill/references/template-specifications.md`](./skill/references/template-specifications.md).

---

## 🤖 Supported AI Models & Platforms

| Model / Platform | Integration Method | Configuration File |
|---|---|---|
| **Any LLM (Zero Install)** | Direct copy & paste prompt into any chat window | [`skills/universal-prompt.md`](./skills/universal-prompt.md) |
| **Anthropic Claude** | `.skill` package upload or Claude Code CLI | [`resume-matcher.skill`](./resume-matcher.skill) / [`skills/claude/`](./skills/claude/) |
| **OpenAI ChatGPT & Codex** | Custom GPT with Actions or Codex skills folder | [`skills/chatgpt/`](./skills/chatgpt/) / [`skill/agents/openai.yaml`](./skill/agents/openai.yaml) |
| **Google Gemini & CLI** | Gemini Gem or Gemini CLI agent skill | [`skills/gemini/`](./skills/gemini/) / [`docs/INSTALLATION.md`](./docs/INSTALLATION.md) |
| **Local LLMs (Ollama)** | 100% offline via Ollama Modelfile or LM Studio | [`skills/local-llm/Modelfile`](./skills/local-llm/Modelfile) |
| **DeepSeek** | Cloudflare worker adapter or direct prompt | [`skills/universal-prompt.md`](./skills/universal-prompt.md) |
| **Cursor IDE** | Root workspace rules | [`.cursorrules`](./.cursorrules) |
| **Windsurf IDE** | Cascade agent rules | [`.windsurfrules`](./.windsurfrules) |
| **Universal Agents** | Standard Agent Skills specification | [`AGENTS.md`](./AGENTS.md) / [`skill/SKILL.md`](./skill/SKILL.md) |
| **Full-Stack Web App** | React/Vite UI with BYOK and Cloudflare Worker API | [`apps/web/`](./apps/web/) & [`apps/worker/`](./apps/worker/) |

---

## 🚀 Quickstart: Choose Your Surface

### 1. Universal Zero-Install Prompt (Any LLM)
If you want to tailor a resume right now in **any chat window** (ChatGPT, Claude, Gemini, DeepSeek, Grok, Copilot):
1. Open [`skills/universal-prompt.md`](./skills/universal-prompt.md).
2. Copy the prompt block.
3. Paste it into your AI chat along with your master resume and target job posting.

---

### 2. Anthropic Claude (Claude.ai & Claude Code)

- **Claude.ai (easiest):** Download [`resume-matcher.skill`](./resume-matcher.skill), open **Settings → Capabilities → Skills → Upload skill**, and say: *"Tailor my master resume to this job posting."*
- **Claude Code CLI:**
  ```bash
  cp -R skill ~/.claude/skills/resume-matcher
  ```

---

### 3. OpenAI ChatGPT & Codex

- **ChatGPT Custom GPT:**
  1. Open ChatGPT → **My GPTs** → **Create a GPT** → **Configure**.
  2. Paste the prompt from [`skills/chatgpt/system_prompt.md`](./skills/chatgpt/system_prompt.md) into **Instructions**.
  3. *(Optional)* Connect your deployed Cloudflare API using the OpenAPI schema in [`skills/chatgpt/gpt_action_schema.json`](./skills/chatgpt/gpt_action_schema.json).
  4. See [`skills/chatgpt/README.md`](./skills/chatgpt/README.md) for full instructions.
- **OpenAI Codex:**
  ```bash
  cp -R skill ~/.codex/skills/resume-matcher
  ```

---

### 4. Google Gemini & Gemini CLI

- **Gemini Advanced (Gems):**
  1. Go to [gemini.google.com](https://gemini.google.com) → **Gem Manager** → **New Gem**.
  2. Paste the prompt from [`skills/gemini/gemini_system_instructions.md`](./skills/gemini/gemini_system_instructions.md).
  3. See [`skills/gemini/README.md`](./skills/gemini/README.md) for details.
- **Gemini CLI:**
  ```bash
  gemini skills install https://github.com/MadanMohan0537/Resume-Matcher
  ```

---

### 5. Local LLMs (Ollama & LM Studio)

Run 100% offline with zero cloud API keys and total privacy:
```bash
cd skills/local-llm
ollama create resume-matcher -f Modelfile
ollama run resume-matcher
```
See [`skills/local-llm/README.md`](./skills/local-llm/README.md) for LM Studio, Jan, and vLLM setups.

---

### 6. AI Coding Assistants (Cursor, Windsurf, Antigravity)

- **Cursor:** Automatically applies [`.cursorrules`](./.cursorrules) at the workspace root.
- **Windsurf:** Automatically applies [`.windsurfrules`](./.windsurfrules) via Cascade.
- **Antigravity / Agentic IDEs:** Standard skill located at [`.agents/skills/resume-matcher/SKILL.md`](./.agents/skills/resume-matcher/SKILL.md) and [`AGENTS.md`](./AGENTS.md).

---

## 💻 Full-Stack Web Application

The repository includes a modern React/Vite frontend and Cloudflare Worker API in a unified monorepo.

### Local Development

**Prerequisites:** Node.js 20+ and npm.

```bash
git clone https://github.com/MadanMohan0537/Resume-Matcher.git
cd Resume-Matcher
npm install
```

Create `apps/worker/.dev.vars` for local secrets (optional if using in-browser BYOK):

```dotenv
AI_PROVIDER=openai-compatible
AI_API_KEY=your-api-key-here
AI_MODEL=gpt-4o
AI_BASE_URL=https://api.openai.com/v1
```

Run in development mode using two terminals:

```bash
# Terminal 1: Run the multi-model Cloudflare Worker API
npm run dev:worker

# Terminal 2: Run the React / Vite frontend
npm run dev:web
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Cloudflare Deployment

Deploy both the React frontend and the multi-model API as a single, low-latency Cloudflare Worker using the root `wrangler.jsonc`:

```bash
npx wrangler login
npx wrangler secret put AI_API_KEY
npm run deploy
```

You can set provider-specific secrets:
```bash
# For Anthropic:
npx wrangler secret put ANTHROPIC_API_KEY

# For OpenAI:
npx wrangler secret put OPENAI_API_KEY

# For Google Gemini:
npx wrangler secret put GEMINI_API_KEY

# For DeepSeek:
npx wrangler secret put DEEPSEEK_API_KEY
```

> **Client-Side BYOK Support:** Even without server secrets, end users can provide their own API key directly in the web UI settings drawer (stored strictly in browser `localStorage`).

---

## 🎯 Evidence-Grounded Tailoring Philosophy

1. **The 6–8 Second Recruiter Scan:** Recruiters prioritize titles, owned scope, and quantified outcomes over passive duties.
2. **Zero Hallucination Guarantee:** The candidate's master resume is the sole factual source. The engine never invents employers, titles, dates, degrees, certifications, skills, tools, or metrics.
3. **The Google XYZ Formula:** Every achievement bullet follows:
   $$\text{"Accomplished [X] as measured by [Y], by doing [Z]"}$$
4. **The PM TAR Formula:**
   $$\text{[Action Verb]} + \text{[What you shipped or owned]} + \text{[For whom / Scope]} + \text{[Measurable Result]}$$
5. **1-Line Company & Domain Context Rule:** Every role includes an italicized context line under the company heading:
   > **Lead Product Manager** | Lumofy | Aug 2024 – Present  
   > *AI-powered talent-development SaaS ($40M valuation, 500+ MENA enterprises). Led core API platform and AI copilot.*

---

## 📂 Real-World Examples

Explore the [`examples/`](./examples/) directory to see how Resume Matcher transforms raw career backgrounds:

| Example File | Description |
|---|---|
| [`examples/sample-master-resume.md`](./examples/sample-master-resume.md) | Candidate's verified master career background (7 years of tech/product experience). |
| [`examples/sample-job-posting.md`](./examples/sample-job-posting.md) | Target job posting: *Lead Product Manager (Developer Platform & AI)*. |
| [`examples/sample-tailored-resume-executive.md`](./examples/sample-tailored-resume-executive.md) | Complete tailored output in **01 Executive Serif** template format. |
| [`examples/README.md`](./examples/README.md) | Walkthrough on how to run the example across any AI platform. |

---

## 📚 Knowledge Base & References

The [`skill/references/`](./skill/references/) directory contains battle-tested playbooks synthesized from top career coaches, FAANG hiring bars, and ATS engineering research:

| Guide | Description |
|---|---|
| [`tailoring-guide.md`](./skill/references/tailoring-guide.md) | Core evidence-mapping and truthful alignment methodology |
| [`output-contract.md`](./skill/references/output-contract.md) | Standard structured JSON contract for application & API consumers |
| [`bullet-writing-formulas.md`](./skill/references/bullet-writing-formulas.md) | Google XYZ & PM TAR formulas, 120+ power action verbs, before & after examples |
| [`metrics-by-archetype.md`](./skill/references/metrics-by-archetype.md) | Standard metrics and KPIs for PMs, SWEs, AI/ML Engineers, and Growth roles |
| [`template-specifications.md`](./skill/references/template-specifications.md) | Typography, font sizes, margins, and hierarchy for all 5 ATS templates |
| [`ats-and-keywords.md`](./skill/references/ats-and-keywords.md) | How Greenhouse, Lever, Workday, and Taleo parse resumes; keyword optimization |
| [`resume-structure.md`](./skill/references/resume-structure.md) | Single-column layout rules, section ordering, and page length guidelines |
| [`common-mistakes.md`](./skill/references/common-mistakes.md) | 15 fatal resume traps that trigger immediate recruiter rejection |
| [`pm-bullet-writing.md`](./skill/references/pm-bullet-writing.md) | Specialized bullet patterns for Product Management roles |
| [`pm-metrics-and-impact.md`](./skill/references/pm-metrics-and-impact.md) | Quantifying vague wins for Growth, Core, Platform, and AI PMs |
| [`pm-resume-structure.md`](./skill/references/pm-resume-structure.md) | Section organization and ATS export rules for product candidates |
| [`pm-templates.md`](./skill/references/pm-templates.md) | Template chooser and triggering reference |

---

## 🧪 Continuous Integration & Validation

The repository includes automated CI workflows checking both the Agent Skill specification and full-stack application builds:

```bash
# 1. Validate Agent Skill specification and references
npm run validate:skill

# 2. Package Claude .skill bundle and validate OpenAPI action schemas
npm run package:skills

# 3. Typecheck worker and build React/Vite assets
npm run build
```

GitHub Actions automatically runs these validations on all pushes and pull requests via [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).

---

## 🔒 Privacy & Zero-Database Guarantee

1. **No Central Database:** Your master resume is stored exclusively in your local browser storage (`localStorage`).
2. **Encrypted BYOK Security:** User-provided API keys are sent over encrypted HTTPS directly to the selected model provider and are never logged or persisted.
3. **SSRF Guard:** Job URL fetching automatically rejects private or local hostnames (`localhost`, `127.0.0.1`, `.local`).
4. **ATS Plain-Text Export:** Allows copying clean, structured text directly for application portals without formatting glitches.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
