<div align="center">

# ⚡ m-docflow

**Framework Modular de Documentación Académica, Presentaciones Técnicas y Desacoplamiento de Código**  
*Desarrollado para eliminar la duplicación de plantillas, evitar el bloqueo de archivos en OneDrive y permitir un flujo ágil con o sin asistencia de agentes de Inteligencia Artificial.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node: >=18.0.0](https://img.shields.io/badge/Node->=18.0.0-green.svg)](https://nodejs.org/)
[![LaTeX: MiKTeX / TeXLive](https://img.shields.io/badge/LaTeX-MiKTeX%20%7C%20TeXLive-orange.svg)](https://miktex.org/)
[![Slides: Marp](https://img.shields.io/badge/Presentations-Marp%20CLI-pink.svg)](https://marp.app/)
[![Author: Marlon Torres](https://img.shields.io/badge/Author-Marlon%20Omar%20Torres%20Espinoza-black.svg)](https://github.com/marlon-mte)

---

</div>

## 📌 1. ¿Por qué nace m-docflow?

En carreras de ingeniería y tecnología, los cursos universitarios y proyectos de investigación demandan simultáneamente:
1. **Desarrollo de software real:** APIs, microservicios, bases de datos, código en Python, Node, Flutter o Docker.
2. **Documentación formal:** Informes académicos rigurosos bajo normas APA 7ma Edición, IEEE o formatos institucionales.
3. **Presentaciones ejecutivas:** Diapositivas con identidad visual corporativa.

### Los Dolores del Flujo Tradicional
Tener que copiar en cada curso decenas de scripts de compilación (`build.ps1`), tareas de VS Code, temas CSS de Marp, carátulas y paquetes de LaTeX produce cuatro grandes problemas:
* **Duplicación masiva (*Tooling Bloat*):** Cada curso termina con 5 scripts idénticos, carátulas repetidas y configuraciones duplicadas. Modificar un estilo implica editar 6 carpetas a mano.
* **Fricción con OneDrive y Git:** Cada compilación de LaTeX genera entre 15 y 25 micro-archivos temporales (`.aux`, `.bbl`, `.fls`, `.log`, `.synctex.gz`). OneDrive intenta sincronizarlos en tiempo real, bloqueando lecturas en Windows y saturando la nube.
* **Contaminación de contexto para Agentes de IA:** Asistentes como **Antigravity, Claude Code, Codex o Cursor** se saturan al ver código de software mezclado con miles de líneas de LaTeX y archivos de presentación.
* **Pérdida de historial de versiones:** Al compilar, se suele sobrescribir el archivo `main.pdf`, perdiendo el registro de qué cambió entre semana y semana.

### La Solución: m-docflow
**`m-docflow`** actúa como un **motor exterior desacoplado (Engine)**:
* Se clona en cualquier carpeta o disco de tu máquina y se enlaza globalmente en tu terminal.
* Tus cursos solo contienen **redacción pura (`documentacion/`)**, **código puro (`codigo/`)** y **diapositivas puras (`presentacion/`)**.
* La compilación ocurre en una memoria caché temporal aislada (`%TEMP%`), dejando **cero archivos basura en el curso**.
* Exporta entregables versionados automáticamente bajo el estándar estricto: **`TIPO-SIGLAS-AAAA-MM-DD-HHMMSS.pdf`**.

---

## ⚡ 2. Instalación Rápida en 1 Clic (Para Ti y tus Compañeros)

Diseñamos un proceso de instalación desatendido que no requiere conocimientos avanzados de terminal:

### Opción A: Doble Clic en Windows (El más rápido)
1. Clona o descarga este repositorio:
   ```bash
   git clone https://github.com/marlon-mte/m-docflow.git
   ```
2. Entra a la carpeta y haz **doble clic en `setup.bat`** (o ejecuta `.\setup.ps1` en PowerShell).

> **¿Qué hace el instalador automáticamente?**
> * Instala **Node.js** (si no lo tienes).
> * Instala **MiKTeX** (~200 MB en ~3 minutos, en lugar de TeX Live que pesa ~8 GB y demora horas).
> * Configura MiKTeX para que descargue cualquier paquete faltante de forma transparente y silenciosa.
> * Instala **Marp CLI** para diapositivas.
> * Instala las extensiones visuales de **VS Code** (`Marp for VS Code` y `LaTeX Workshop`).
> * Enlaza el comando global `m-docflow` en tu computadora.

### Opción B: Diagnóstico con `m-docflow doctor`
Para verificar si tu máquina ya tiene todas las herramientas listas:
```bash
m-docflow doctor
```

```text
╔════════════════════════════════════════════════════════════╗
║             m-docflow :: Diagnóstico del Sistema           ║
║        Verificación de Herramientas y Dependencias         ║
╚════════════════════════════════════════════════════════════╝

[✔ INSTALADO] Node.js                      (v22.23.1)
[✔ INSTALADO] NPM                          (10.9.8)
[✔ INSTALADO] LaTeX Compiler (latexmk)     (v4.83)
[✔ INSTALADO] Biber (BibLaTeX APA 7)       (v2.22)
[✔ INSTALADO] Marp CLI (Presentaciones)    (v4.5.1)
[✔ INSTALADO] Git                          (v2.54.0)
[✔ INSTALADO] VS Code CLI                  (v1.138.0)
────────────────────────────────────────────────────────────
✔ ¡Todo listo! Tu sistema tiene todas las dependencias necesarias.
```

---

## 📁 3. Nomenclatura Estricta y Estructura Limpia por Curso

Cualquier curso o proyecto gestionado con `m-docflow` utiliza esta organización intuitiva:

```text
Nombre-Del-Curso/
├── Clases/                # 📂 INTACTA (Diapositivas y material del docente)
├── documentos del curso/  # 📂 INTACTA (Sílabos, rúbricas y formatos oficiales)
├── materiales/            # 📂 INTACTA (Papers descargados e insumos)
│
├── codigo/                # 💻 TU SOFTWARE (APIs, Docker, Python, etc. 100% aislado)
│
├── documentacion/         # 📝 REDACCIÓN ACADÉMICA PURA (Sin scripts ni out/)
│   ├── cuerpo/            # Capítulos modulares (00_intro.tex, 01_problema.tex, ...)
│   ├── anexos/            # 01_anexo.tex (Instrumentos, encuestas, etc.)
│   ├── figuras/           # Gráficos e imágenes propias del informe
│   └── referencias.bib    # Base de datos bibliográfica BibLaTeX
│
├── presentacion/          # 📊 EXPOSICIONES INSTITUCIONALES
│   ├── presentacion.md    # Diapositivas en Markdown limpio
│   └── assets/            # Diagramas SVG de arquitectura y organigramas
│
├── PDF-documentacion/     # 📦 ENTREGABLES DE INFORMES (Control de versiones)
│   ├── LRPD-CN-2026-09-19-104825.pdf
│   ├── LRPD-CN-2026-09-19-104844-Avance2.pdf
│   ├── LRPD-CN-ACTUAL.pdf  # Siempre la versión más reciente lista para subir
│   └── HISTORIAL.md       # Bitácora automática en Markdown
│
├── PDF-presentacion/      # 📦 ENTREGABLES DE DIAPOSITIVAS (Control de versiones)
│   ├── PRESENTACION-CN-2026-09-19-104837.pdf
│   ├── PRESENTACION-CN-ACTUAL.pdf
│   └── HISTORIAL.md       # Bitácora de presentaciones
│
├── m-project.json         # Configuración mínima del proyecto (metadatos, equipo)
└── .gitignore             # Ignora código temporal
```

---

## 🚀 4. Tutorial Paso a Paso: De 0 a tu Primer Informe en 5 Minutos

### Paso 1: Inicializar un nuevo curso
Abre tu terminal en la carpeta de tu curso y ejecuta:
```bash
m-docflow init . --preset upsjb --title "Computación en la Nube" --docente "Mg. Carolyn Rojas Vargas"
```

### Paso 2: Configurar los metadatos (`m-project.json`)
Edita el archivo `m-project.json` en la raíz del curso:
```json
{
  "project": "computacion-en-la-nube-lrpd",
  "preset": "upsjb",
  "type": "lrpd",
  "siglas": "CN",
  "metadata": {
    "titulotrabajo": "Propuesta de Arquitectura Cloud con Microservicios en AWS Fargate",
    "titulocorto": "Solución Cloud con Microservicios",
    "curso": "COMPUTACIÓN EN LA NUBE",
    "docente": "Mg. Carolyn Milagros Rojas Vargas",
    "estudiantes": [
      "Bautista Pachas, Grethel Xiomara",
      "Escate Aguilar, Eddison Leonardo",
      "Torres Espinoza, Marlon Omar"
    ],
    "anio": "2026",
    "ciclo": "VIII"
  }
}
```

### Paso 3: Redactar los capítulos
Los capítulos de tu informe se editan en `documentacion/cuerpo/`:
* `00_introduccion.tex`
* `01_planteamiento.tex`
* `02_marco_teorico.tex`
* `03_metodologia.tex`
* `04_resultados.tex`
* `05_conclusiones.tex`

### Paso 4: Inyectar citas científicas desde Crossref
Para agregar un paper con su DOI oficial, no necesitas buscar el BibTeX a mano:
```bash
m-docflow cite "10.1016/j.cose.2023.103200"
```
La herramienta consulta la API de Crossref, formatea la cita BibLaTeX y la inyecta directamente en `documentacion/referencias.bib`, indicándote la clave a usar (`\cite{Freitas_2023}`).

### Paso 5: Escribir diapositivas en Markdown
Abre `presentacion/presentacion.md` y escribe tus láminas separándolas con `---`:
```markdown
---
marp: true
theme: upsjb
paginate: true
---

<!-- _class: portada -->

# Solución Cloud en AWS Fargate
### Computación en la Nube — 2026-II

**Equipo:** Marlon Torres, Grethel Bautista, Eddison Escate  
**Docente:** Mg. Carolyn Rojas Vargas  

---

# 1. Planteamiento del Problema
- Alta latencia en servidores on-premise.
- Necesidad de alta disponibilidad y autoescalado elástico.
```

### Paso 6: Compilar y Registrar Avances
```bash
# Compilar informe académico (LaTeX APA 7)
m-docflow build --tag "Avance-Semana-03"

# Compilar y abrir automáticamente
m-docflow build --open

# Compilar presentación en PDF o PowerPoint (.pptx)
m-docflow slides
m-docflow slides --pptx --open
```

### Paso 7: Conteo y Auditoría de Palabras
```bash
m-docflow count
```
Muestra un semáforo visual con el total de palabras por capítulo y valida si el resumen cumple la regla académica de las 250 palabras.

---

## 🏷️ 5. Regla de Estampado y Control de Versiones

Cada compilación genera un archivo sellado que **nunca sobrescribe el anterior**:

* **Patrón:** `TIPO-SIGLAS-AAAA-MM-DD-HHMMSS[-TAG].ext`
* **Ejemplos reales:**
  * `LRPD-CN-2026-09-19-104825.pdf`
  * `LRPD-CN-2026-09-19-104844-Avance2.pdf`
  * `PRESENTACION-CN-2026-09-19-104837.pdf`
* **Acceso Rápido:** Siempre se genera una copia `...-ACTUAL.pdf` con la última versión para subir directamente al Blackboard o portal universitario.
* **Bitácora Automática:** Se actualiza un archivo `HISTORIAL.md` dentro de cada carpeta de exportación con fecha, hora, tamaño y notas del avance.

---

## 🤖 6. Guía de Asistencia con Agentes de IA

`m-docflow` está diseñado para operar con **Antigravity, Claude Code, Codex y Cursor**.

### Prompt Maestro para Invocar al Agente:
Copia y pega este mensaje al iniciar sesión con cualquier IA:

```markdown
Actúa como un Asistente Senior de Investigación Académica y Desarrollo de Software.

Vas a trabajar en la siguiente carpeta de curso/proyecto:
📁 RUTA DEL CURSO: "[Pega aquí la ruta completa de tu curso]"
🎯 TAREA SOLICITADA: "[Indica qué redactar, programar o presentar]"
🏷️ FORMATO / PRESET: "upsjb"

PROTOCOLO OBLIGATORIO DE EJECUCIÓN (m-docflow):
1. RECONOCIMIENTO AUTOMÁTICO:
   - Inspecciona los archivos en "documentos del curso/", "Clases/" o borradores para extraer: Asignatura, docente asesor, integrantes del equipo, título del proyecto y ciclo.
2. ESTRUCTURA Y FRAMEWORK:
   - El sistema cuenta con el motor CLI global "m-docflow" accesible desde cualquier terminal.
   - NUNCA crees scripts .ps1, carpetas .vscode ni plantillas sueltas en la carpeta del curso.
   - Todo debe estructurarse en:
     • documentacion/ (cuerpo/, figuras/, anexos/, referencias.bib)
     • presentacion/ (presentacion.md, assets/)
     • codigo/ (software puro, aislado)
     • PDF-documentacion/ y PDF-presentacion/ (entregables)
3. DESARROLLO Y COMPILACIÓN:
   - Para compilar el informe: m-docflow build "<RUTA>" --tag "<ETIQUETA>"
   - Para compilar diapositivas: m-docflow slides "<RUTA>" --tag "<ETIQUETA>"
   - Confirma la entrega sellada con formato TIPO-SIGLAS-AAAA-MM-DD-HHMMSS.
```

---

## 🏛️ 7. Sistema de Presets Multi-Institucional

`m-docflow` no está atado a una sola universidad. Puedes cambiar de formato en `m-project.json`:

| Preset | Institución / Estándar | Características |
| :--- | :--- | :--- |
| **`upsjb`** | **Universidad Privada San Juan Bautista** | APA 7ma Edición, carátula con escudo oficial, preliminares romanos, tablas apaisadas `landscape` y tema Marp institucional. |
| **`unica`** | **Universidad Nacional San Luis Gonzaga (Ica)** | Arial 10pt, interlineado 1.5, membrete institucional oficial en cabecera, carátula oficial y tema Marp institucional UNICA. |
| **`generic-apa7`** | **Estándar Académico Global** | APA 7 neutro estudiantil/profesional + Diapositivas minimalistas ejecutivas. |
| **`upsjb-practica`** | **UPSJB — Informes de práctica** | Portada breve con tema, curso y estudiante; índices condicionales; cuerpo de resolución aplicada; referencias y anexos, sin preliminares de LRPD. |

### Cómo Crear un Preset para otra Universidad:
1. Crea una carpeta en `presets/<mi-universidad>/`.
2. Agrega `preset.json` declarando las rutas de `setup.tex`, `cover.tex` y el CSS de Marp.
3. ¡Listo! Cualquier proyecto puede usarlo con `"preset": "mi-universidad"`.

### Estructura recomendada para una práctica aplicada

Para crear un informe semanal de resolución aplicada, inicializa el proyecto con `upsjb-practica`:

```bash
m-docflow init "Practica-Semana-04" --preset upsjb-practica --title "Resolución de la práctica aplicada al caso de estudio"
```

La carpeta debe conservar esta organización:

```text
Practica-Semana-04/
├── m-project.json
├── documentacion/
│   ├── cuerpo/          # Problema, análisis, propuesta y resolución aplicada
│   ├── anexos/          # Evidencias, matrices y tablas complementarias
│   ├── figuras/         # Diagramas del caso
│   └── referencias.bib  # Fuentes citadas en formato APA 7
├── codigo/              # Scripts o consultas de apoyo
├── materiales/          # Insumos del caso y fuentes de contexto
└── PDF-documentacion/   # Entregable versionado
```

El contenido debe redactarse como la resolución del problema del caso. Cada indicación de la guía se convierte en una decisión concreta del proyecto: diagnóstico, diseño, procedimiento, validación, resultado esperado y evidencia. El informe debe usar voz impersonal proyectiva, por ejemplo: “se analizará”, “se definirá”, “se cargará”, “se validará” y “se documentará”.

La salida recomendada es: portada institucional, índices cuando correspondan, introducción, desarrollo de la resolución, referencias y anexos. El preset desactiva por defecto la hoja de responsables, el agradecimiento, la dedicatoria, el resumen y el abstract.

---

## ❓ 8. Preguntas Frecuentes (FAQ) y Troubleshooting

<details>
<summary><b>¿Por qué no veo archivos .aux, .log o .bbl en la carpeta del curso?</b></summary>
Porque m-docflow compila de forma aislada en <code>%TEMP%\m-docflow-build\...</code>. Esto evita que OneDrive bloquee archivos en sincronización y mantiene tu repositorio limpio.
</details>

<details>
<summary><b>¿Qué hago si LaTeX dice que falta un paquete?</b></summary>
Si usaste <code>setup.bat</code> (MiKTeX), MiKTeX descarga los paquetes faltantes en segundo plano de forma automática. Si usas TeX Live, abre la consola de TeX Live Manager (<code>tlmgr install &lt;paquete&gt;</code>).
</details>

<details>
<summary><b>¿Cómo veo el PDF inmediatamente al compilar?</b></summary>
Agrega el parámetro <code>--open</code>:
<code>m-docflow build --open</code> o <code>m-docflow slides --open</code>.
</details>

<details>
<summary><b>¿Dónde coloco mi código de programación (Python, Node, Docker)?</b></summary>
En la carpeta <code>codigo/</code>. Está 100% aislada de LaTeX y Marp, con su propio <code>.gitignore</code> para que los entornos virtuales (<code>.venv</code>, <code>node_modules</code>) no interfieran con tus informes.
</details>

---

## 👤 Autor

**Marlon Omar Torres Espinoza**  
*Estudiante de Ingeniería de Sistemas — Universidad Privada San Juan Bautista*  
* GitHub: [@marlon-mte](https://github.com/marlon-mte)  
* Proyectos relacionados: `m-core`, `m-cortex`, `m-agenda`, `m-docflow`

---

## 📄 Licencia

Distribuido bajo la Licencia **MIT**. Consulta [LICENSE](LICENSE) para más detalles.
