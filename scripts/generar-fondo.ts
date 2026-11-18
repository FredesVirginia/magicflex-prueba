// Genera la imagen de fondo de una lámina (carrusel, post o historia) con Nano Banana 2 (OpenRouter)
// El texto no lo escribe la IA, porque deforma las letras: lo agrega después componer.ts
// Uso:
//   node --env-file=.env scripts/generar-fondo.ts --pieza <pieza> --lamina <número> --descripcion "<descripción>"
//        [--referencia <imagen>]... [--formato 4:5] [--reemplazar]
import { mkdir, readdir, rename, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { parseArgs } from 'node:util';
import { claveRequerida, prepararPieza, salir } from './lib/comun.ts';
import { pedirImagen } from './lib/imagen.ts';

const { values } = parseArgs({
  options: {
    pieza: { type: 'string' },
    lamina: { type: 'string' },
    descripcion: { type: 'string' },
    referencia: { type: 'string', multiple: true },
    formato: { type: 'string', default: '4:5' },
    reemplazar: { type: 'boolean' },
  },
});

if (!values.pieza || !values.lamina || !values.descripcion) {
  salir('Faltan datos. Uso: --pieza <pieza> --lamina <número> --descripcion "<descripción>" [--formato 4:5]');
}

const apiKey = claveRequerida('API_KEY_OPENROUTER');
const carpetas = await prepararPieza(values.pieza);

// Revisar antes de gastar: el formato (png, jpeg…) se conoce recién con la respuesta
const nombre = `lamina${values.lamina}`;
const existente = (await readdir(carpetas.fondos)).find((f) => f.toLowerCase().startsWith(`${nombre}.`));
if (existente && !values.reemplazar) {
  salir(`El fondo de la lámina ${values.lamina} ya existe (${existente}). Usa --reemplazar si de verdad quieres generarlo de nuevo.`);
}

const prompt = `${values.descripcion}

Requirements: no text, no letters, no numbers, no signs.
Leave calm, uncluttered space where text can be placed on top.`;

const imagen = await pedirImagen(apiKey, prompt, values.formato, values.referencia ?? []);

// La imagen anterior ya se pagó: se guarda por si ella prefiere volver a esa versión
if (existente) {
  const anteriores = join(carpetas.fondos, 'anteriores');
  await mkdir(anteriores, { recursive: true });
  const version = (await readdir(anteriores)).filter((f) => f.startsWith(`${nombre}-v`)).length + 1;
  await rename(join(carpetas.fondos, existente), join(anteriores, `${nombre}-v${version}${extname(existente)}`));
}
const archivo = join(carpetas.fondos, `${nombre}.${imagen.extension}`);
await writeFile(archivo, imagen.contenido);

console.log(`✅ Fondo guardado en ${archivo}`);
console.log(`   Costo: $${imagen.costo ?? '?'}`);
