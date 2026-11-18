// Genera la imagen de un personaje con Nano Banana 2 (OpenRouter)
// Uso:
//   node --env-file=.env scripts/generar-imagen.ts --serie <serie> --personaje <nombre> --descripcion "<descripción>"
//        [--referencia <imagen>]... [--formato 9:16] [--reemplazar]
import { readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { claveRequerida, prepararSerie, salir, slug } from './lib/comun.ts';
import { pedirImagen } from './lib/imagen.ts';

const { values } = parseArgs({
  options: {
    serie: { type: 'string' },
    personaje: { type: 'string' },
    descripcion: { type: 'string' },
    referencia: { type: 'string', multiple: true },
    formato: { type: 'string', default: '9:16' },
    reemplazar: { type: 'boolean' },
  },
});

if (!values.serie || !values.personaje || !values.descripcion) {
  salir('Faltan datos. Uso: --serie <serie> --personaje <nombre> --descripcion "<descripción>" [--referencia <imagen>]');
}

const apiKey = claveRequerida('API_KEY_OPENROUTER');
const carpetas = await prepararSerie(values.serie);

// Revisar antes de gastar: el formato (png, jpeg…) se conoce recién con la respuesta
const nombre = slug(values.personaje);
const existente = (await readdir(carpetas.personajes)).find((f) => f.toLowerCase().startsWith(`${nombre}.`));
if (existente && !values.reemplazar) {
  salir(`El personaje "${nombre}" ya existe (${existente}). Usa --reemplazar si de verdad quieres generarlo de nuevo.`);
}

// Condiciones que necesita HeyGen para poder animar al personaje
const prompt = `${values.descripcion}

Requirements: photorealistic, one person, face clearly visible and centered, looking at the camera.
No logos, no brand names, no text overlays.`;

const imagen = await pedirImagen(apiKey, prompt, values.formato, values.referencia ?? []);

if (existente) await rm(join(carpetas.personajes, existente));
const archivo = join(carpetas.personajes, `${nombre}.${imagen.extension}`);
await writeFile(archivo, imagen.contenido);

console.log(`✅ Imagen guardada en ${archivo}`);
console.log(`   Costo: $${imagen.costo ?? '?'}`);
