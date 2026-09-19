import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { loadConfig } from './config.js';
import { openFile } from './marp.js';
import { resolveDocDirs, saveVersionedOutput, getCourseAcronym } from './versioning.js';

function toTexPath(p) {
  return p.replace(/\\/g, '/');
}

function escapeLatex(text) {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([&%$#_{}])/g, '\\$1')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

export function compileLatex(projectDir, options = {}) {
  const config = loadConfig(projectDir);
  const preset = config._preset;
  const projectName = config.project || path.basename(projectDir);
  const metadata = config.metadata || {};

  console.log(`\x1b[36m[m-docflow]\x1b[0m Iniciando compilación de documento con Preset [\x1b[33m${preset.id}\x1b[0m]...`);

  // Build directory in os.tmpdir() to prevent polluting OneDrive or local repo
  const buildDir = path.join(os.tmpdir(), 'm-docflow-build', projectName);
  fs.mkdirSync(buildDir, { recursive: true });

  const docDirs = resolveDocDirs(projectDir);
  const { docsDir, cuerpoDir, figuresDir, anexosDir, bibFile, outDir } = docDirs;

  // Copy references.bib to buildDir
  if (fs.existsSync(bibFile)) {
    fs.copyFileSync(bibFile, path.join(buildDir, 'references.bib'));
  } else {
    fs.writeFileSync(path.join(buildDir, 'references.bib'), '% Empty bibliography\n', 'utf8');
  }
  // Ensure figures and assets exist in buildDir so relative \includegraphics{figures/...} or \includegraphics{figuras/...} work
  try {
    const buildFigures = path.join(buildDir, 'figures');
    const buildFiguras = path.join(buildDir, 'figuras');
    if (fs.existsSync(figuresDir)) {
      if (!fs.existsSync(buildFigures)) fs.symlinkSync(figuresDir, buildFigures, 'junction');
      if (!fs.existsSync(buildFiguras)) fs.symlinkSync(figuresDir, buildFiguras, 'junction');
    }
  } catch {}

  // Also ensure docsDir has bidirectional figures/figuras compatibility
  try {
    const docFigures = path.join(docsDir, 'figures');
    const docFiguras = path.join(docsDir, 'figuras');
    if (fs.existsSync(docFiguras) && !fs.existsSync(docFigures)) {
      fs.symlinkSync(docFiguras, docFigures, 'junction');
    } else if (fs.existsSync(docFigures) && !fs.existsSync(docFiguras)) {
      fs.symlinkSync(docFigures, docFiguras, 'junction');
    }
  } catch {}

  // Determine paths from preset
  const presetBase = preset._baseDir;
  const setupFile = preset.latex?.setup ? path.join(presetBase, preset.latex.setup) : null;
  const coverFile = preset.latex?.cover ? path.join(presetBase, preset.latex.cover) : null;
  const presetAssetsDir = preset.latex?.assetsDir ? path.join(presetBase, preset.latex.assetsDir) : null;
  const presetPrelimDir = preset.latex?.preliminariesDir ? path.join(presetBase, preset.latex.preliminariesDir) : null;

  try {
    const buildAssets = path.join(buildDir, 'assets');
    if (presetAssetsDir && fs.existsSync(presetAssetsDir) && !fs.existsSync(buildAssets)) {
      fs.symlinkSync(presetAssetsDir, buildAssets, 'junction');
    }
  } catch {}

  // Build graphicspath
  const graphicsPaths = [];
  if (presetAssetsDir && fs.existsSync(presetAssetsDir)) {
    graphicsPaths.push(`{${toTexPath(presetAssetsDir)}/}`);
  }
  if (fs.existsSync(figuresDir)) {
    graphicsPaths.push(`{${toTexPath(figuresDir)}/}`);
  }
  const altFiguresDir = path.join(docsDir, 'figures');
  if (fs.existsSync(altFiguresDir) && altFiguresDir !== figuresDir) {
    graphicsPaths.push(`{${toTexPath(altFiguresDir)}/}`);
  }
  // Also project docs dir and build dir
  graphicsPaths.push(`{${toTexPath(docsDir)}/}`);
  graphicsPaths.push(`{${toTexPath(buildDir)}/}`);

  // Build main.tex content
  let tex = '\\PassOptionsToPackage{plainpages=false,pdfpagelabels=true}{hyperref}\n';
  tex += (preset.latex?.documentclass || '\\documentclass[stu,12pt,letterpaper,floatsintext]{apa7}') + '\n\n';

  // Graphics path
  tex += `% Configuración de rutas gráficas\n`;
  tex += `\\usepackage{graphicx}\n`;
  if (graphicsPaths.length > 0) {
    tex += `\\graphicspath{${graphicsPaths.join('')}}\n\n`;
  }

  // Setup preamble
  if (setupFile && fs.existsSync(setupFile)) {
    tex += `% Setup institucional del preset\n`;
    tex += `\\input{${toTexPath(setupFile)}}\n\n`;
  }

  // Metadata injection
  tex += `% Metadatos del documento inyectados por m-docflow\n`;
  const metaKeys = [
    'universidad', 'facultad', 'escuela', 'ciudadpais', 'anio', 'ciclo',
    'titulotrabajo', 'titulocorto', 'tipotrabajo', 'curso', 'docente', 'autor'
  ];

  for (const k of metaKeys) {
    const val = metadata[k] || '';
    tex += `\\providecommand{\\${k}}{${val}}\n`;
    tex += `\\renewcommand{\\${k}}{${val}}\n`;
  }

  // Format student items (supporting single author or team array)
  let estudiantesTex = '';
  let autorVal = metadata.autor || metadata.author || '';

  if (Array.isArray(metadata.estudiantes) && metadata.estudiantes.length > 0) {
    estudiantesTex = metadata.estudiantes.map(e => `\\item ${e.replace(/\.?$/, '.')}`).join('\n  ');
    if (!autorVal) {
      if (metadata.estudiantes.length === 1) {
        autorVal = metadata.estudiantes[0];
      } else {
        const allButLast = metadata.estudiantes.slice(0, -1).join(', ');
        autorVal = `${allButLast} y ${metadata.estudiantes[metadata.estudiantes.length - 1]}`;
      }
    }
  } else if (typeof metadata.estudiantes === 'string' && metadata.estudiantes.trim()) {
    estudiantesTex = metadata.estudiantes.trim();
  } else {
    autorVal = autorVal || 'Torres Espinoza, Marlon Omar';
    estudiantesTex = `\\item ${autorVal}.`;
  }

  tex += `\\providecommand{\\estudiantes}{\n  ${estudiantesTex}\n}\n`;
  tex += `\\renewcommand{\\estudiantes}{\n  ${estudiantesTex}\n}\n\n`;

  // APA 7 title definitions (only if class is apa7)
  if (!preset.latex?.documentclass || preset.latex.documentclass.includes('apa7')) {
    tex += `\\title{${metadata.titulotrabajo || 'Sin Título'}}\n`;
    tex += `\\shorttitle{${metadata.titulocorto || metadata.titulotrabajo || ''}}\n`;
    tex += `\\author{${autorVal}}\n`;
    tex += `\\affiliation{${metadata.facultad || ''}, ${metadata.universidad || ''}}\n`;
    tex += `\\course{${metadata.curso || ''}}\n`;
    tex += `\\professor{${metadata.docente || ''}}\n\n`;
  }

  // Preliminaries switches (UPSJB & UNICA compatible)
  tex += `% Interruptores de estructura preliminar\n`;
  const switches = [
    'mostrarresponsables', 'mostrarportadilla', 'mostraragradecimiento',
    'mostrardedicatoria', 'mostrarresumen', 'mostrarabstract',
    'mostrarindices', 'mostrarindice', 'mostrarlistatablas', 'mostrarlistafiguras', 'mostraranexos'
  ];
  for (const sw of switches) {
    const isTrue = metadata[sw] !== false;
    tex += `\\newif\\if${sw}   \\${sw}${isTrue ? 'true' : 'false'}\n`;
  }
  tex += '\n';

  // Document start
  tex += `\\begin{document}\n\n`;

  // Cover
  if (coverFile && fs.existsSync(coverFile)) {
    tex += `% Carátula oficial\n\\input{${toTexPath(coverFile)}}\n\n`;
  }

  // Preliminaries: check local docs/preliminares or preset
  const prelimFiles = new Set();
  const localPrelimDir = path.join(docsDir, 'preliminares');
  if (fs.existsSync(localPrelimDir)) {
    fs.readdirSync(localPrelimDir)
      .filter(f => f.endsWith('.tex'))
      .forEach(f => prelimFiles.add(f));
  }
  if (presetPrelimDir && fs.existsSync(presetPrelimDir)) {
    fs.readdirSync(presetPrelimDir)
      .filter(f => f.endsWith('.tex'))
      .forEach(f => prelimFiles.add(f));
  }

  if (prelimFiles.size > 0) {
    const sortedPrelims = Array.from(prelimFiles).sort();
    for (const pf of sortedPrelims) {
      const localPf = path.join(localPrelimDir, pf);
      const targetPf = fs.existsSync(localPf) ? localPf : path.join(presetPrelimDir, pf);
      if (fs.existsSync(targetPf)) {
        tex += `\\input{${toTexPath(targetPf)}}\n`;
      }
    }
    tex += '\n';
  }

  // Body chapters (cuerpo)
  tex += `% Cuerpo del documento (Capítulos)\n`;
  tex += `\\clearpage\n\\edef\\temppagenum{\\the\\value{page}}\n\\pagenumbering{arabic}\n\\setcounter{page}{\\temppagenum}\n\n`;

  const bodyStyle = preset.latex?.bodyStyle || 'apa';
  if (bodyStyle === 'apa') {
    tex += `% Estilo continuo de encabezado para el cuerpo del trabajo (APA)\n`;
    tex += `\\fancypagestyle{estilocuerpo}{\n  \\fancyhf{}\n  \\fancyhead[L]{\\small \\textit{\\titulocorto}}\n  \\fancyhead[R]{\\normalsize \\thepage}\n  \\renewcommand{\\headrulewidth}{0.4pt}\n  \\renewcommand{\\footrulewidth}{0pt}\n}\n\\pagestyle{estilocuerpo}\n`;
  }
  const spacingCmd = preset.latex?.spacing || (bodyStyle === 'apa' ? '\\doublespacing' : '\\onehalfspacing');
  tex += `${spacingCmd}\n\n`;

  if (fs.existsSync(cuerpoDir)) {
    const chapters = fs.readdirSync(cuerpoDir)
      .filter(f => f.endsWith('.tex'))
      .sort();

    for (const chap of chapters) {
      const chapPath = path.join(cuerpoDir, chap);
      tex += `\\input{${toTexPath(chapPath)}}\n`;
    }
  }

  // Bibliography
  if (preset.latex?.bibHeading) {
    const heading = preset.latex.bibHeading;
    tex += `\n% Bibliografía\n\\newpage\n\\begin{center}\n  {\\fontsize{10pt}{13pt}\\selectfont \\textbf{${heading.toUpperCase()}}}\n\\end{center}\n\\vspace{0.4cm}\n\\addcontentsline{toc}{section}{${heading}}\n\n\\nocite{*}\n\\printbibliography[heading=none]\n\n`;
  } else {
    tex += `\n% Bibliografía\n\\newpage\n\\printbibliography\n\n`;
  }

  // Anexos if present
  if (fs.existsSync(anexosDir)) {
    const anexos = fs.readdirSync(anexosDir)
      .filter(f => f.endsWith('.tex'))
      .sort();
    for (const anx of anexos) {
      tex += `\\input{${toTexPath(path.join(anexosDir, anx))}}\n`;
    }
  }

  tex += `\n\\end{document}\n`;

  const mainTexPath = path.join(buildDir, 'main.tex');
  fs.writeFileSync(mainTexPath, tex, 'utf8');

  console.log(`  \x1b[90mCache de compilación: ${buildDir}\x1b[0m`);
  console.log(`  \x1b[90mEjecutando latexmk (Biber + PDFLaTeX)... \x1b[0m`);

  const latexmkArgs = [
    '-pdf',
    '-synctex=1',
    '-interaction=nonstopmode',
    `-outdir="${buildDir}"`,
    `"${mainTexPath}"`
  ];

  const result = spawnSync('latexmk', latexmkArgs, {
    cwd: buildDir,
    stdio: 'pipe',
    encoding: 'utf8',
    shell: true
  });

  const generatedPdf = path.join(buildDir, 'main.pdf');

  if (!fs.existsSync(generatedPdf) || result.status !== 0) {
    console.error('\x1b[31m✖ Error durante la compilación de LaTeX:\x1b[0m');
    const logPath = path.join(buildDir, 'main.log');
    if (fs.existsSync(logPath)) {
      const logContent = fs.readFileSync(logPath, 'utf8');
      const errorLines = logContent
        .split('\n')
        .filter(l => l.startsWith('!') || l.includes('Error:'))
        .slice(0, 10);
      console.error(errorLines.join('\n'));
    }
    if (result.stderr) {
      console.error(result.stderr.slice(-1000));
    }
    throw new Error(`Fallo de compilación con código ${result.status}. Revisa los errores arriba.`);
  }

  // BasePrefix con Tipo + Siglas (ej: LRPD-CN)
  const docType = (config.type || 'lrpd').toUpperCase();
  const siglas = config.siglas || config.metadata?.siglas || getCourseAcronym(config.metadata?.curso || projectName);
  const basePrefix = `${docType}-${siglas}`;

  // Guardar entregable versionado en PDF-documentacion/
  const delivery = saveVersionedOutput(outDir, basePrefix, generatedPdf, 'pdf', {
    tag: options.tag,
    note: options.note
  });

  console.log(`\x1b[32m✔ Documento compilado con éxito:\x1b[0m ${delivery.versionedPath} (${delivery.sizeStr})`);
  console.log(`  \x1b[90mAcceso rápido última versión: ${delivery.latestFileName}\x1b[0m`);
  console.log(`  \x1b[90mHistorial registrado en     : ${path.join(outDir, 'HISTORIAL.md')}\x1b[0m`);

  if (options.open) {
    openFile(delivery.versionedPath);
  }

  return delivery.versionedPath;
}
