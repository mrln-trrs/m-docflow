import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const ROOT_DIR = path.resolve(__dirname, '..');
export const PRESETS_DIR = path.resolve(ROOT_DIR, 'presets');

export function listPresets() {
  if (!fs.existsSync(PRESETS_DIR)) return [];
  const entries = fs.readdirSync(PRESETS_DIR, { withFileTypes: true });
  const presets = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const presetJsonPath = path.join(PRESETS_DIR, entry.name, 'preset.json');
      if (fs.existsSync(presetJsonPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(presetJsonPath, 'utf8'));
          presets.push(data);
        } catch {
          // ignore corrupted preset
        }
      }
    }
  }
  return presets;
}

export function getPreset(presetId) {
  const presetDir = path.join(PRESETS_DIR, presetId);
  const presetJsonPath = path.join(presetDir, 'preset.json');
  if (!fs.existsSync(presetJsonPath)) {
    throw new Error(`Preset "${presetId}" no encontrado en ${PRESETS_DIR}`);
  }
  const data = JSON.parse(fs.readFileSync(presetJsonPath, 'utf8'));
  data._baseDir = presetDir;
  return data;
}
