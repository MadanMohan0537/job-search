interface Env {
  AI_PROVIDER?: 'anthropic' | 'google' | 'openai' | 'openai-compatible' | 'deepseek' | 'custom';
  AI_MODEL?: string;
  AI_BASE_URL?: string;
  AI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  GEMINI_API_KEY?: string;
  OPENAI_API_KEY?: string;
  DEEPSEEK_API_KEY?: string;
  CUSTOM_API_KEY?: string;
  CUSTOM_BASE_URL?: string;
  FRONTEND_ORIGIN?: string;
  ASSETS: Fetcher;
}

type Provider = 'anthropic' | 'google' | 'openai' | 'openai-compatible' | 'deepseek' | 'custom';

interface TailorRequestBody {
  masterResume?: string;
  jobUrl?: string;
  jobDescription?: string;
  provider?: string;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
  templateId?: string;
}

const json = (data: unknown, status = 200, origin = '*') =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': origin,
      'access-control-allow-headers': 'content-type, authorization',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
    },
  });

const cleanHtml = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 50000);

const allowedUrl = (value: string) => {
  const u = new URL(value);
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('Unsupported URL protocol.');
  const h = u.hostname.toLowerCase();
  if (h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0' || h.endsWith('.local')) {
    throw new Error('Private URLs are not allowed.');
  }
  return u;
};

async function jobFromUrl(value: string) {
  const r = await fetch(allowedUrl(value).toString(), {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 ResumeMatcher/2.0',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(12000),
  });
  if (!r.ok) throw new Error('The job page could not be read. Please paste the job description text instead.');
  const text = cleanHtml(await r.text());
  if (text.length < 300) throw new Error('The job page did not contain enough readable text. Please paste the job description text instead.');
  return text;
}

const SYSTEM_PROMPT = `You are an expert, truth-grounded AI Resume Tailoring and Matching Engine.
Return ONLY valid, parseable JSON with NO markdown code fences or backticks.

CRITICAL DIRECTIVES:
1. THE MASTER RESUME IS THE SOLE FACTUAL SOURCE. Never invent employers, titles, dates, education, certifications, skills, responsibilities, metrics, tools, industries, or work authorization.
2. OUTCOMES, NOT DUTIES: Frame bullets using the Google XYZ formula ("Accomplished [X] as measured by [Y], by doing [Z]") or the PM TAR formula (Task, Action, Result).
3. 1-LINE COMPANY & DOMAIN CONTEXT: Include 1 line under each role describing company domain, scale, and scope owned.
4. ATS COMPLIANCE: Single-column format, standard section headings, no tables, concise bullets (under 28 words each, no trailing period).

Output EXACTLY this JSON schema:
{
  "jobTitle": "Target job title from posting",
  "company": "Target company name from posting",
  "templateRecommendation": "01-executive-serif | 02-modern-minimal | 03-growth-metrics | 04-ai-product | 05-associate-onepager",
  "matchScore": 88,
  "matchedKeywords": ["Keyword 1", "Keyword 2", "Keyword 3"],
  "missingKeywords": ["Keyword 4", "Keyword 5"],
  "match": {
    "strengths": ["Verified alignment point 1", "Verified alignment point 2"],
    "gaps": ["Unverified posting requirement 1"],
    "assumptions": []
  },
  "resume": {
    "name": "Candidate Full Name",
    "title": "Target Professional Title",
    "location": "City, State / Remote",
    "contact": "Email | Phone | LinkedIn | Portfolio",
    "summary": "Impact-driven summary under 45 words aligning candidate's verified record with the role's priorities.",
    "impactHighlights": ["Signature quantified outcome 1", "Signature quantified outcome 2"],
    "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6", "Skill 7", "Skill 8"],
    "experience": [
      {
        "heading": "Job Title | Company Name | Dates",
        "company": "Company Name",
        "title": "Job Title",
        "dates": "Start Date - End Date",
        "companyContext": "One-line context on company scale, product, domain, and owned scope",
        "bullets": [
          "Accomplished [outcome/metric] by shipping [action] for [audience/scope]",
          "Led [action] across [teams], delivering [quantified impact]"
        ]
      }
    ],
    "education": ["Degree Name, University Name (Year)"],
    "certifications": ["Certification Name (Issuer, Year)"]
  }
}`;

