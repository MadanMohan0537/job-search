interface Env {
  AI_PROVIDER?: 'anthropic' | 'google' | 'openai-compatible';
  AI_MODEL?: string;
  AI_BASE_URL?: string;
  AI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  GEMINI_API_KEY?: string;
  OPENAI_API_KEY?: string;
  FRONTEND_ORIGIN?: string;
  ASSETS: Fetcher;
}

type Provider = NonNullable<Env['AI_PROVIDER']>;

const json = (data: unknown, status = 200, origin = '*') =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': origin,
      'access-control-allow-headers': 'content-type',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
    },
  });

const cleanHtml = (html: string) =>
  html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ').trim().slice(0, 50000);

const allowedUrl = (value: string) => {
  const u = new URL(value);
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('Unsupported URL');
  const h = u.hostname.toLowerCase();
  if (h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0' || h.endsWith('.local')) {
    throw new Error('Private URLs are not allowed');
  }
  return u;
};

async function jobFromUrl(value: string) {
  const r = await fetch(allowedUrl(value).toString(), {
    headers: { 'user-agent': 'Mozilla/5.0 ResumeMatcher/2.0' }, redirect: 'follow', signal: AbortSignal.timeout(12000),
  });
  if (!r.ok) throw new Error('The job page could not be read. Paste the job description instead.');
  const text = cleanHtml(await r.text());
  if (text.length < 500) throw new Error('The job page did not contain enough readable text. Paste the job description instead.');
  return text;
}

const system = `You are a truthful resume-tailoring engine. Return only valid JSON. The master resume is the sole factual source. Never invent employers, titles, dates, education, certifications, skills, responsibilities, metrics, tools, industries, or work authorization. Reword and prioritize only supported evidence for the target role. Use concise achievement bullets and preserve the candidate's name and contact details. Output exactly this shape: {"jobTitle":"","company":"","resume":{"name":"","contact":"","summary":"","skills":[""],"experience":[{"heading":"","bullets":[""]}],"education":[""],"certifications":[""]}}. Keep the summary under 45 words, skills under 18 items, total experience bullets at most 10, and each bullet under 24 words.`;

const stripFence = (value: string) => value.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');

function config(env: Env) {
  const provider: Provider = env.AI_PROVIDER || (env.ANTHROPIC_API_KEY ? 'anthropic' : env.GEMINI_API_KEY ? 'google' : 'openai-compatible');
  const apiKey = env.AI_API_KEY || (provider === 'anthropic' ? env.ANTHROPIC_API_KEY : provider === 'google' ? env.GEMINI_API_KEY : env.OPENAI_API_KEY);
  const model = env.AI_MODEL || (provider === 'anthropic' ? 'claude-sonnet-4-20250514' : provider === 'google' ? 'gemini-2.5-flash' : 'gpt-4.1-mini');
  if (!apiKey) throw new Error(`No API key configured for ${provider}.`);
  return { provider, apiKey, model };
}

async function generate(env: Env, prompt: string) {
  const { provider, apiKey, model } = config(env);
  if (provider === 'anthropic') {
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model, max_tokens: 4000, temperature: 0.2, system, messages: [{ role: 'user', content: prompt }] }) });
    const data = await r.json() as any;
    if (!r.ok) throw new Error(data?.error?.message || 'Anthropic request failed.');
    return data.content?.find((x: any) => x.type === 'text')?.text || '';
  }
  if (provider === 'google') {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const r = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey }, body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json' } }) });
    const data = await r.json() as any;
    if (!r.ok) throw new Error(data?.error?.message || 'Google request failed.');
    return data.candidates?.[0]?.content?.parts?.map((part: any) => part.text || '').join('') || '';
  }
  const base = (env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const r = await fetch(`${base}/chat/completions`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model, temperature: 0.2, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }] }) });
  const data = await r.json() as any;
  if (!r.ok) throw new Error(data?.error?.message || 'OpenAI-compatible request failed.');
  return data.choices?.[0]?.message?.content || '';
}

export default {
  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);
    const origin = env.FRONTEND_ORIGIN || req.headers.get('origin') || '*';
    if (url.pathname.startsWith('/api/')) {
      if (req.method === 'OPTIONS') return json({}, 204, origin);
      if (url.pathname === '/api/health' && req.method === 'GET') {
        try { const c = config(env); return json({ ok: true, provider: c.provider, model: c.model }, 200, origin); }
        catch (e: any) { return json({ ok: false, error: e.message }, 503, origin); }
      }
      if (url.pathname !== '/api/tailor' || req.method !== 'POST') return json({ error: 'Not found' }, 404, origin);
      try {
        const body = await req.json() as { masterResume?: string; jobUrl?: string; jobDescription?: string };
        if (!body.masterResume?.trim()) return json({ error: 'Master resume is required.' }, 400, origin);
        let job = body.jobDescription?.trim() || '';
        if (!job && body.jobUrl) job = await jobFromUrl(body.jobUrl);
        if (!job) return json({ error: 'Job URL or description is required.' }, 400, origin);
        const prompt = `MASTER RESUME:\n${body.masterResume.slice(0, 40000)}\n\nJOB POSTING:\n${job.slice(0, 40000)}`;
        const parsed = JSON.parse(stripFence(await generate(env, prompt)));
        return json(parsed, 200, origin);
      } catch (e: any) { return json({ error: e.message || 'Unexpected error' }, 500, origin); }
    }
    return env.ASSETS.fetch(req);
  },
};
