import fs from 'node:fs';
import path from 'node:path';
import { resolveDocDirs } from './versioning.js';

function stripLatexCommentsAndCommands(tex) {
  return tex
    // Remove comments
    .replace(/(^|[^\\])%.*$/gm, '$1')
    // Remove common command sequences: \command{...} -> keep inner text if helpful or drop formatting
    .replace(/\\(cite[pt]?|parencite|textcite)\{[^}]+\}/g, '')
    .replace(/\\[a-zA-Z]+\*?(\[[^\]]*\])?(\{[^}]*\})?/g, ' ')
    // Replace non-word chars with spaces
    .replace(/[{}\[\]\$\\\_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function countWordsInText(text) {
  const clean = stripLatexCommentsAndCommands(text);
  if (!clean) return 0;
  const words = clean.split(/\s+/).filter(Boolean);
  return words.length;
}

export function analyzeProjectWords(projectDir) {
  const { docsDir, cuerpoDir } = resolveDocDirs(projectDir);
  const results = {
    chapters: [],
    totalWords: 0,
    abstractWords: null,
    abstractStatus: null
  };

  if (fs.existsSync(cuerpoDir)) {
    const files = fs.readdirSync(cuerpoDir).filter(f => f.endsWith('.tex'));
    for (const file of files) {
      const filePath = path.join(cuerpoDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const count = countWordsInText(content);
      results.chapters.push({ file, count });
      results.totalWords += count;
    }
  }

  // Check abstract if exists in preliminaries or docs
  const candidateAbstracts = [
    path.join(docsDir, 'preliminares', '04_resumen.tex'),
    path.join(docsDir, '04_resumen.tex')
  ];

  for (const absPath of candidateAbstracts) {
    if (fs.existsSync(absPath)) {
      const absContent = fs.readFileSync(absPath, 'utf8');
      const count = countWordsInText(absContent);
      results.abstractWords = count;
      results.abstractStatus = count <= 250 ? 'OK' : 'EXCEDE';
      break;
    }
  }

  return results;
}
