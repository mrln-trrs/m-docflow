import path from 'node:path';
import { listPresets } from './presets.js';
import { findProjectRoot, loadConfig } from './config.js';
import { initProject } from './scaffold.js';
import { compileLatex } from './compiler.js';
import { compileSlides } from './marp.js';
import { addCitationToProject } from './crossref.js';
import { analyzeProjectWords } from './counter.js';

function printBanner() {
  console.log(`
\x1b[36m╔════════════════════════════════════════════════════════════╗
║                      \x1b[1mm-docflow v1.0.0\x1b[0m\x1b[36m                      ║
║     \x1b[37mModular Academic & Technical Documentation Engine\x1b[36m      ║
║        \x1b[90mBy Marlon Omar Torres Espinoza (@marlon-mte)\x1b[36m        ║
╚════════════════════════════════════════════════════════════╝\x1b[0m
`);
}

function printHelp() {
  printBanner();
  console.log(`\x1b[1mUSO:\x1b[0m
  m-docflow <comando> [opciones]

\x1b[1mCOMANDOS DISPONIBLES:\x1b[0m
  \x1b[32minit\x1b[0m [directorio]      Inicializa una nueva carpeta de curso o proyecto.
                        Opciones:
                          --preset <id>       Preset a usar (ej: upsjb, generic-apa7)
                          --title <texto>     Título de la investigación o curso
                          --course <nombre>   Nombre formal de la asignatura
                          --docente <nombre>  Nombre del docente a cargo
                          --author <nombre>   Nombre del autor

  \x1b[32mbuild\x1b[0m [directorio]     Compila el documento académico en PDF (LaTeX + Biber).
                        Compila en cache temporal y exporta a dist/ sin ensuciar.
                        Opciones:
                          --open              Abre el PDF al finalizar la compilación

  \x1b[32mslides\x1b[0m [directorio]    Compila la presentación institucional con Marp.
                        Opciones:
                          --pptx              Exporta a PowerPoint (.pptx) en vez de PDF
                          --open              Abre la presentación exportada

  \x1b[32mcite\x1b[0m <DOI> [dir]       Descarga e inyecta la cita bibliográfica desde Crossref
                        directamente en docs/references.bib.

  \x1b[32mcount\x1b[0m [directorio]     Calcula el conteo de palabras del documento y valida
                        los límites del abstract (regla de 250 palabras).

  \x1b[32mpresets\x1b[0m               Lista todos los perfiles institucionales disponibles.

  \x1b[32mstatus\x1b[0m [directorio]    Muestra el diagnóstico y estado del proyecto actual.

\x1b[1mEJEMPLOS:\x1b[0m
  m-docflow init . --preset upsjb --title "Computación en la Nube"
  m-docflow build --open
  m-docflow slides --pptx --open
  m-docflow cite "10.1016/j.cose.2023.103200"
  m-docflow count
`);
}

function parseArgs(rawArgs) {
  const args = { _: [] };
  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith('--')) {
        args[key] = rawArgs[i + 1];
        i++;
      } else {
        args[key] = true;
      }
    } else {
      args._.push(arg);
    }
  }
  return args;
}

