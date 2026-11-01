// Genera la voz de una escena con ElevenLabs
// Uso:
//   node --env-file=.env scripts/generar-voz.ts --serie <serie> --escena <número> --texto "<frase>"
//        [--voz <nombre>] [--reemplazar]
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import {
  claveRequerida,
  duracionSegundos,
  HEYGEN_USD_POR_SEGUNDO,
  prepararSerie,
  protegerArchivo,
  salir,
} from './lib/comun.ts';

interface Voz {
  voice_id: string;
  name: string;
}

const { values } = parseArgs({
  options: {
    serie: { type: 'string' },
    escena: { type: 'string' },
    texto: { type: 'string' },
    voz: { type: 'string', default: 'George' },
    reemplazar: { type: 'boolean' },
  },
});

if (!values.serie || !values.escena || !values.texto) {
  salir('Faltan datos. Uso: --serie <serie> --escena <número> --texto "<frase>" [--voz <nombre>]');
}

const apiKey = claveRequerida('API_KEY_ELEVENLABS');
const carpetas = await prepararSerie(values.serie);
const archivo = join(carpetas.voces, `escena${values.escena}.mp3`);
protegerArchivo(archivo, values.reemplazar);

// 1) Buscar la voz por nombre entre las voces de la cuenta
const resVoces = await fetch('https://api.elevenlabs.io/v1/voices', {
  headers: { 'xi-api-key': apiKey },
});
if (!resVoces.ok) salir(`Error al listar voces ${resVoces.status}: ${(await resVoces.text()).slice(0, 300)}`);

const { voices } = (await resVoces.json()) as { voices: Voz[] };
const buscada = values.voz.toLowerCase();
const voz = voices.find((v) => v.name.toLowerCase().startsWith(buscada));
if (!voz) salir(`No encontré la voz "${values.voz}". Disponibles: ${voices.map((v) => v.name).join(' | ')}`);

// 2) Convertir la frase a audio
const res = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voz.voice_id}?output_format=mp3_44100_128`,
  {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: values.texto, model_id: 'eleven_multilingual_v2' }),
  },
);
if (!res.ok) salir(`Error ${res.status}: ${(await res.text()).slice(0, 500)}`);

await writeFile(archivo, Buffer.from(await res.arrayBuffer()));

const segundos = duracionSegundos(archivo);
console.log(`✅ Audio guardado en ${archivo}`);
console.log(`   Voz: ${voz.name} | Duración: ${segundos.toFixed(1)} s`);
console.log(`   Animarlo en HeyGen costaría ~$${(segundos * HEYGEN_USD_POR_SEGUNDO).toFixed(2)}`);
