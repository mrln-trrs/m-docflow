import fs from 'node:fs';
import path from 'node:path';

export function getCourseAcronym(courseName) {
  if (!courseName) return 'DOC';
  const trimmed = courseName.trim();
  
  // Si ya es una sigla en mayúsculas (ej: IA, ERP, BI)
  if (/^[A-Z0-9]{2,5}$/.test(trimmed)) {
    return trimmed;
  }

  const stopWords = new Set([
    'de', 'del', 'la', 'las', 'el', 'los', 'en', 'y', 'e', 'a', 'al', 'con', 'por', 'para', 'un', 'una'
  ]);

  // Quitar tildes y caracteres especiales
  const normalized = trimmed
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim();

  const words = normalized.split(/\s+/).filter(w => w && !stopWords.has(w.toLowerCase()));
  if (words.length === 0) return 'DOC';

  return words.map(w => w[0].toUpperCase()).join('');
}

export function formatTimestamp(date = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}-${mm}-${dd}-${hh}${min}${ss}`;
}

export function formatHumanDate(date = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function cleanTagString(tag) {
  if (!tag) return '';
  return tag
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9_-]/g, '');
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

export function saveVersionedOutput(outDir, basePrefix, tempFilePath, ext, options = {}) {
  fs.mkdirSync(outDir, { recursive: true });

  const now = new Date();
  const timestamp = formatTimestamp(now);
  const tagStr = options.tag ? `-${cleanTagString(options.tag)}` : '';

  // Formato estricto solicitado: TIPO-SIGLAS-AAAA-MM-DD-HHMMSS[-TAG].ext
  // Ejemplo: LRPD-CN-2026-09-19-104730.pdf
  const versionedFileName = `${basePrefix}-${timestamp}${tagStr}.${ext}`;
  const versionedPath = path.join(outDir, versionedFileName);

  // Copiar a la ruta versionada
  fs.copyFileSync(tempFilePath, versionedPath);

  // Copia de acceso rápido: TIPO-SIGLAS-ACTUAL.ext
  const latestFileName = `${basePrefix}-ACTUAL.${ext}`;
  const latestPath = path.join(outDir, latestFileName);
  fs.copyFileSync(tempFilePath, latestPath);

  // Estadísticas del archivo
  const stat = fs.statSync(versionedPath);
  const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
  const sizeStr = stat.size > 1024 * 1024 ? `${sizeMb} MB` : `${(stat.size / 1024).toFixed(0)} KB`;

  // Registrar en HISTORIAL.md
  updateHistoryLog(outDir, {
    fileName: versionedFileName,
    date: formatHumanDate(now),
    size: sizeStr,
    note: options.tag || options.note || 'Entrega registrada'
  });

  return {
    versionedPath,
    versionedFileName,
    latestPath,
    latestFileName,
    timestamp,
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
    content += `Este directorio almacena el historial cronológico de entregables generados con **m-docflow** bajo el estándar de sellado \`AAAA-MM-DD-HHMMSS\`.\n`;
    content += `Ninguna versión anterior se sobrescribe. El archivo \`...-ACTUAL\` contiene la versión más reciente para subir a Blackboard o entregar.\n\n`;
    content += `| Archivo Entregable | Fecha y Hora | Tamaño | Etiqueta / Avance |\n`;
    content += `| :--- | :--- | :--- | :--- |\n`;
  } else {
    content = fs.readFileSync(historyPath, 'utf8');
  }

  const row = `| [\`${entry.fileName}\`](./${entry.fileName}) | ${entry.date} | ${entry.size} | ${entry.note} |\n`;
  content += row;

  fs.writeFileSync(historyPath, content, 'utf8');
}
