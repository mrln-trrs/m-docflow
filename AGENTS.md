# Universal AI Agent Guidelines: m-docflow Workflow

This repository and projects initialized with **m-docflow** adhere to a strict separation of concerns between **Software Engineering**, **Academic Documentation (LaTeX APA 7)**, and **Presentations (Marp)**.

All AI coding assistants (Antigravity, Claude Code, Codex, Cursor) must follow these operational rules:

---

## 1. Core Architecture & Folder Boundaries

When operating inside an `m-docflow` project:
* `src/`: **Engineering & Software Code Only** (APIs, Docker, algorithms, tests). Do NOT place LaTeX or Marp files here.
* `docs/`: **Pure Academic Writing** (`docs/cuerpo/*.tex`, `docs/references.bib`, `docs/figures/`). Do NOT generate build scripts or temporary build files here.
* `slides/`: **Presentations Only** (`slides/presentacion.md`). Inherits CSS and visual assets from the configured institutional preset.
* `materiales/`: **Reference Insumos** (Read-only papers, professor rubrics, datasets).
* `dist/`: **Deliverables** (Compiled `.pdf` and `.pptx` files).

---

## 2. Command Execution Rules

Never attempt to invent custom `latexmk` commands or create duplicated `.vscode/tasks.json` or `.ps1` build scripts inside project folders.

Always invoke the `m-docflow` engine:

```bash
# Compile academic document (LaTeX APA 7) into dist/
m-docflow build

# Compile presentation slides with institutional theme
m-docflow slides --pdf
m-docflow slides --pptx

# Inject scientific citation via Crossref DOI
m-docflow cite "<DOI>"

# Check word count and 250-word abstract limit
m-docflow count
```

---

## 3. Presets & Institutional Compliance
* Institutional styling (such as UPSJB cover pages, APA 7 formatting rules, logos, and Marp presentation backgrounds) is centralized in `presets/<preset-name>/`.
* Do NOT edit institutional covers in local projects unless specifically customized via `m-project.json`.
* All metadata (Title, Author, Professor, Academic Year) must be configured in `m-project.json`.
