# Structured output contract

Use this contract when an application or API needs machine-readable output. Return JSON only and preserve empty arrays when a section has no verified content.

```json
{
  "jobTitle": "",
  "company": "",
  "resume": {
    "name": "",
    "contact": "",
    "summary": "",
    "skills": [],
    "experience": [
      { "heading": "", "bullets": [] }
    ],
    "education": [],
    "certifications": []
  },
  "match": {
    "strengths": [],
    "gaps": [],
    "assumptions": []
  }
}
```

Do not place Markdown fences around the JSON. Validate that it parses before delivery. Keep every resume claim grounded in the supplied candidate source.
