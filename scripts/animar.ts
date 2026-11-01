// Anima a un personaje con HeyGen (Avatar IV) usando la voz de ElevenLabs de una escena
// Uso:
//   node --env-file=.env scripts/animar.ts --serie <serie> --escena <número> --personaje <nombre> [--reemplazar]
import { readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseArgs } from 'node:util';
import {
  buscarPersonaje,
  claveRequerida,
  prepararSerie,
  protegerArchivo,
  salir,
  tipoImagen,
} from './lib/comun.ts';

const API = 'https://api.heygen.com/v3';
const ESPERA_MAXIMA_MIN = 30;

const { values } = parseArgs({
  options: {
    serie: { type: 'string' },
    escena: { type: 'string' },
    personaje: { type: 'string' },
    reemplazar: { type: 'boolean' },
  },
});

if (!values.serie || !values.escena || !values.personaje) {
  salir('Faltan datos. Uso: --serie <serie> --escena <número> --personaje <nombre>');
}

const apiKey = claveRequerida('API_KEY_HEYGEN');
const carpetas = await prepararSerie(values.serie);
const imagen = await buscarPersonaje(carpetas.personajes, values.personaje);
const audio = join(carpetas.voces, `escena${values.escena}.mp3`);
const salida = join(carpetas.videos, `escena${values.escena}.mp4`);
protegerArchivo(salida, values.reemplazar);

async function subir(ruta: string, tipo: string): Promise<string> {
  const form = new FormData();
  form.append('file', new Blob([await readFile(ruta)], { type: tipo }), basename(ruta));
  const res = await fetch(`${API}/assets`, {
    method: 'POST',
    headers: { 'x-api-key': apiKey },
    body: form,
  });
  const json = await res.json();
  const id: string | undefined = json.data?.asset_id;
  if (!res.ok || !id) salir(`Error al subir ${ruta} (${res.status}): ${JSON.stringify(json).slice(0, 500)}`);
  console.log(`⬆️  Subido ${ruta}`);
  return id;
}

// 1 y 2) Subir imagen y audio
const imagenId = await subir(imagen, tipoImagen(imagen));
const audioId = await subir(audio, 'audio/mpeg');

// 3) Crear el video
const resVideo = await fetch(`${API}/videos`, {
  method: 'POST',
  headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'image',
    image: { type: 'asset_id', asset_id: imagenId },
    audio_asset_id: audioId,
    aspect_ratio: 'auto',
    resolution: '720p',
    title: `${values.serie}-escena${values.escena}`,
  }),
});
const jsonVideo = await resVideo.json();
const videoId: string | undefined = jsonVideo.data?.video_id;
if (!resVideo.ok || !videoId) {
  salir(`Error al crear el video (${resVideo.status}): ${JSON.stringify(jsonVideo).slice(0, 500)}`);
}
console.log(`🎬 Video en proceso (id: ${videoId}). Revisando cada 10 segundos...`);

// 4) Esperar a que termine y descargar
const limite = Date.now() + ESPERA_MAXIMA_MIN * 60_000;
while (Date.now() < limite) {
  await new Promise((r) => setTimeout(r, 10_000));
  const res = await fetch(`${API}/videos/${videoId}`, { headers: { 'x-api-key': apiKey } });
  const json = await res.json();
  const d = json.data ?? json;
  console.log(`   estado: ${d.status}`);

  if (d.status === 'completed') {
    if (!d.video_url) salir(`Terminó, pero no encontré video_url. Respuesta: ${JSON.stringify(json).slice(0, 800)}`);
    const mp4 = await fetch(d.video_url);
    await writeFile(salida, Buffer.from(await mp4.arrayBuffer()));
    console.log(`✅ Video guardado en ${salida}`);
    process.exit(0);
  }
  if (d.status === 'failed') salir(`Falló: ${d.failure_message ?? JSON.stringify(json).slice(0, 800)}`);
}

salir(`Pasaron ${ESPERA_MAXIMA_MIN} minutos sin terminar. El video sigue en HeyGen con id ${videoId}.`);
