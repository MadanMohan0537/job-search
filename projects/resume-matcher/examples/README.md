# Resume Matcher Examples

This directory provides concrete, real-world examples demonstrating how Resume Matcher ingests a candidate's background and produces recruiter-grade, ATS-guaranteed tailored resumes.

---

## What is in this directory:

| File | Description |
|---|---|
| [`sample-master-resume.md`](./sample-master-resume.md) | Candidate's verified master career background (7 years of product & tech experience with raw metrics). |
| [`sample-job-posting.md`](./sample-job-posting.md) | Target job posting: *Lead Product Manager (Developer Platform & AI)* at ScaleGrid Technologies. |
| [`sample-tailored-resume-executive.md`](./sample-tailored-resume-executive.md) | The tailored output in **01 Executive Serif** template format, demonstrating Google XYZ bullets, 1-line company context, and truthful keyword alignment. |

---

## How to run this example with any AI model

### 1. In Claude / ChatGPT / Gemini / DeepSeek (Web UI)
1. Copy the universal prompt from [`skills/universal-prompt.md`](../skills/universal-prompt.md).
2. Paste it into the chat along with the contents of `sample-master-resume.md` and `sample-job-posting.md`.
3. Observe how the AI diagnoses weaknesses, extracts metrics, and writes outcome bullets without hallucination.

### 2. In the Resume Matcher Web Application
1. Start the web app locally (`npm run dev:web`).
2. Paste the text from `sample-master-resume.md` into Step 1.
3. Paste `sample-job-posting.md` into Step 2.
4. Select your preferred template style and AI model, then click **Tailor & Match Resume**.
5. Preview the result in real time and download the ATS-parseable PDF.
