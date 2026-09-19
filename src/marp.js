import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { loadConfig } from './config.js';

export function compileSlides(projectDir, options = {}) {
  const config = loadConfig(projectDir);
  const slidesDir = path.join(projectDir, 'slides');
  let inputFile = path.join(slidesDir, 'presentacion.md');

  if (options.file) {
    inputFile = path.resolve(projectDir, options.file);
  }

  if (!fs.existsSync(inputFile)) {
    throw new Error(`No se encontró el archivo de diapositivas en:\n${inputFile}`);
  }

  const distDir = path.join(projectDir, 'dist');
  fs.mkdirSync(distDir, { recursive: true });

  const format = options.pptx ? 'pptx' : 'pdf';
  const projectName = config.project || path.basename(projectDir);
  const outputFile = path.join(distDir, `${projectName}_presentacion.${format}`);

  // Determine preset theme
  const preset = config._preset;
  const args = [
    '--allow-local-files',
    '--no-stdin',
    inputFile,
    '-o', outputFile
  ];

  if (options.pptx) {
    args.push('--pptx');
  } else {
    args.push('--pdf');
  }

  if (preset.marp && preset.marp.theme) {
    const themePath = path.resolve(preset._baseDir, preset.marp.theme);
    if (fs.existsSync(themePath)) {
      const cssRaw = fs.readFileSync(themePath, 'utf8');
      const themeDir = path.dirname(themePath);
      // Replace relative asset urls with absolute file:/// urls so Marp always finds them
      const resolvedCss = cssRaw.replace(/url\((['"]?)(assets\/[^'"\)]+)\1\)/g, (m, quote, relPath) => {
        const absPath = path.resolve(themeDir, relPath).replace(/\\/g, '/');
        return `url("file:///${absPath}")`;
      });
      const tmpCss = path.join(os.tmpdir(), `m-docflow-theme-${preset.id}.css`);
      fs.writeFileSync(tmpCss, resolvedCss, 'utf8');
      args.push('--theme-set', tmpCss);
    }
  }

  console.log(`\x1b[36m[m-docflow]\x1b[0m Compilando diapositivas con Marp (${format.toUpperCase()})...`);
  console.log(`  \x1b[90mEntrada: ${path.relative(projectDir, inputFile)}\x1b[0m`);
  console.log(`  \x1b[90mSalida : ${path.relative(projectDir, outputFile)}\x1b[0m`);

  const result = spawnSync('marp', args, {
    shell: true,
    stdio: 'inherit',
    cwd: projectDir
  });

  if (result.status !== 0) {
    throw new Error(`Marp finalizó con código de error ${result.status}`);
  }

  console.log(`\x1b[32m✔ Diapositivas generadas exitosamente en:\x1b[0m ${outputFile}`);

  if (options.open) {
    openFile(outputFile);
  }

  return outputFile;
}

export function openFile(filePath) {
  if (process.platform === 'win32') {
    spawnSync('powershell.exe', ['-NoProfile', '-Command', `Start-Process -FilePath "${filePath}"`], { stdio: 'ignore' });
  } else if (process.platform === 'darwin') {
    spawnSync('open', [filePath], { stdio: 'ignore' });
  } else {
    spawnSync('xdg-open', [filePath], { stdio: 'ignore' });
  }
}
