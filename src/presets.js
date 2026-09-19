import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

// Resolución 100% dinámica de la raíz del proyecto sin importar dónde esté clonado
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const ROOT_DIR = path.resolve(__dirname, '..');
export const DEFAULT_PRESETS_DIR = path.resolve(ROOT_DIR, 'presets');

export function getPresetsDirectories() {
  const dirs = [];

  // 1. Directorio personalizado por variable de entorno (si existe)
  if (process.env.M_DOCFLOW_PRESETS_DIR && fs.existsSync(process.env.M_DOCFLOW_PRESETS_DIR)) {
    dirs.push(path.resolve(process.env.M_DOCFLOW_PRESETS_DIR));
  }

  // 2. Directorio de usuario en ~/.m-docflow/presets (si existe)
  const userPresetsDir = path.join(os.homedir(), '.m-docflow', 'presets');
  if (fs.existsSync(userPresetsDir)) {
    dirs.push(userPresetsDir);
  }

  // 3. Directorio de presets empaquetados con el framework
  if (fs.existsSync(DEFAULT_PRESETS_DIR)) {
    dirs.push(DEFAULT_PRESETS_DIR);
  }

  return dirs;
}

export function listPresets() {
  const searchDirs = getPresetsDirectories();
  const presetsMap = new Map();

  for (const baseDir of searchDirs) {
    if (!fs.existsSync(baseDir)) continue;
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && !presetsMap.has(entry.name)) {
        const presetJsonPath = path.join(baseDir, entry.name, 'preset.json');
        if (fs.existsSync(presetJsonPath)) {
          try {
            const data = JSON.parse(fs.readFileSync(presetJsonPath, 'utf8'));
            data._baseDir = path.join(baseDir, entry.name);
            presetsMap.set(entry.name, data);
          } catch {
            // Ignorar preset dañado
          }
        }
      }
    }
  }

  return Array.from(presetsMap.values());
}

export function getPreset(presetId) {
  const searchDirs = getPresetsDirectories();

  for (const baseDir of searchDirs) {
    const presetDir = path.join(baseDir, presetId);
    const presetJsonPath = path.join(presetDir, 'preset.json');
    if (fs.existsSync(presetJsonPath)) {
      const data = JSON.parse(fs.readFileSync(presetJsonPath, 'utf8'));
      data._baseDir = presetDir;
      return data;
    }
  }

  throw new Error(
    `Preset "${presetId}" no encontrado.\nBuscado en:\n  - ${searchDirs.join('\n  - ')}`
  );
}
