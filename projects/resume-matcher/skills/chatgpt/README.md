# Using Resume Matcher with OpenAI ChatGPT

You can use Resume Matcher with OpenAI in two ways:
1. **As a Custom GPT in ChatGPT Plus / Team / Enterprise**
2. **In ChatGPT Free / Plus via System Prompt or Custom Instructions**

---

## Method 1: Create a Custom GPT (Recommended)

1. Open **ChatGPT** and click on your profile → **My GPTs** → **Create a GPT**.
2. Click on the **Configure** tab:
   - **Name:** `Resume Matcher & Builder`
   - **Description:** `Truth-grounded ATS resume optimizer and builder across 5 recruiter-grade templates.`
   - **Instructions:** Copy and paste the entire contents of [`system_prompt.md`](./system_prompt.md).
3. Under **Conversation Starters**, add:
   - *"Tailor my master resume to this job posting"*
   - *"Review my resume and tell me what is weak"*
   - *"Rewrite my resume bullets using the Google XYZ formula"*
   - *"Make my resume ATS-friendly in the Executive Serif template"*
4. *(Optional)* **Add Custom Actions:**
   - If you deployed the Resume Matcher worker on Cloudflare, click **Create new action**.
   - Paste the contents of [`gpt_action_schema.json`](./gpt_action_schema.json) into the Schema box.
   - Replace the server URL with your deployed Cloudflare Worker URL.
5. Click **Save** (Publish to Only me or Public).

---

## Method 2: Direct Chat or Custom Instructions

1. Open ChatGPT.
2. Paste the prompt from [`system_prompt.md`](./system_prompt.md) into the chat.
3. Attach or paste your resume and target job description.