const stripFence = (value: string) =>
  value
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

function resolveConfig(body: TailorRequestBody, env: Env) {
  // Normalize provider string
  let providerStr = (body.provider || env.AI_PROVIDER || '').toLowerCase();
  if (providerStr === 'google' || providerStr === 'gemini') {
    providerStr = 'google';
  } else if (providerStr === 'anthropic' || providerStr === 'claude') {
    providerStr = 'anthropic';
  } else if (providerStr === 'openai' || providerStr === 'chatgpt') {
    providerStr = 'openai';
  } else if (providerStr === 'deepseek') {
    providerStr = 'deepseek';
  } else if (providerStr === 'custom' || providerStr === 'ollama' || providerStr === 'openai-compatible') {
    providerStr = 'openai-compatible';
  } else {
    // Inferred from available keys
    if (body.apiKey?.startsWith('sk-ant-') || env.ANTHROPIC_API_KEY) {
      providerStr = 'anthropic';
    } else if (body.apiKey?.startsWith('AIzaSy') || env.GEMINI_API_KEY) {
      providerStr = 'google';
    } else if (env.DEEPSEEK_API_KEY) {
      providerStr = 'deepseek';
    } else {
      providerStr = 'openai-compatible';
    }
  }

  const provider = providerStr as Provider;

  // Resolve API Key: client override takes precedence, then AI_API_KEY, then specific provider key
  let apiKey = body.apiKey || env.AI_API_KEY;
  if (!apiKey) {
    if (provider === 'anthropic') apiKey = env.ANTHROPIC_API_KEY;
    else if (provider === 'google') apiKey = env.GEMINI_API_KEY;
    else if (provider === 'openai') apiKey = env.OPENAI_API_KEY;
    else if (provider === 'deepseek') apiKey = env.DEEPSEEK_API_KEY;
    else if (provider === 'openai-compatible') apiKey = env.OPENAI_API_KEY || env.CUSTOM_API_KEY;
  }

  // Resolve Model
  let model = body.model || env.AI_MODEL;
  if (!model) {
    if (provider === 'anthropic') model = 'claude-3-7-sonnet-20250219';
    else if (provider === 'google') model = 'gemini-2.5-flash';
    else if (provider === 'deepseek') model = 'deepseek-chat';
    else model = 'gpt-4o';
  }

  // Resolve Base URL for OpenAI-compatible endpoints
  let baseUrl = body.baseUrl || env.AI_BASE_URL || env.CUSTOM_BASE_URL;
  if (!baseUrl) {
    if (provider === 'deepseek') baseUrl = 'https://api.deepseek.com/v1';
    else baseUrl = 'https://api.openai.com/v1';
  }

  return { provider, apiKey, model, baseUrl };
}

