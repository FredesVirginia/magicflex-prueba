// Pone el texto sobre cada lámina de una pieza y guarda los PNG listos para subir (gratis)
// Lee piezas/<pieza>/pieza.json y usa Edge o Chrome, que ya están en la computadora
// Uso: node scripts/componer.ts --pieza <pieza>
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { prepararPieza, salir } from './lib/comun.ts';

interface Lamina {
  titulo?: string;
  texto?: string;
  posicion?: 'arriba' | 'centro' | 'abajo';
  alinear?: 'izquierda' | 'centro';
  velo?: boolean; // false deja la imagen de fondo sin oscurecer
}

interface Pieza {
  tipo: 'carrusel' | 'post' | 'historia';
  cuenta?: string;
  logo?: string;
  fuente?: string;
  colores: { fondo: string; texto: string; acento: string };
  laminas: Lamina[];
}

// Tamaño y márgenes de cada formato. Los márgenes dejan el texto fuera de lo que tapa Instagram
const FORMATOS = {
  carrusel: { ancho: 1080, alto: 1350, arriba: 120, abajo: 120, lados: 120 },
  post: { ancho: 1080, alto: 1350, arriba: 120, abajo: 120, lados: 120 },
  historia: { ancho: 1080, alto: 1920, arriba: 250, abajo: 320, lados: 90 },
};

const NAVEGADORES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
];

const { values } = parseArgs({
  options: { pieza: { type: 'string' } },
});
if (!values.pieza) salir('Falta la pieza. Uso: node scripts/componer.ts --pieza <pieza>');

const carpetas = await prepararPieza(values.pieza);
const rutaDatos = join(carpetas.raiz, 'pieza.json');
if (!existsSync(rutaDatos)) salir(`No encontré ${rutaDatos}`);

const pieza = JSON.parse(await readFile(rutaDatos, 'utf8')) as Pieza;
const formato = FORMATOS[pieza.tipo];
if (!formato) salir(`Tipo "${pieza.tipo}" desconocido. Usa carrusel, post o historia.`);
if (!pieza.colores) salir('Faltan los colores en pieza.json');
if (!pieza.laminas?.length) salir('pieza.json no tiene láminas');
if (pieza.laminas.length > 20) salir('Instagram acepta como máximo 20 láminas por carrusel.');
if (pieza.logo && !existsSync(pieza.logo)) salir(`No encontré el logo en ${pieza.logo}`);

const navegador = NAVEGADORES.find((ruta) => existsSync(ruta));
if (!navegador) salir('Necesito Microsoft Edge o Google Chrome instalado para crear las láminas.');

function escapar(texto: string): string {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Cuanto más largo el título, más chica la letra, para que entre en la lámina
function tamanoTitulo(titulo: string, esPortada: boolean): number {
  if (titulo.length <= 30) return esPortada ? 112 : 88;
  if (titulo.length <= 60) return esPortada ? 88 : 72;
  return 60;
}

function html(lamina: Lamina, indice: number, fondo: string | undefined): string {
  const { ancho, alto, arriba, abajo, lados } = formato;
  const total = pieza.laminas.length;
  const alinear = { arriba: 'flex-start', centro: 'center', abajo: 'flex-end' }[lamina.posicion ?? 'centro'];
  const centrado = lamina.alinear === 'centro';
  const titulo = lamina.titulo ?? '';
  const urlFondo = fondo ? pathToFileURL(resolve(fondo)).href : '';
  const urlLogo = pieza.logo ? pathToFileURL(resolve(pieza.logo)).href : '';
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    * { box-sizing: border-box; margin: 0; }
    html, body { width: ${ancho}px; height: ${alto}px; overflow: hidden; }
    body { position: relative; background: ${pieza.colores.fondo}; color: ${pieza.colores.texto};
           font-family: ${pieza.fuente ?? 'Arial, Helvetica, sans-serif'}; }
    .imagen { position: absolute; inset: 0; background: url("${urlFondo}") center / cover; }
    .velo { position: absolute; inset: 0; background: rgba(0, 0, 0, .45); }
    .contenido { position: absolute; top: ${arriba}px; bottom: ${abajo}px; left: ${lados}px; right: ${lados}px;
                 display: flex; flex-direction: column; justify-content: ${alinear}; gap: 32px;
                 text-align: ${centrado ? 'center' : 'left'}; }
    h1 { font-size: ${tamanoTitulo(titulo, indice === 0)}px; line-height: 1.1; font-weight: 800; }
    h1::after { content: ""; display: block; width: 120px; height: 10px; margin: 28px ${centrado ? 'auto' : '0'} 0;
                background: ${pieza.colores.acento}; }
    p { font-size: 44px; line-height: 1.3; white-space: pre-line; }
    .pie { position: absolute; bottom: 50px; left: ${lados}px; right: ${lados}px;
           display: flex; justify-content: space-between; font-size: 32px; }
    .logo { position: absolute; top: 40px; height: 60px;
            ${centrado ? 'left: 50%; transform: translateX(-50%);' : `left: ${lados}px;`} }
  </style></head><body>
    ${fondo ? '<div class="imagen"></div>' : ''}
    ${fondo && lamina.velo !== false ? '<div class="velo"></div>' : ''}
    ${pieza.logo ? `<img class="logo" src="${urlLogo}">` : ''}
    <div class="contenido">
      ${titulo ? `<h1>${escapar(titulo)}</h1>` : ''}
      ${lamina.texto ? `<p>${escapar(lamina.texto)}</p>` : ''}
    </div>
    ${pieza.tipo === 'carrusel' ? `<div class="pie"><span>${escapar(pieza.cuenta ?? '')}</span><span>${indice + 1}/${total}</span></div>` : ''}
  </body></html>`;
}

const temporal = await mkdtemp(join(tmpdir(), 'componer-'));
const fondos = await readdir(carpetas.fondos);

try {
  for (const [indice, lamina] of pieza.laminas.entries()) {
    const nombre = `lamina${indice + 1}`;
    const fondo = fondos.find((f) => f.toLowerCase().startsWith(`${nombre}.`));
    const pagina = join(temporal, `${nombre}.html`);
    const salida = resolve(carpetas.final, `${nombre}.png`);
    await writeFile(pagina, html(lamina, indice, fondo && join(carpetas.fondos, fondo)));
    execFileSync(
      navegador,
      [
        '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
        '--allow-file-access-from-files',
        `--user-data-dir=${join(temporal, 'perfil')}`,
        `--window-size=${formato.ancho},${formato.alto}`,
        `--screenshot=${salida}`,
        pathToFileURL(pagina).href,
      ],
      { stdio: 'ignore' },
    );
    if (!existsSync(salida)) salir(`No se pudo crear ${salida}`);
    console.log(`✅ ${join(carpetas.final, `${nombre}.png`)}`);
  }
} finally {
  await rm(temporal, { recursive: true, force: true, maxRetries: 3 });
}
