import fs from 'node:fs';
import path from 'node:path';
import { getPreset } from './presets.js';
import { CONFIG_FILE_NAME, saveConfig } from './config.js';

export function initProject(targetDir, options = {}) {
  const absTarget = path.resolve(targetDir);
  const presetId = options.preset || 'upsjb';
  const preset = getPreset(presetId);

  const projectName = options.name || path.basename(absTarget).toLowerCase().replace(/\s+/g, '-');
  const courseName = options.course || options.title || path.basename(absTarget);

  console.log(`\x1b[36m[m-docflow]\x1b[0m Inicializando proyecto en: \x1b[32m${absTarget}\x1b[0m`);
  console.log(`  \x1b[90mPreset seleccionado: ${preset.name} (${preset.id})\x1b[0m`);

  // Ensure target directories exist
  const dirsToCreate = [
    'documentacion/cuerpo',
    'documentacion/figuras',
    'documentacion/anexos',
    'presentacion/assets',
    'codigo',
    'materiales/articulos',
    'materiales/normativas_guias',
    'materiales/datos_insumos',
    'PDF-documentacion',
    'PDF-presentacion'
  ];

  for (const d of dirsToCreate) {
    fs.mkdirSync(path.join(absTarget, d), { recursive: true });
    const gitkeep = path.join(absTarget, d, '.gitkeep');
    if (!fs.existsSync(gitkeep) && (d.includes('assets') || d.includes('figuras') || d.includes('materiales') || d === 'codigo' || d.startsWith('PDF-'))) {
      fs.writeFileSync(gitkeep, '', 'utf8');
    }
  }

  // Create m-project.json
  const config = {
    "$schema": "https://raw.githubusercontent.com/marlon-mte/m-docflow/main/schema/v1.json",
    "project": projectName,
    "preset": presetId,
    "type": options.type || "lrpd",
    "metadata": {
      "titulotrabajo": options.title || `Proyecto de Investigación: ${courseName}`,
      "titulocorto": courseName,
      "curso": courseName,
      "tipotrabajo": options.type?.toUpperCase() || "PRODUCTO FORMATIVO / INFORME FINAL",
      "autor": options.author || "Torres Espinoza, Marlon Omar",
      "docente": options.docente || "Mg. Nombre del Docente",
      "ciudadpais": "CHINCHA -- PERÚ",
      "anio": new Date().getFullYear().toString(),
      "ciclo": "VII"
    }
  };

  saveConfig(absTarget, config);

  // Starter LaTeX body chapters if documentacion/cuerpo is empty
  const cuerpoDir = path.join(absTarget, 'documentacion', 'cuerpo');
  const existingTex = fs.readdirSync(cuerpoDir).filter(f => f.endsWith('.tex'));
  if (existingTex.length === 0) {
    fs.writeFileSync(
      path.join(cuerpoDir, '00_introduccion.tex'),
      `\\section{Introducción}\n\nEste documento presenta el desarrollo del informe correspondiente a la asignatura de \\curso, bajo la orientación del docente \\docente.\n`,
      'utf8'
    );
    fs.writeFileSync(
      path.join(cuerpoDir, '01_planteamiento.tex'),
      `\\section{Planteamiento del Problema}\n\n\\subsection{Descripción de la Realidad Problemática}\nDescribe aquí la problemática detectada en la institución o caso de estudio.\n\n\\subsection{Objetivos}\n\\subsubsection{Objetivo General}\nDesarrollar una solución integral...\n\n\\subsubsection{Objetivos Específicos}\n\\begin{itemize}\n  \\item Analizar los requerimientos funcionales y no funcionales.\n  \\item Diseñar la arquitectura técnica de la solución.\n  \\item Validar los resultados mediante métricas e indicadores de calidad.\n\\end{itemize}\n`,
      'utf8'
    );
    fs.writeFileSync(
      path.join(cuerpoDir, '02_marco_teorico.tex'),
      `\\section{Marco Teórico}\n\n\\subsection{Antecedentes de la Investigación}\nSintetiza aquí los antecedentes relevantes identificados en la literatura científica.\n`,
      'utf8'
    );
    fs.writeFileSync(
      path.join(cuerpoDir, '03_conclusiones.tex'),
      `\\section{Conclusiones y Recomendaciones}\n\n\\subsection{Conclusiones}\n\\begin{enumerate}\n  \\item Se concluye que la implementación del marco de trabajo optimiza los tiempos de desarrollo.\n\\end{enumerate}\n\n\\subsection{Recomendaciones}\n\\begin{enumerate}\n  \\item Mantener la modularidad entre la documentación y el código fuente.\n\\end{enumerate}\n`,
      'utf8'
    );
  }

  // Starter referencias.bib if missing
  const bibFile = path.join(absTarget, 'documentacion', 'referencias.bib');
  if (!fs.existsSync(bibFile)) {
    fs.writeFileSync(
      bibFile,
      `% Bibliografía del proyecto ${projectName}\n% Agrega citas con: m-docflow cite "<DOI>"\n\n`,
      'utf8'
    );
  }

  // Starter anexos
  const anexoFile = path.join(absTarget, 'documentacion', 'anexos', '01_anexo.tex');
  if (!fs.existsSync(anexoFile)) {
    fs.writeFileSync(
      anexoFile,
      `\\section*{Anexos}\n\\addcontentsline{toc}{section}{Anexos}\n\n\\subsection*{Anexo 1: Evidencias y Capturas}\nDocumentación complementaria del proyecto.\n`,
      'utf8'
    );
  }

  // Starter presentacion/presentacion.md
  const slidesFile = path.join(absTarget, 'presentacion', 'presentacion.md');
  if (!fs.existsSync(slidesFile)) {
    const themeName = preset.marp?.themeName || 'default';
    fs.writeFileSync(
      slidesFile,
      `---
marp: true
theme: ${themeName}
paginate: true
header: '${courseName} | ${config.metadata.anio}'
footer: 'Marlon Omar Torres Espinoza — UPSJB'
---

<!-- _class: portada -->

# ${config.metadata.titulotrabajo}
### ${config.metadata.tipotrabajo}

**Autor:** ${config.metadata.autor}  
**Docente:** ${config.metadata.docente}  
**Curso:** ${courseName}  

---

# 1. Planteamiento del Problema

### Contexto y Necesidad
- Desafío principal identificado en la organización.
- Impacto operativo y limitación de las soluciones tradicionales.
- Justificación del desarrollo e implementación técnica.

---

# 2. Arquitectura de la Solución

### Componentes Clave
1. **Módulo de Ingesta:** Captura y validación de datos.
2. **Capa de Procesamiento:** Servicios desacoplados y resilientes.
3. **Interfaz de Usuario / Entregables:** Monitoreo y reportabilidad.

---

<!-- _class: cierre -->

# ¡Muchas Gracias!
### Preguntas y Respuestas

**Contacto:** academic@m-docflow.local  
*Universidad Privada San Juan Bautista*
`,
      'utf8'
    );
  }

  // Course README.md
  const readmeFile = path.join(absTarget, 'README.md');
  if (!fs.existsSync(readmeFile)) {
    fs.writeFileSync(
      readmeFile,
      `# ${courseName}

> Proyecto académico estructurado con **[m-docflow](https://github.com/marlon-mte/m-docflow)**.

## 📂 Organización de Carpetas
- \`docs/\`: Contenido académico modular (LaTeX en formato APA 7ma Edición).
- \`slides/\`: Presentaciones institucionales en Markdown (Marp).
- \`src/\`: Código fuente del proyecto o prácticas (Node, Python, Docker, etc.).
- \`materiales/\`: Papers de referencia, normativas y rúbricas.
- \`dist/\`: Entregables finales compilados (PDF y PPTX).

## 🚀 Comandos Rápidos
\`\`\`bash
# Compilar documento PDF (APA 7)
m-docflow build --open

# Compilar presentación (PDF o PPTX)
m-docflow slides --pptx --open

# Agregar cita por DOI
m-docflow cite "10.1016/j.cose.2023.103200"

# Contar palabras del documento
m-docflow count
\`\`\`
`,
      'utf8'
    );
  }

  // Course .gitignore
  const gitignoreFile = path.join(absTarget, '.gitignore');
  if (!fs.existsSync(gitignoreFile)) {
    fs.writeFileSync(
      gitignoreFile,
      `# Entregables y temporales generados
dist/*.pdf
dist/*.pptx
*.synctex.gz
*.log
*.aux
*.bbl
*.blg
*.bcf
*.run.xml

# Entornos de desarrollo en src/
node_modules/
__pycache__/
*.pyc
.venv/
env/
.env
.DS_Store
Thumbs.db
`,
      'utf8'
    );
  }

  console.log(`\x1b[32m✔ Proyecto "${projectName}" inicializado con éxito.\x1b[0m`);
}
