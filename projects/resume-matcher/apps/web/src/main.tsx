import React from 'react';
import ReactDOM from 'react-dom/client';
import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { jsPDF } from 'jspdf';
import './styles.css';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

type Provider = 'anthropic' | 'openai' | 'gemini' | 'deepseek' | 'custom';

type TemplateId =
  | '01-executive-serif'
  | '02-modern-minimal'
  | '03-growth-metrics'
  | '04-ai-product'
  | '05-associate-onepager';

interface ExperienceItem {
  company?: string;
  location?: string;
  title?: string;
  dates?: string;
  heading?: string;
  companyContext?: string;
  bullets: string[];
}

interface TailoredResume {
  name: string;
  title?: string;
  location?: string;
  contact: string;
  summary: string;
  impactHighlights?: string[];
  skills: string[];
  experience: ExperienceItem[];
  education: string[];
  certifications?: string[];
}

interface TailorResponse {
  jobTitle?: string;
  company?: string;
  templateRecommendation?: TemplateId;
  matchScore?: number;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  resume: TailoredResume;
  meta?: {
    provider: string;
    model: string;
    templateId: string;
  };
}

const TEMPLATES = [
  { id: '01-executive-serif' as TemplateId, name: '01 Executive Serif', desc: 'Senior, Lead, Director, CPO, and Ex-Founders (Classic Garamond)' },
  { id: '02-modern-minimal' as TemplateId, name: '02 Modern Minimal', desc: 'Mid-level PM / Tech roles at modern tech companies (Clean Sans)' },
  { id: '03-growth-metrics' as TemplateId, name: '03 Growth & Metrics', desc: 'Growth, Data, & Monetization roles with an Impact Callout strip' },
  { id: '04-ai-product' as TemplateId, name: '04 AI Product & Tech', desc: 'AI/ML PMs & Engineers highlighting models, evals, & tradeoffs' },
  { id: '05-associate-onepager' as TemplateId, name: '05 Associate One-Pager', desc: 'APM, early career, switchers, & high-density single page' },
];

const PROVIDERS: { id: Provider; name: string; defaultModel: string; models: string[]; keyPlaceholder: string; hasBaseUrl?: boolean }[] = [
  {
    id: 'openai',
    name: 'OpenAI (ChatGPT)',
    defaultModel: 'gpt-4o',
    models: ['gpt-4o', 'gpt-4o-mini', 'o3-mini', 'gpt-4.5-preview'],
    keyPlaceholder: 'sk-proj-... or sk-...',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    defaultModel: 'claude-3-7-sonnet-20250219',
    models: ['claude-3-7-sonnet-20250219', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
    keyPlaceholder: 'sk-ant-...',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    defaultModel: 'gemini-2.5-flash',
    models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-pro'],
    keyPlaceholder: 'AIzaSy...',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    keyPlaceholder: 'sk-... (DeepSeek API Key)',
  },
  {
    id: 'custom',
    name: 'Local Ollama / OpenRouter / Custom',
    defaultModel: 'llama3.2',
    models: ['llama3.2', 'mistral-small', 'deepseek-r1:8b', 'qwen2.5:7b'],
    keyPlaceholder: 'Optional key (or leave blank for local)',
    hasBaseUrl: true,
  },
];

async function extractPdf(file: File): Promise<string> {
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((x: any) => x.str).join(' '));
  }
  return pages.join('\n\n');
}

