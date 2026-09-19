import fs from 'node:fs';
import path from 'node:path';
import { resolveDocDirs } from './versioning.js';

export async function fetchBibtexByDoi(rawDoi) {
  // Clean DOI string
  let doi = rawDoi.trim();
  doi = doi.replace(/^https?:\/\/doi\.org\//i, '');
  doi = doi.replace(/^doi:\s*/i, '');

  const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}/transform/application/x-bibtex`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'm-docflow/1.0 (https://github.com/marlon-mte/m-docflow; mailto:academic@m-docflow.local)'
    }
  });

  if (!response.ok) {
    throw new Error(`Crossref respondió con código HTTP ${response.status} para el DOI: "${doi}"`);
  }

  const bibtex = await response.text();
  if (!bibtex || !bibtex.includes('@')) {
    throw new Error(`Respuesta inválida de Crossref para el DOI: "${doi}"`);
  }

  // Extract key
  const matchKey = bibtex.match(/@\w+\s*\{\s*([^,\s]+)/);
  const citationKey = matchKey ? matchKey[1] : 'nueva_cita';

  // Extract title
  const matchTitle = bibtex.match(/title\s*=\s*[\{"]([^"\}]+)[\}"]/i);
  const title = matchTitle ? matchTitle[1] : 'Sin título';

  return {
    doi,
    bibtex: bibtex.trim(),
    citationKey,
    title
  };
}

export async function addCitationToProject(projectDir, rawDoi) {
  const { bibFile } = resolveDocDirs(projectDir);
  const bibPath = bibFile;
  if (!fs.existsSync(bibPath)) {
    fs.mkdirSync(path.dirname(bibPath), { recursive: true });
    fs.writeFileSync(bibPath, '% Bibliografía del proyecto (m-docflow)\n\n', 'utf8');
  }

  const currentBib = fs.readFileSync(bibPath, 'utf8');
  const result = await fetchBibtexByDoi(rawDoi);

  if (currentBib.includes(`{${result.citationKey},`)) {
    return {
      ...result,
      alreadyExists: true
    };
  }

  const appendData = `\n% Agregado por m-docflow (DOI: ${result.doi})\n${result.bibtex}\n`;
  fs.appendFileSync(bibPath, appendData, 'utf8');

  return {
    ...result,
    alreadyExists: false
  };
}
