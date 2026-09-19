import fs from 'node:fs';
import path from 'node:path';

function formatDate(date = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}_${hh}-${min}`;
}

function formatHumanDate(date = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function cleanTagString(tag) {
  if (!tag) return '';
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/gi, '-')
    .replace(/-+/g, '-');
}

export function resolveDocDirs(projectDir) {
  let docsDir = path.join(projectDir, 'documentacion');
  if (!fs.existsSync(docsDir) && fs.existsSync(path.join(projectDir, 'docs'))) {
    docsDir = path.join(projectDir, 'docs');
  }

  const cuerpoDir = path.join(docsDir, 'cuerpo');
  
  let figuresDir = path.join(docsDir, 'figuras');
  if (!fs.existsSync(figuresDir) && fs.existsSync(path.join(docsDir, 'figures'))) {
    figuresDir = path.join(docsDir, 'figures');
  }

  const anexosDir = path.join(docsDir, 'anexos');

  let bibFile = path.join(docsDir, 'referencias.bib');
  if (!fs.existsSync(bibFile) && fs.existsSync(path.join(docsDir, 'references.bib'))) {
    bibFile = path.join(docsDir, 'references.bib');
  }

  const outDir = path.join(projectDir, 'PDF-documentacion');

  return {
    docsDir,
    cuerpoDir,
    figuresDir,
    anexosDir,
    bibFile,
    outDir
  };
}

export function resolveSlidesDirs(projectDir) {
  let slidesDir = path.join(projectDir, 'presentacion');
  if (!fs.existsSync(slidesDir) && fs.existsSync(path.join(projectDir, 'slides'))) {
    slidesDir = path.join(projectDir, 'slides');
  }

  let inputFile = path.join(slidesDir, 'presentacion.md');
  if (!fs.existsSync(inputFile) && fs.existsSync(path.join(slidesDir, 'diapositivas.md'))) {
    inputFile = path.join(slidesDir, 'diapositivas.md');
  }

  let assetsDir = path.join(slidesDir, 'recursos');
  if (!fs.existsSync(assetsDir) && fs.existsSync(path.join(slidesDir, 'assets'))) {
    assetsDir = path.join(slidesDir, 'assets');
  }

  const outDir = path.join(projectDir, 'PDF-presentacion');

  return {
    slidesDir,
    inputFile,
    assetsDir,
    outDir
  };
}

export function saveVersionedOutput(outDir, baseName, tempFilePath, ext, options = {}) {
  fs.mkdirSync(outDir, { recursive: true });

  const existingFiles = fs.readdirSync(outDir);
  const vRegex = new RegExp(`^${baseName}_v(\\d+)`, 'i');

  let maxVersion = 0;
  for (const file of existingFiles) {
    const match = file.match(vRegex);
    if (match) {
      const vNum = parseInt(match[1], 10);
      if (vNum > maxVersion) maxVersion = vNum;
    }
  }

  const nextVersion = maxVersion + 1;
  const now = new Date();
  const dateStamp = formatDate(now);
  const tagStr = options.tag ? `_${cleanTagString(options.tag)}` : '';

  // Main versioned file: BaseName_v1_2026-09-19_10-45_avance.pdf
  const versionedFileName = `${baseName}_v${nextVersion}_${dateStamp}${tagStr}.${ext}`;
  const versionedPath = path.join(outDir, versionedFileName);

  // Copy to versioned path (never overwriting old files)
  fs.copyFileSync(tempFilePath, versionedPath);

  // Also create/update the "LATEST" or "ACTUAL" pointer file
  const latestFileName = `${baseName}_ACTUAL.${ext}`;
  const latestPath = path.join(outDir, latestFileName);
  fs.copyFileSync(tempFilePath, latestPath);

  // Stats
  const stat = fs.statSync(versionedPath);
  const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
  const sizeStr = stat.size > 1024 * 1024 ? `${sizeMb} MB` : `${(stat.size / 1024).toFixed(0)} KB`;

  // Update or create HISTORIAL.md
  updateHistoryLog(outDir, {
    version: `v${nextVersion}`,
    fileName: versionedFileName,
    date: formatHumanDate(now),
    size: sizeStr,
    note: options.tag || options.note || (nextVersion === 1 ? 'Versión inicial' : 'Actualización de contenido')
  });

  return {
    versionedPath,
    versionedFileName,
    latestPath,
    latestFileName,
    version: `v${nextVersion}`,
    sizeStr
  };
}

function updateHistoryLog(outDir, entry) {
  const historyPath = path.join(outDir, 'HISTORIAL.md');
  const isNew = !fs.existsSync(historyPath);

  let content = '';
  if (isNew) {
    const dirName = path.basename(outDir);
    content += `# 📜 Control de Versiones y Registro de Avances (${dirName})\n\n`;
    content += `Este directorio almacena el historial cronológico de entregables generados con **m-docflow**.\n`;
    content += `Ninguna versión anterior se sobrescribe. El archivo con sufijo \`_ACTUAL\` siempre contiene la versión más reciente para subir a Blackboard o entregar.\n\n`;
    content += `| Versión | Archivo Entregable | Fecha y Hora | Tamaño | Etiqueta / Avance |\n`;
    content += `| :--- | :--- | :--- | :--- | :--- |\n`;
  } else {
    content = fs.readFileSync(historyPath, 'utf8');
  }

  const row = `| **${entry.version}** | [\`${entry.fileName}\`](./${entry.fileName}) | ${entry.date} | ${entry.size} | ${entry.note} |\n`;
  content += row;

  fs.writeFileSync(historyPath, content, 'utf8');
}
