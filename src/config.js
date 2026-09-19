import fs from 'node:fs';
import path from 'node:path';
import { getPreset } from './presets.js';

export const CONFIG_FILE_NAME = 'm-project.json';

export function findProjectRoot(startDir = process.cwd()) {
  let current = path.resolve(startDir);
  while (true) {
    const candidate = path.join(current, CONFIG_FILE_NAME);
    if (fs.existsSync(candidate)) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  return null;
}

export function loadConfig(projectDir) {
  const configPath = path.join(projectDir, CONFIG_FILE_NAME);
  if (!fs.existsSync(configPath)) {
    throw new Error(`No se encontró "${CONFIG_FILE_NAME}" en ${projectDir}.\nEjecuta "m-docflow init" para inicializar este proyecto.`);
  }

  const raw = fs.readFileSync(configPath, 'utf8');
  let config;
  try {
    config = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Error de sintaxis JSON en ${configPath}: ${err.message}`);
  }

  const presetId = config.preset || 'generic-apa7';
  const preset = getPreset(presetId);

  // Merge defaults
  const defaults = (preset.latex && preset.latex.defaults) || {};
  config.metadata = {
    ...defaults,
    ...(config.metadata || {})
  };

  config._projectDir = projectDir;
  config._preset = preset;
  return config;
}

export function saveConfig(projectDir, config) {
  const configPath = path.join(projectDir, CONFIG_FILE_NAME);
  const cleanConfig = { ...config };
  delete cleanConfig._projectDir;
  delete cleanConfig._preset;
  fs.writeFileSync(configPath, JSON.stringify(cleanConfig, null, 2) + '\n', 'utf8');
}
