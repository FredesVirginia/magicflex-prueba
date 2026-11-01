// Genera la imagen de un personaje con Nano Banana 2 (OpenRouter)
// Uso:
//   node --env-file=.env scripts/generar-imagen.ts --serie <serie> --personaje <nombre> --descripcion "<descripción>"
//        [--referencia <imagen>]... [--formato 9:16] [--reemplazar]
import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { claveRequerida, prepararSerie, salir, slug, tipoImagen } from './lib/comun.ts';

interface ImagenGenerada {
  b64_json: string;
  media_type?: string;
}

interface RespuestaImagen {
  data: ImagenGenerada[];
  usage?: { cost?: number };
}

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

// Las imágenes de referencia ayudan a que el personaje se vea igual en toda la serie (máximo 14)
const referencias = values.referencia ?? [];
if (referencias.length > 14) salir('OpenRouter acepta como máximo 14 imágenes de referencia.');
const inputReferences = await Promise.all(
  referencias.map(async (ruta) => ({
    type: 'image_url',
    image_url: { url: `data:${tipoImagen(ruta)};base64,${(await readFile(ruta)).toString('base64')}` },
  })),
);

// Condiciones que necesita HeyGen para poder animar al personaje
const prompt = `${values.descripcion}

Requirements: photorealistic, one person, face clearly visible and centered, looking at the camera.
No logos, no brand names, no text overlays.`;

const res = await fetch('https://openrouter.ai/api/v1/images', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'google/gemini-3.1-flash-image',
    prompt,
    aspect_ratio: values.formato,
    resolution: '1K',
    n: 1,
    ...(inputReferences.length > 0 && { input_references: inputReferences }),
  }),
});

if (!res.ok) salir(`Error ${res.status}: ${(await res.text()).slice(0, 500)}`);

const datos = (await res.json()) as RespuestaImagen;
const img = datos.data[0];
if (!img) salir('La respuesta no trajo ninguna imagen');

const ext = (img.media_type ?? 'image/png').split('/')[1];
if (existente) await rm(join(carpetas.personajes, existente));
const archivo = join(carpetas.personajes, `${nombre}.${ext}`);
await writeFile(archivo, Buffer.from(img.b64_json, 'base64'));

console.log(`✅ Imagen guardada en ${archivo}`);
console.log(`   Costo: $${datos.usage?.cost ?? '?'}`);
