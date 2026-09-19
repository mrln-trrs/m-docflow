# 🚀 Guía de Instalación y Dependencias: m-docflow

Esta guía explica cómo configurar el entorno de trabajo completo para utilizar **`m-docflow`**, ya sea en tu máquina personal o para compartirlo con compañeros de equipo.

---

## ⚡ Método 1: Instalación Automatizada en 1 Paso (Windows)

Si estás en Windows 10 u 11, puedes instalar todo automáticamente ejecutando nuestro script en **PowerShell como Administrador**:

1. Abre PowerShell y navega a la carpeta de `m-docflow`:
   ```powershell
   cd D:\proyectos\m-docflow
   ```
2. Ejecuta el script instalador:
   ```powershell
   .\setup.ps1
   ```

El script se encargará de:
* Instalar **Node.js** (si no lo tienes).
* Instalar **MiKTeX** (Motor LaTeX ligero y automático).
* Instalar **Marp CLI** globalmente.
* Instalar las extensiones recomendadas en **VS Code**.
* Registrar el comando global `m-docflow`.
* Ejecutar un diagnóstico final (`m-docflow doctor`).

---

## 🛠️ Método 2: Instalación Manual (Paso a Paso)

Si prefieres instalar cada herramienta manualmente o estás en Linux / macOS:

### 1. Node.js (v18 o superior)
* **Windows:** `winget install OpenJS.NodeJS` o descarga el instalador desde [nodejs.org](https://nodejs.org/).
* **macOS:** `brew install node`
* **Linux:** `sudo apt install nodejs npm`

### 2. Motor LaTeX (¿MiKTeX o TeX Live?)

> [!TIP]
> **¿Por qué recomendamos MiKTeX para tus compañeros?**  
> * **TeX Live:** Requiere descargar más de **5 GB a 8 GB** y suele tardar entre **45 minutos y 2 horas** en instalarse.  
> * **MiKTeX:** Solo pesa **~200 MB** y se instala en **3 minutos**. Además, cuenta con *Auto-Install*: si un documento requiere un paquete nuevo (como `pdflscape` o `booktabs`), MiKTeX lo descarga en 1 segundo en segundo plano sin errores.

* **Opción A (Recomendada - Rápida): MiKTeX**
  ```powershell
  winget install MiKTeX.MiKTeX
  ```
  *(Al instalarlo, asegúrate de activar la opción "Install missing packages on-the-fly: Yes")*.
* **Opción B: TeX Live Completo**
  Descarga el instalador ISO o instalador de red desde [tug.org/texlive](https://www.tug.org/texlive/).

### 3. Marp CLI (Generador de Diapositivas)
Instálalo de forma global en tu terminal ejecutando:
```bash
npm install -g @marp-team/marp-cli
```

### 4. Registrar `m-docflow` en tu Terminal
Entra a la carpeta del proyecto y ejecuta:
```bash
npm link
```
¡Listo! Ahora el comando `m-docflow` funcionará desde cualquier carpeta de tu disco.

---

## 🩺 Verificación del Entorno: `m-docflow doctor`

En cualquier momento puedes comprobar si tu computadora está lista ejecutando:

```bash
m-docflow doctor
```

Verás un diagnóstico con semáforos como este:
```text
[✔ INSTALADO] Node.js                    (v22.23.1)
[✔ INSTALADO] NPM                        (10.9.8)
[✔ INSTALADO] LaTeX Compiler (latexmk)   (v4.83)
[✔ INSTALADO] Biber (BibLaTeX APA 7)     (v2.22)
[✔ INSTALADO] Marp CLI (Presentaciones)  (v4.5.1)
[✔ INSTALADO] Git                        (v2.54.0)
[✔ INSTALADO] VS Code CLI                (v1.138.0)
────────────────────────────────────────────────────────────
✔ ¡Todo listo! Tu sistema tiene todas las dependencias necesarias.
```

---

## 💻 Extensiones Recomendadas de VS Code

Para tener vista previa en tiempo real de tus diapositivas y código LaTeX mientras redactas:
1. **Marp for VS Code** (`marp-team.marp-vscode`): Vista previa de diapositivas al costado.
2. **LaTeX Workshop** (`James-Yu.latex-workshop`): Resaltado de sintaxis y snippets para LaTeX.
