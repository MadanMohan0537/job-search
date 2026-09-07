import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 Validating Multi-Model Resume Matcher Skill Ecosystem...\n');

// 1. Check required skill folders and files
const requiredFiles = [
  'skill/SKILL.md',
  'skill/agents/openai.yaml',
  'skill/references/tailoring-guide.md',
  'skill/references/output-contract.md',
  'skill/references/bullet-writing-formulas.md',
  'skill/references/metrics-by-archetype.md',
  'skill/references/template-specifications.md',
  'skill/references/resume-structure.md',
  'skill/references/ats-and-keywords.md',
  'skill/references/common-mistakes.md',
  'skills/universal-prompt.md',
  'skills/claude/SKILL.md',
  'skills/chatgpt/system_prompt.md',
  'skills/chatgpt/gpt_action_schema.json',
  'skills/chatgpt/README.md',
  'skills/gemini/gemini_system_instructions.md',
  'skills/gemini/README.md',
  'skills/local-llm/Modelfile',
  'skills/local-llm/system_prompt.txt',
  'skills/local-llm/README.md',
  '.cursorrules',
  '.windsurfrules',
  'AGENTS.md',
  '.agents/skills/resume-matcher/SKILL.md',
  'examples/sample-master-resume.md',
  'examples/sample-job-posting.md',
  'examples/sample-tailored-resume-executive.md',
];

let allPassed = true;

for (const relPath of requiredFiles) {
  const fullPath = path.join(rootDir, relPath);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✓ ${relPath}`);
  } else {
    console.error(`  ✗ Missing: ${relPath}`);
    allPassed = false;
  }
}

// 2. Validate ChatGPT Actions Schema
const schemaPath = path.join(rootDir, 'skills/chatgpt/gpt_action_schema.json');
try {
  const schemaContent = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  if (schemaContent.openapi && schemaContent.paths['/api/tailor']) {
    console.log('  ✓ ChatGPT OpenAPI Action schema parsed and validated successfully.');
  } else {
    console.warn('  ⚠ ChatGPT schema is missing expected endpoints.');
  }
} catch (err) {
  console.error('  ✗ Failed to parse ChatGPT schema:', err.message);
  allPassed = false;
}

// 3. Package Claude .skill archive
const tempStageDir = path.join(rootDir, 'dist-skills', 'stage', 'resume-matcher');
const tempZipFile = path.join(rootDir, 'dist-skills', 'resume-matcher.zip');
const outputSkillFile = path.join(rootDir, 'resume-matcher.skill');

try {
  fs.mkdirSync(tempStageDir, { recursive: true });
  fs.copyFileSync(path.join(rootDir, 'skill/SKILL.md'), path.join(tempStageDir, 'SKILL.md'));

  const stageRefs = path.join(tempStageDir, 'references');
  fs.mkdirSync(stageRefs, { recursive: true });
  const srcRefs = path.join(rootDir, 'skill/references');
  for (const f of fs.readdirSync(srcRefs)) {
    fs.copyFileSync(path.join(srcRefs, f), path.join(stageRefs, f));
  }

  if (fs.existsSync(tempZipFile)) fs.unlinkSync(tempZipFile);
  if (fs.existsSync(outputSkillFile)) fs.unlinkSync(outputSkillFile);

  const stageRoot = path.join(rootDir, 'dist-skills', 'stage');
  execSync(`powershell -Command "Compress-Archive -Path '${stageRoot}\\resume-matcher' -DestinationPath '${tempZipFile}' -Force"`, {
    stdio: 'inherit',
  });

  fs.renameSync(tempZipFile, outputSkillFile);
  fs.rmSync(path.join(rootDir, 'dist-skills'), { recursive: true, force: true });
  console.log(`\n📦 Packaged Claude Skill: ${outputSkillFile} (${(fs.statSync(outputSkillFile).size / 1024).toFixed(1)} KB)`);
} catch (err) {
  console.error('  ✗ Error packaging .skill archive:', err.message);
  allPassed = false;
}

if (!allPassed) {
  console.error('\n❌ Verification encountered errors.');
  process.exit(1);
} else {
  console.log('\n✅ All Multi-Model Skill validations passed successfully!');
}
