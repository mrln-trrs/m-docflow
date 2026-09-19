<div align="center">

# ⚡ m-docflow

**Modular Academic & Technical Documentation Engine**  
*Desacopla el desarrollo de software de la redacción académica y presentaciones institucionales.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node: >=18.0.0](https://img.shields.io/badge/Node->=18.0.0-green.svg)](https://nodejs.org/)
[![LaTeX: TeXLive](https://img.shields.io/badge/LaTeX-TeX%20Live%202026-orange.svg)](https://www.tug.org/texlive/)
[![Slides: Marp](https://img.shields.io/badge/Presentations-Marp%20CLI-pink.svg)](https://marp.app/)
[![Author: Marlon Torres](https://img.shields.io/badge/Author-Marlon%20Omar%20Torres%20Espinoza-black.svg)](https://github.com/marlon-mte)

---

</div>

## 📌 ¿Por qué nace m-docflow?

En carreras de ingeniería y tecnología, los proyectos universitarios y de investigación suelen requerir simultáneamente:
1. **Desarrollo de software real:** APIs, microservicios, bases de datos, aplicaciones móviles o scripts.
2. **Documentación formal:** Informes académicos rigurosos bajo normas APA 7ma Edición, IEEE o formatos institucionales.
3. **Presentaciones ejecutivas:** Diapositivas con identidad visual corporativa.

### El Problema Común
Tener que copiar en cada curso o repositorio decenas de scripts de compilación (`build.ps1`), tareas de VS Code, temas CSS de Marp, plantillas de carátula y configuraciones de LaTeX produce:
- **Contaminación de carpetas:** Archivos de código fuente mezclados con 15 archivos temporales de LaTeX (`.aux`, `.bbl`, `.fls`, `.log`).
- **Problemas con OneDrive / Git:** OneDrive bloquea archivos temporales y se vuelve lento sincronizando cientos de micro-archivos de compilación.
- **Sobrecarga para Agentes de IA:** Asistentes como Antigravity, Claude o Codex se confunden al ver archivos de LaTeX y presentaciones cuando solo se les pide programar.

### La Solución: m-docflow
**`m-docflow`** actúa como un **marco de trabajo exterior (Engine)**:
- Tus proyectos y cursos solo contienen **código limpio (`src/`)**, **redacción pura (`docs/`)** y **diapositivas (`slides/`)**.
- Toda la fontanería (compiladores, temas de Marp, carátulas y assets) vive centralizada en `m-docflow`.
- Compila en una memoria caché temporal aislada (`%TEMP%`) y deposita únicamente el PDF final en `dist/`.

---

## 🏛️ Sistema de Presets Multi-Institución

`m-docflow` no tiene código quemado para una sola institución. Utiliza un motor de **Presets** intercambiables:

| Preset | Institución / Estándar | Características |
| :--- | :--- | :--- |
| **`upsjb`** | **Universidad Privada San Juan Bautista** | APA 7ma Edición, Carátula institucional con logo oficial, páginas preliminares formales (portadilla, agradecimientos, dedicatoria, resúmenes, índices) y tema oficial Marp con fondos institucionales. |
| **`generic-apa7`** | **Estándar Académico Global** | Documento APA 7 neutro estudiantil/profesional + Diapositivas ejecutivas minimalistas. |
| *Comunidad* | *Extensible* | Cualquiera puede agregar su universidad (`unmsm`, `uni`, `pucp`) o formato (`ieee`). |

---

## 🚀 Instalación Rápida

### Opción A: Instalación Automática en 1 Clic (Windows)
Ejecuta en PowerShell como Administrador dentro de la carpeta del proyecto:
```powershell
.\setup.ps1
```
> El script descarga e instala automáticamente **Node.js**, **MiKTeX** (~200MB, 3 min), **Marp CLI**, extensiones de **VS Code** y registra el comando global `m-docflow`. Consulta [INSTALACION.md](INSTALACION.md) para más detalles.

### Opción B: Diagnóstico del Sistema
Para verificar si tu computadora ya cuenta con todas las herramientas necesarias:
```bash
m-docflow doctor
```

### Opción C: Instalación Manual
```bash
# 1. Clonar el repositorio
git clone https://github.com/marlon-mte/m-docflow.git
cd m-docflow

# 2. Instalar Marp CLI
npm install -g @marp-team/marp-cli

# 3. Enlazar comando global en tu sistema
npm link
```

---

## 💻 Uso de la CLI

### 1. Inicializar un nuevo curso o proyecto limpio
```bash
# Crea la estructura aislada en la carpeta actual o en una ruta específica
m-docflow init . --preset upsjb --title "Computación en la Nube" --docente "Mg. Carolyn Rojas Vargas"
```

### 2. Compilar Documento Académico (LaTeX APA 7)
Compila en caché temporal y exporta el PDF directamente a `dist/` sin generar archivos `.aux` ni `.log` en tu carpeta:
```bash
m-docflow build

# Compilar y abrir automáticamente
m-docflow build --open
```

### 3. Compilar Presentación Institucional (Marp)
Aplica automáticamente la tipografía, colores y fondos institucionales del preset configurado:
```bash
# Exportar a PDF
m-docflow slides

# Exportar a PowerPoint (.pptx) y abrirlo
m-docflow slides --pptx --open
```

### 4. Inyectar Citas Científicas por DOI (Crossref)
Consulta en tiempo real la API de Crossref y formatea automáticamente la entrada BibTeX en `docs/references.bib`:
```bash
m-docflow cite "10.1016/j.cose.2023.103200"
```

### 5. Control de Palabras y Validación de Abstract
Calcula el número de palabras por capítulo y verifica el semáforo del límite de 250 palabras del resumen:
```bash
m-docflow count
```

---

## 📁 Estructura Limpia de un Proyecto

Cualquier curso o proyecto gestionado con `m-docflow` mantiene esta organización:

```text
mi-proyecto-o-curso/
├── m-project.json         # Configuración mínima del proyecto (preset, metadatos)
│
├── docs/                  # REDACCIÓN ACADÉMICA PURA
│   ├── cuerpo/            # Capítulos modulares (00_intro.tex, 01_problema.tex, etc.)
│   ├── anexos/            # Anexos o instrumentos de recolección
│   ├── figures/           # Diagramas y capturas exclusivas del informe
│   └── references.bib     # Referencias bibliográficas
│
├── slides/                # PRESENTACIONES INSTITUCIONALES
│   ├── presentacion.md    # Markdown puro de diapositivas
│   └── assets/            # Gráficos propios de la exposición
│
├── src/                   # CÓDIGO FUENTE DE SOFTWARE (100% AISLADO)
│   ├── backend/           # Microservicios, APIs, modelos de IA, etc.
│   ├── docker-compose.yml
│   └── .gitignore
│
├── materiales/            # FUENTES DE CONSULTA (Read-only)
│   ├── articulos/         # Papers científicos en PDF
│   └── normativas_guias/  # Rúbricas y sílabos del docente
│
└── dist/                  # ENTREGABLES FINALES COMPILADOS (.pdf, .pptx)
```

---

## 🤖 Integración y Reglas para Agentes de IA

`m-docflow` está diseñado nativamente para flujos de trabajo asistidos por IA (**Antigravity**, **Claude Code**, **Codex**, **Cursor**):
- Incluye directivas en `AGENTS.md` para evitar que los modelos de lenguaje intenten crear compiladores repetidos o mezclen código en carpetas de redacción.
- Cuando una IA trabaja en código, solo interactúa con `src/`.
- Cuando una IA redacta o investiga, solo interactúa con `docs/` y `materiales/`.

---

## 🛠️ Cómo Crear un Nuevo Preset Institucional

Para agregar una nueva universidad o formato:
1. Crea una carpeta en `presets/<mi-universidad>/`.
2. Añade un archivo `preset.json`:
   ```json
   {
     "id": "mi-universidad",
     "name": "Nombre Oficial de la Institución",
     "latex": {
       "setup": "latex/setup.tex",
       "cover": "latex/cover.tex"
     },
     "marp": {
       "theme": "marp/theme.css",
       "themeName": "mi-tema"
     }
   }
   ```
3. ¡Listo! Ya puede ser invocado con `m-docflow init . --preset mi-universidad`.

---

## 👤 Autor

**Marlon Omar Torres Espinoza**  
*Estudiante de Ingeniería de Sistemas — Universidad Privada San Juan Bautista*  
* GitHub: [@marlon-mte](https://github.com/marlon-mte)  
* Proyectos: `m-core`, `m-cortex`, `m-agenda`, `m-docflow`

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.