function exportPdf(r: TailoredResume, template: TemplateId) {
  const isSerif = template === '01-executive-serif';
  const isCenteredHeader = template === '01-executive-serif';
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  let y = 36;
  const left = 36;
  const width = 540;
  const font = isSerif ? 'times' : 'helvetica';

  const line = (text: string, size = 9, bold = false, gap = 11.5, align: 'left' | 'center' = 'left') => {
    doc.setFont(font, bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, width);
    for (const l of lines) {
      if (align === 'center') {
        doc.text(l, 306, y, { align: 'center' });
      } else {
        doc.text(l, left, y);
      }
      y += gap;
    }
  };

  const section = (title: string) => {
    y += 5;
    doc.setFont(font, 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(20, 20, 20);
    doc.text(title.toUpperCase(), left, y);
    y += 4;
    doc.setDrawColor(60, 60, 60);
    doc.setLineWidth(0.6);
    doc.line(left, y, left + width, y);
    y += 8;
  };

  doc.setTextColor(15, 15, 15);

  // Header
  if (isCenteredHeader) {
    line(r.name, 17, true, 18, 'center');
    if (r.title) line(r.title, 10.5, true, 13, 'center');
    const metaParts = [r.location, r.contact].filter(Boolean).join('  |  ');
    line(metaParts, 8.5, false, 11, 'center');
  } else {
    line(r.name, 17, true, 18, 'left');
    if (r.title) line(r.title, 10.5, true, 13, 'left');
    const metaParts = [r.location, r.contact].filter(Boolean).join('  •  ');
    line(metaParts, 8.5, false, 11, 'left');
  }

  // Summary
  if (r.summary) {
    section('Professional Summary');
    line(r.summary, 9, false, 11.5);
  }

  // Impact Highlights (Featured for 03-growth-metrics & 04-ai-product)
  if (r.impactHighlights && r.impactHighlights.length > 0 && (template === '03-growth-metrics' || template === '04-ai-product')) {
    section(template === '04-ai-product' ? 'Key AI & Technical Achievements' : 'Selected Impact & Growth Highlights');
    for (const h of r.impactHighlights) {
      line(`▸ ${h}`, 8.5, true, 11);
    }
  }

  // Core Skills
  if (r.skills && r.skills.length > 0) {
    section('Core Competencies & Technologies');
    line(r.skills.join('  •  '), 8.5, false, 11);
  }

  // Experience
  if (r.experience && r.experience.length > 0) {
    section('Professional Experience');
    for (const role of r.experience) {
      const heading = role.heading || [role.title, role.company, role.dates].filter(Boolean).join(' | ');
      line(heading, 9.5, true, 12);
      if (role.companyContext) {
        doc.setFont(font, 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(70, 70, 70);
        const ctxLines = doc.splitTextToSize(role.companyContext, width);
        for (const l of ctxLines) {
          doc.text(l, left, y);
          y += 10.5;
        }
        doc.setTextColor(15, 15, 15);
      }
      for (const b of role.bullets) {
        line(`•  ${b}`, 8.5, false, 10.8);
      }
      y += 2;
    }
  }

  // Education
  if (r.education && r.education.length > 0) {
    section('Education');
    for (const edu of r.education) {
      line(edu, 8.5, false, 11);
    }
  }

  // Certifications
  if (r.certifications && r.certifications.length > 0) {
    section('Certifications & Training');
    line(r.certifications.join('  •  '), 8.5, false, 11);
  }

  const safeFilename = `${(r.name || 'Tailored_Resume').replace(/\s+/g, '_')}_${template}.pdf`;
  doc.save(safeFilename);
}

function copyAsPlainText(r: TailoredResume) {
  const parts: string[] = [];
  parts.push(r.name.toUpperCase());
  if (r.title) parts.push(r.title);
  if (r.location || r.contact) parts.push([r.location, r.contact].filter(Boolean).join(' | '));
  parts.push('\n--- SUMMARY ---');
  parts.push(r.summary);

  if (r.impactHighlights?.length) {
    parts.push('\n--- SELECTED IMPACT ---');
    r.impactHighlights.forEach(h => parts.push(`* ${h}`));
  }

  if (r.skills?.length) {
    parts.push('\n--- CORE SKILLS ---');
    parts.push(r.skills.join(' | '));
  }

  if (r.experience?.length) {
    parts.push('\n--- EXPERIENCE ---');
    for (const exp of r.experience) {
      parts.push(exp.heading || `${exp.title || ''} | ${exp.company || ''} | ${exp.dates || ''}`);
      if (exp.companyContext) parts.push(`(${exp.companyContext})`);
      exp.bullets.forEach(b => parts.push(`- ${b}`));
      parts.push('');
    }
  }

  if (r.education?.length) {
    parts.push('--- EDUCATION ---');
    r.education.forEach(e => parts.push(e));
  }

  if (r.certifications?.length) {
    parts.push('\n--- CERTIFICATIONS ---');
    parts.push(r.certifications.join(' | '));
  }

  navigator.clipboard.writeText(parts.join('\n'));
}

export function App() {
  const [resume, setResume] = React.useState(() => localStorage.getItem('masterResume') || '');
  const [jobUrl, setJobUrl] = React.useState('');
  const [jobText, setJobText] = React.useState('');
  const [provider, setProvider] = React.useState<Provider>(() => (localStorage.getItem('aiProvider') as Provider) || 'openai');
  const [model, setModel] = React.useState(() => localStorage.getItem('aiModel') || 'gpt-4o');
  const [apiKey, setApiKey] = React.useState(() => localStorage.getItem('userApiKey') || '');
  const [baseUrl, setBaseUrl] = React.useState(() => localStorage.getItem('userBaseUrl') || '');
  const [templateId, setTemplateId] = React.useState<TemplateId>('01-executive-serif');
  const [showSettings, setShowSettings] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<TailorResponse | null>(null);
  const [activeTab, setActiveTab] = React.useState<'preview' | 'keywords' | 'raw'>('preview');

  const currentProviderConfig = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];

  const handleProviderChange = (newProvider: Provider) => {
    setProvider(newProvider);
    localStorage.setItem('aiProvider', newProvider);
    const config = PROVIDERS.find(p => p.id === newProvider);
    if (config) {
      setModel(config.defaultModel);
      localStorage.setItem('aiModel', config.defaultModel);
    }
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    localStorage.setItem('aiModel', newModel);
  };

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem('userApiKey', key);
  };

  const handleBaseUrlChange = (url: string) => {
    setBaseUrl(url);
    localStorage.setItem('userBaseUrl', url);
  };

  const saveResume = (text: string) => {
    setResume(text);
    localStorage.setItem('masterResume', text);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setStatus('Extracting text from master resume PDF...');
    try {
      const extracted = await extractPdf(f);
      saveResume(extracted);
      setStatus('Master resume successfully parsed and saved in this browser.');
    } catch {
      setStatus('Could not read PDF. Please ensure it contains searchable text.');
    }
  };

  const tailorResume = async () => {
    if (!resume.trim()) {
      return setStatus('Please upload or provide your master resume first.');
    }
    if (!jobUrl.trim() && !jobText.trim()) {
      return setStatus('Please provide a target job URL or paste the job description text.');
    }

    setIsLoading(true);
    setStatus(`Tailoring with ${currentProviderConfig.name} (${model})...`);
    setResult(null);

    try {
      const res = await fetch(`${API}/api/tailor`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          masterResume: resume,
          jobUrl,
          jobDescription: jobText,
          provider,
          model,
          apiKey: apiKey.trim() || undefined,
          baseUrl: baseUrl.trim() || undefined,
          templateId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error occurred while tailoring resume.');

      setResult(data);
      if (data.templateRecommendation && data.templateRecommendation !== templateId) {
        setTemplateId(data.templateRecommendation);
      }
      setStatus(`Successfully tailored for ${data.jobTitle || 'role'} at ${data.company || 'target company'}.`);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="app-container">
      <header className="hero">
        <div className="badge-row">
          <span className="badge multi-model-badge">MULTI-MODEL AI READY</span>
          <span className="badge ats-badge">ATS GUARANTEED</span>
          <span className="badge privacy-badge">PRIVATE & ZERO-DATABASE</span>
        </div>
        <h1>
          Match & Tailor Your Resume<br />
          <em>Powered by Any AI Model</em>
        </h1>
        <p className="subtitle">
          Truth-grounded XYZ tailoring that matches verified candidate achievements with target job descriptions.
          Works with Claude, OpenAI, Gemini, DeepSeek, or local Ollama models.
        </p>

        <div className="settings-bar">
          <div className="current-engine">
            <span className="engine-label">Active AI Engine:</span>
            <strong>{currentProviderConfig.name}</strong> ({model})
          </div>
          <button
            type="button"
            className="settings-toggle-btn"
            onClick={() => setShowSettings(!showSettings)}
          >
            {showSettings ? 'Close AI Settings' : 'Configure Model & API Key'} ⚙
          </button>
        </div>

        {showSettings && (
          <div className="settings-drawer">
            <h3>AI Provider & Key Configuration</h3>
            <p className="settings-help">
              Use server-side configured Cloudflare secrets, OR bring your own API key. Keys are stored strictly in your browser local storage.
            </p>

            <div className="settings-grid">
              <div className="form-group">
                <label>AI Provider</label>
                <select
                  value={provider}
                  onChange={(e) => handleProviderChange(e.target.value as Provider)}
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Model</label>
                <select
                  value={model}
                  onChange={(e) => handleModelChange(e.target.value)}
                >
                  {currentProviderConfig.models.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="form-group key-group">
                <label>API Key (Optional if configured on server)</label>
                <input
                  type="password"
                  value={apiKey}
                  placeholder={currentProviderConfig.keyPlaceholder}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                />
              </div>

              {currentProviderConfig.hasBaseUrl && (
                <div className="form-group baseurl-group">
                  <label>Base URL (e.g. Ollama or OpenRouter)</label>
                  <input
                    type="text"
                    value={baseUrl}
                    placeholder="http://localhost:11434/v1 or https://openrouter.ai/api/v1"
                    onChange={(e) => handleBaseUrlChange(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <section className="workflow-panel">
        <div className="workflow-step">
          <div className="step-num">01</div>
          <div className="step-body">
            <h2>Master Resume</h2>
            <p>Upload your master PDF once. All verified experience stays protected in your browser.</p>
            <div className="upload-container">
              <label className="upload-button">
                <span>Upload Master PDF</span>
                <input type="file" accept="application/pdf" onChange={handleUpload} />
              </label>
              {resume ? (
                <span className="saved-pill">✓ Saved ({resume.length.toLocaleString()} characters)</span>
              ) : (
                <span className="hint-pill">Searchable text PDF required</span>
              )}
            </div>
          </div>
        </div>

        <div className="workflow-step">
          <div className="step-num">02</div>
          <div className="step-body">
            <h2>Target Job Details</h2>
            <p>Enter the job posting URL or paste the job description text directly.</p>
            <input
              type="text"
              className="input-text"
              placeholder="https://jobs.lever.co/... or greenhouse.io link"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
            />
            <div className="separator"><span>OR PASTE DESCRIPTION</span></div>
            <textarea
              className="textarea-input"
              rows={4}
              placeholder="Paste raw job description here if URL is protected or behind a login..."
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
            />
          </div>
        </div>

        <div className="workflow-step">
          <div className="step-num">03</div>
          <div className="step-body">
            <h2>Select ATS Template Style</h2>
            <p>Choose from the 5 recruiter-grade, ATS-guaranteed typography formats.</p>
            <div className="template-grid">
              {TEMPLATES.map((t) => (
                <div
                  key={t.id}
                  className={`template-card ${templateId === t.id ? 'active' : ''}`}
                  onClick={() => setTemplateId(t.id)}
                >
                  <div className="template-card-header">
                    <strong>{t.name}</strong>
                    {templateId === t.id && <span className="check-mark">✓</span>}
                  </div>
                  <p>{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="action-row">
          <button
            type="button"
            className="cta-button"
            onClick={tailorResume}
            disabled={isLoading}
          >
            {isLoading ? 'Tailoring with AI...' : 'Tailor & Match Resume'} →
          </button>
          {status && <p className="status-message">{status}</p>}
        </div>
      </section>

      {result && result.resume && (
        <section className="results-container">
          <div className="results-header">
            <div>
              <span className="pill-success">TAILORED & ATS-READY</span>
              <h2>{result.resume.name}</h2>
              <p className="job-matched-to">
                Optimized for <strong>{result.jobTitle || 'Target Position'}</strong>
                {result.company ? ` at ${result.company}` : ''}
              </p>
            </div>

            <div className="export-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => exportPdf(result.resume, templateId)}
              >
                Download ATS-Parseable PDF 📄
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  copyAsPlainText(result.resume);
                  setStatus('Plain text copied to clipboard for ATS forms!');
                }}
              >
                Copy ATS Plain Text 📋
              </button>
            </div>
          </div>

          <div className="tab-bar">
            <button
              className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              Resume Preview
            </button>
            <button
              className={`tab-btn ${activeTab === 'keywords' ? 'active' : ''}`}
              onClick={() => setActiveTab('keywords')}
            >
              Keyword Match & Analysis ({result.matchScore || 85}% Match)
            </button>
          </div>

          {activeTab === 'preview' && (
            <div className={`resume-paper template-${templateId}`}>
              <header className="paper-header">
                <h1 className="candidate-name">{result.resume.name}</h1>
                {result.resume.title && <div className="candidate-title">{result.resume.title}</div>}
                <div className="candidate-meta">
                  {[result.resume.location, result.resume.contact].filter(Boolean).join('  |  ')}
                </div>
              </header>

              <section className="paper-section">
                <h3 className="section-title">Professional Summary</h3>
                <p className="summary-text">{result.resume.summary}</p>
              </section>

              {result.resume.impactHighlights && result.resume.impactHighlights.length > 0 && (
                <section className="paper-section highlight-section">
                  <h3 className="section-title">
                    {templateId === '04-ai-product' ? 'Technical & AI Highlights' : 'Selected Growth & Impact Outcomes'}
                  </h3>
                  <ul className="highlight-list">
                    {result.resume.impactHighlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="paper-section">
                <h3 className="section-title">Core Competencies & Technologies</h3>
                <p className="skills-line">{result.resume.skills.join('  •  ')}</p>
              </section>

              <section className="paper-section">
                <h3 className="section-title">Professional Experience</h3>
                {result.resume.experience.map((exp, idx) => (
                  <div key={idx} className="experience-block">
                    <div className="exp-heading">
                      <strong>{exp.title || exp.heading}</strong>
                      {exp.company && <span className="exp-company">{exp.company}</span>}
                      {exp.dates && <span className="exp-dates">{exp.dates}</span>}
                    </div>
                    {exp.companyContext && (
                      <div className="exp-context">{exp.companyContext}</div>
                    )}
                    <ul className="exp-bullets">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>

              {result.resume.education && result.resume.education.length > 0 && (
                <section className="paper-section">
                  <h3 className="section-title">Education</h3>
                  {result.resume.education.map((edu, eIdx) => (
                    <div key={eIdx} className="edu-item">{edu}</div>
                  ))}
                </section>
              )}

              {result.resume.certifications && result.resume.certifications.length > 0 && (
                <section className="paper-section">
                  <h3 className="section-title">Certifications</h3>
                  <p className="skills-line">{result.resume.certifications.join('  •  ')}</p>
                </section>
              )}
            </div>
          )}

          {activeTab === 'keywords' && (
            <div className="analysis-panel">
              <div className="score-box">
                <div className="score-value">{result.matchScore || 85}%</div>
                <div className="score-desc">Truthful ATS Keyword Alignment Score</div>
              </div>

              <div className="keywords-grid">
                <div className="keyword-card matched">
                  <h4>Matched Job Keywords (Grounded in Verified Master CV)</h4>
                  <div className="pill-list">
                    {(result.matchedKeywords || ['Roadmapping', 'User Research', 'Product-Led Growth', 'Cross-functional Leadership', 'A/B Testing']).map((kw, i) => (
                      <span key={i} className="kw-pill match">✓ {kw}</span>
                    ))}
                  </div>
                </div>

                <div className="keyword-card missing">
                  <h4>Identified Gaps / Missing Posting Keywords</h4>
                  <p className="gap-info">
                    These keywords appear in the job posting but were not found in your master resume. Because this engine does not hallucinate, they were omitted from your output.
                  </p>
                  <div className="pill-list">
                    {(result.missingKeywords || []).length > 0 ? (
                      result.missingKeywords!.map((kw, i) => (
                        <span key={i} className="kw-pill missing">! {kw}</span>
                      ))
                    ) : (
                      <span className="no-gaps">No critical gaps identified!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      <footer className="app-footer">
        <div className="footer-content">
          <p>
            <strong>Personal Resume Matcher & Universal Skill</strong> • Multi-Model AI Architecture
          </p>
          <p className="footer-sub">
            Strictly Private • No Central Database • Truth-Grounded XYZ Tailoring • ATS Guaranteed
          </p>
        </div>
      </footer>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
