import { readFile, access } from 'node:fs/promises';

const required = ['skill/SKILL.md', 'skill/references/tailoring-guide.md', 'skill/references/output-contract.md'];
for (const path of required) await access(path);
const source = await readFile('skill/SKILL.md', 'utf8');
const frontmatter = source.match(/^---\n([\s\S]*?)\n---/);
if (!frontmatter) throw new Error('SKILL.md needs YAML frontmatter.');
if (!/^name: resume-matcher$/m.test(frontmatter[1])) throw new Error('Invalid skill name.');
if (!/^description: .+/m.test(frontmatter[1])) throw new Error('Skill description is required.');
for (const link of ['references/tailoring-guide.md', 'references/output-contract.md']) {
  if (!source.includes(`(${link})`)) throw new Error(`SKILL.md does not link ${link}.`);
}
console.log('resume-matcher skill structure is valid');