async function callProvider(provider: Provider, apiKey: string | undefined, model: string, baseUrl: string, prompt: string) {
  if (!apiKey && !baseUrl.includes('localhost') && !baseUrl.includes('11434')) {
    throw new Error(`API key is not configured for provider '${provider}'. Either set it in Cloudflare Worker secrets or enter it directly in the web UI settings.`);
  }

  if (provider === 'anthropic') {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        temperature: 0.2,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = (await r.json()) as any;
    if (!r.ok) throw new Error(data?.error?.message || `Anthropic API request failed (${r.status})`);
    return data.content?.find((x: any) => x.type === 'text')?.text || '';
  }

  if (provider === 'google') {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey || ''}`;
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    });
    const data = (await r.json()) as any;
    if (!r.ok) throw new Error(data?.error?.message || `Google Gemini API request failed (${r.status})`);
    return data.candidates?.[0]?.content?.parts?.map((part: any) => part.text || '').join('') || '';
  }

  // OpenAI, DeepSeek, or OpenAI-compatible (Ollama, LM Studio, vLLM, OpenRouter)
  const cleanBase = baseUrl.replace(/\/$/, '');
  const url = `${cleanBase}/chat/completions`;
  const isLocal = cleanBase.includes('localhost') || cleanBase.includes('11434');

  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  if (apiKey) {
    headers['authorization'] = `Bearer ${apiKey}`;
  }

  const reqBody: any = {
    model,
    temperature: 0.2,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
  };

  if (!isLocal) {
    reqBody.response_format = { type: 'json_object' };
  }

  const r = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(reqBody),
  });

  const data = (await r.json()) as any;
  if (!r.ok) throw new Error(data?.error?.message || `API request failed (${r.status}): ${JSON.stringify(data)}`);
  return data.choices?.[0]?.message?.content || '';
}

function parseResponseJson(raw: string) {
  const cleaned = stripFence(raw);
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error('Failed to parse AI output as JSON: ' + raw.slice(0, 200));
  }
}

export default {
  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);
    const origin = env.FRONTEND_ORIGIN || req.headers.get('origin') || '*';

    if (url.pathname.startsWith('/api/')) {
      if (req.method === 'OPTIONS') return json({}, 204, origin);

      if (url.pathname === '/api/health' && req.method === 'GET') {
        const c = resolveConfig({}, env);
        return json(
          {
            ok: true,
            provider: c.provider,
            model: c.model,
            hasServerKey: Boolean(c.apiKey),
            supportedProviders: ['anthropic', 'google', 'openai', 'deepseek', 'openai-compatible'],
          },
          200,
          origin
        );
      }

      if (url.pathname !== '/api/tailor' || req.method !== 'POST') {
        return json({ error: 'Endpoint not found.' }, 404, origin);
      }

      try {
        const body = (await req.json()) as TailorRequestBody;
        if (!body.masterResume?.trim()) {
          return json({ error: 'Master resume is required.' }, 400, origin);
        }

        let job = body.jobDescription?.trim() || '';
        if (!job && body.jobUrl) {
          job = await jobFromUrl(body.jobUrl);
        }
        if (!job) {
          return json({ error: 'Job URL or description text is required.' }, 400, origin);
        }

        const { provider, apiKey, model, baseUrl } = resolveConfig(body, env);

        const prompt = `TARGET TEMPLATE: ${body.templateId || '01-executive-serif'}\n\nMASTER RESUME:\n${body.masterResume.slice(0, 40000)}\n\nJOB POSTING:\n${job.slice(0, 40000)}`;

        const raw = await callProvider(provider, apiKey, model, baseUrl, prompt);
        const parsed = parseResponseJson(raw);

        // Normalize match data for contract compatibility
        const strengths = parsed.match?.strengths || parsed.matchedKeywords || [];
        const gaps = parsed.match?.gaps || parsed.missingKeywords || [];
        const assumptions = parsed.match?.assumptions || [];

        parsed.matchedKeywords = strengths;
        parsed.missingKeywords = gaps;
        parsed.match = { strengths, gaps, assumptions };

        if (!parsed.matchScore) {
          const total = strengths.length + gaps.length;
          parsed.matchScore = total > 0 ? Math.round((strengths.length / total) * 100) : 85;
        }

        // Normalize experience headings
        if (parsed.resume?.experience) {
          parsed.resume.experience = parsed.resume.experience.map((exp: any) => ({
            ...exp,
            heading:
              exp.heading ||
              `${exp.title || ''} | ${exp.company || ''} | ${exp.dates || ''}`.replace(/^ \| | \| $/g, ''),
          }));
        }

        parsed.meta = {
          provider,
          model,
          templateId: body.templateId || parsed.templateRecommendation || '01-executive-serif',
        };

        return json(parsed, 200, origin);
      } catch (e: any) {
        return json({ error: e.message || 'Unexpected tailoring error.' }, 500, origin);
      }
    }

    return env.ASSETS.fetch(req);
  },
};
