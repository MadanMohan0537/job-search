# Using Resume Matcher with Google Gemini

You can run Resume Matcher using **Google Gemini Advanced (Gems)** or via **Google AI Studio / Gemini API**.

---

## Method 1: Create a Gemini Gem (Gemini Advanced)

1. Open [gemini.google.com](https://gemini.google.com).
2. In the left navigation sidebar, click on **Gem Manager** → **New Gem**.
3. Set:
   - **Name:** `Resume Matcher`
   - **Instructions:** Paste the contents of [`gemini_system_instructions.md`](./gemini_system_instructions.md).
4. Click **Save**.
5. Upload your master resume PDF and paste target job links to start tailoring!

---

## Method 2: Google AI Studio

1. Visit [aistudio.google.com](https://aistudio.google.com).
2. Create a **Chat Prompt**.
3. In **System Instructions**, paste [`gemini_system_instructions.md`](./gemini_system_instructions.md).
4. Choose `Gemini 2.5 Pro` or `Gemini 2.5 Flash`.