export async function runCLI(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const command = args._[0];

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  try {
    switch (command) {
      case 'presets': {
        printBanner();
        console.log('\x1b[1mPerfiles Institucionales Disponibles:\x1b[0m\n');
        const presets = listPresets();
        for (const p of presets) {
          console.log(`  • \x1b[32m${p.id.padEnd(14)}\x1b[0m: ${p.name}`);
          console.log(`    \x1b[90m${p.description}\x1b[0m`);
        }
        console.log('');
        break;
      }

      case 'init': {
        const targetDir = args._[1] || '.';
        initProject(targetDir, {
          preset: args.preset,
          title: args.title,
          course: args.course,
          docente: args.docente,
          author: args.author,
          type: args.type
        });
        break;
      }

      case 'build': {
        const targetArg = args._[1] || '.';
        const projectRoot = findProjectRoot(targetArg);
        if (!projectRoot) {
          throw new Error(`No se encontró ningún proyecto m-docflow en "${path.resolve(targetArg)}".\nEjecuta "m-docflow init" primero.`);
        }
        compileLatex(projectRoot, {
          open: args.open,
          tag: args.tag,
          note: args.note
        });
        break;
      }

      case 'slides': {
        const targetArg = args._[1] || '.';
        const projectRoot = findProjectRoot(targetArg);
        if (!projectRoot) {
          throw new Error(`No se encontró ningún proyecto m-docflow en "${path.resolve(targetArg)}".\nEjecuta "m-docflow init" primero.`);
        }
        compileSlides(projectRoot, {
          pptx: args.pptx,
          open: args.open,
          tag: args.tag,
          note: args.note
        });
        break;
      }

      case 'cite': {
        const doi = args._[1];
        if (!doi) {
          console.error('\x1b[31mError: Debes proporcionar un DOI.\x1b[0m Ejemplo: m-docflow cite "10.1016/j.cose.2023.103200"');
          process.exit(1);
        }
        const targetArg = args._[2] || '.';
        const projectRoot = findProjectRoot(targetArg);
        if (!projectRoot) {
          throw new Error(`No se encontró ningún proyecto m-docflow en "${path.resolve(targetArg)}".`);
        }
        console.log(`\x1b[36m[m-docflow]\x1b[0m Consultando DOI "${doi}" en Crossref...`);
        const res = await addCitationToProject(projectRoot, doi);
        if (res.alreadyExists) {
          console.log(`\x1b[33m⚠ La cita ya se encontraba en references.bib con la clave:\x1b[0m \x1b[1m${res.citationKey}\x1b[0m`);
        } else {
          console.log(`\x1b[32m✔ Cita agregada con éxito a docs/references.bib!\x1b[0m`);
          console.log(`  \x1b[1mClave :\x1b[0m \\cite{${res.citationKey}}`);
          console.log(`  \x1b[90mTítulo:\x1b[0m ${res.title}`);
        }
        break;
      }

      case 'count': {
        const targetArg = args._[1] || '.';
        const projectRoot = findProjectRoot(targetArg);
        if (!projectRoot) {
          throw new Error(`No se encontró ningún proyecto m-docflow en "${path.resolve(targetArg)}".`);
        }
        const analysis = analyzeProjectWords(projectRoot);
        console.log('\n\x1b[1m📊 Reporte de Palabras (m-docflow):\x1b[0m');
        console.log('─'.repeat(45));
        for (const chap of analysis.chapters) {
          console.log(`  ${chap.file.padEnd(25)} : \x1b[36m${chap.count.toString().padStart(6)}\x1b[0m palabras`);
        }
        console.log('─'.repeat(45));
        console.log(`  \x1b[1mTOTAL CUERPO\x1b[0m              : \x1b[32m${analysis.totalWords.toString().padStart(6)}\x1b[0m palabras`);
        if (analysis.abstractWords !== null) {
          const color = analysis.abstractStatus === 'OK' ? '\x1b[32m' : '\x1b[31m';
          console.log(`  \x1b[1mRESUMEN / ABSTRACT\x1b[0m        : ${color}${analysis.abstractWords.toString().padStart(6)}\x1b[0m palabras (Límite: 250 - ${analysis.abstractStatus})`);
        }
        console.log('');
        break;
      }

      case 'status': {
        const targetArg = args._[1] || '.';
        const projectRoot = findProjectRoot(targetArg);
        if (!projectRoot) {
          throw new Error(`No se encontró ningún proyecto m-docflow en "${path.resolve(targetArg)}".`);
        }
        const config = loadConfig(projectRoot);
        printBanner();
        console.log(`\x1b[1mEstado del Proyecto:\x1b[0m ${config.project}`);
        console.log(`  Ruta   : ${projectRoot}`);
        console.log(`  Preset : \x1b[33m${config.preset}\x1b[0m (${config._preset.name})`);
        console.log(`  Curso  : ${config.metadata.curso || 'No especificado'}`);
        console.log(`  Docente: ${config.metadata.docente || 'No especificado'}`);
        console.log(`  Título : ${config.metadata.titulotrabajo || 'No especificado'}\n`);
        break;
      }

      default:
        console.error(`\x1b[31mComando desconocido: "${command}"\x1b[0m. Usa "m-docflow help" para ver la lista.`);
        process.exit(1);
    }
  } catch (err) {
    console.error(`\n\x1b[31m[ERROR]\x1b[0m ${err.message}\n`);
    process.exit(1);
  }
}
