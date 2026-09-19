import { spawnSync } from 'node:child_process';

function checkCommand(command, args = ['--version']) {
  try {
    const res = spawnSync(command, args, {
      shell: true,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    if (res.status === 0) {
      const output = (res.stdout || res.stderr || '').trim().split('\n')[0];
      return { ok: true, version: output };
    }
    return { ok: false, error: `Código de salida ${res.status}` };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export function runDoctor() {
  console.log(`
\x1b[36m╔════════════════════════════════════════════════════════════╗
║             m-docflow :: Diagnóstico del Sistema           ║
║        Verificación de Herramientas y Dependencias         ║
╚════════════════════════════════════════════════════════════╝\x1b[0m
`);

  const checks = [
    {
      name: 'Node.js',
      command: 'node',
      args: ['-v'],
      required: true,
      hint: 'Instalar desde https://nodejs.org/ o ejecutar: winget install OpenJS.NodeJS'
    },
    {
      name: 'NPM',
      command: 'npm',
      args: ['-v'],
      required: true,
      hint: 'Viene incluido con Node.js'
    },
    {
      name: 'LaTeX Compiler (latexmk)',
      command: 'latexmk',
      args: ['-v'],
      required: true,
      hint: 'Recomendado (Rápido ~200MB): winget install MiKTeX.MiKTeX\n       Completo (~5GB): TeX Live desde https://www.tug.org/texlive/'
    },
    {
      name: 'Biber (BibLaTeX APA 7)',
      command: 'biber',
      args: ['--version'],
      required: true,
      hint: 'Viene incluido automáticamente dentro de MiKTeX o TeX Live'
    },
    {
      name: 'Marp CLI (Presentaciones)',
      command: 'marp',
      args: ['--version'],
      required: true,
      hint: 'Instalar ejecutando en terminal: npm install -g @marp-team/marp-cli'
    },
    {
      name: 'Git',
      command: 'git',
      args: ['--version'],
      required: false,
      hint: 'Instalar desde https://git-scm.com/ o: winget install Git.Git'
    },
    {
      name: 'VS Code CLI',
      command: 'code',
      args: ['-v'],
      required: false,
      hint: 'Instalar VS Code desde https://code.visualstudio.com/'
    }
  ];

  let hasRequiredErrors = false;

  for (const item of checks) {
    const result = checkCommand(item.command, item.args);
    const badge = result.ok
      ? '\x1b[32m[✔ INSTALADO]\x1b[0m'
      : item.required
        ? '\x1b[31m[✖ FALTANTE]\x1b[0m '
        : '\x1b[33m[○ OPCIONAL]\x1b[0m ';

    console.log(`${badge} \x1b[1m${item.name.padEnd(28)}\x1b[0m`);

    if (result.ok) {
      console.log(`     \x1b[90m${result.version}\x1b[0m`);
    } else {
      if (item.required) hasRequiredErrors = true;
      console.log(`     \x1b[31mNo detectado en PATH del sistema.\x1b[0m`);
      console.log(`     \x1b[36mSolución:\x1b[0m ${item.hint}`);
    }
    console.log('');
  }

  console.log('─'.repeat(60));
  if (!hasRequiredErrors) {
    console.log('\x1b[32m✔ ¡Todo listo! Tu sistema tiene todas las dependencias necesarias para m-docflow.\x1b[0m\n');
  } else {
    console.log('\x1b[31m⚠ Faltan dependencias esenciales para compilar documentos o presentaciones.\x1b[0m');
    console.log('\x1b[33mPuedes ejecutar el instalador automatizado en PowerShell:\x1b[0m');
    console.log('  .\\setup.ps1\n');
  }
}
