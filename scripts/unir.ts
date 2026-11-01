// Une todas las escenas de una serie (en orden) en un solo video vertical en final/<serie>.mp4
// Uso: node scripts/unir.ts --serie <serie>
import { readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { prepararSerie, salir, slug } from './lib/comun.ts';

const { values } = parseArgs({
  options: { serie: { type: 'string' } },
});
if (!values.serie) salir('Falta la serie. Uso: node scripts/unir.ts --serie <serie>');

const carpetas = await prepararSerie(values.serie);
const salida = join(carpetas.final, `${slug(values.serie)}.mp4`);

const clips = (await readdir(carpetas.videos))
  .filter((f) => /^escena\d+\.mp4$/i.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

if (clips.length === 0) salir(`No hay escenas (escena1.mp4, escena2.mp4…) en ${carpetas.videos}`);
console.log(`🎞️  Uniendo ${clips.length} escena(s): ${clips.join(', ')}`);

// Cada clip se lleva al mismo formato (1080x1920, 30 fps, audio estéreo 48 kHz) para poder unirlos
const entradas = clips.flatMap((c) => ['-i', join(carpetas.videos, c)]);
const filtros = clips
  .map(
    (_, i) =>
      `[${i}:v]scale=1080:1920:force_original_aspect_ratio=decrease,` +
      `pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v${i}];` +
      `[${i}:a]aresample=48000,aformat=channel_layouts=stereo[a${i}]`,
  )
  .join(';');
const pares = clips.map((_, i) => `[v${i}][a${i}]`).join('');
const filtro = `${filtros};${pares}concat=n=${clips.length}:v=1:a=1[v][a]`;

try {
  execFileSync(
    'ffmpeg',
    [
      '-y', '-v', 'error',
      ...entradas,
      '-filter_complex', filtro,
      '-map', '[v]', '-map', '[a]',
      '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '192k',
      '-movflags', '+faststart',
      salida,
    ],
    { stdio: 'inherit' },
  );
} catch {
  salir('FFmpeg falló (mira el mensaje de arriba)');
}

console.log(`✅ Video final guardado en ${salida}`);
