# Running Resume Matcher with Local Open-Source LLMs (Ollama, LM Studio)

Run Resume Matcher 100% locally with zero cloud API keys and total privacy.

---

## Option 1: Ollama (CLI or Desktop)

1. Ensure [Ollama](https://ollama.ai) is installed.
2. In this directory, run:
   ```bash
   ollama create resume-matcher -f Modelfile
   ```
3. Run the model:
   ```bash
   ollama run resume-matcher
   ```
4. Paste your master resume and the target job posting to tailor it completely offline.

---

## Option 2: LM Studio / Jan / vLLM

1. Load your preferred model (e.g. `Llama-3.3-70B`, `Qwen-2.5-7B`, or `Mistral-Small`).
2. Paste the contents of [`system_prompt.txt`](./system_prompt.txt) into the **System Prompt** field.
3. Set `temperature: 0.2`.
