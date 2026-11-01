// Muestra las voces disponibles en la cuenta de ElevenLabs
// Uso: node --env-file=.env scripts/listar-voces.ts
import { claveRequerida, salir } from './lib/comun.ts';

interface Voz {
  voice_id: string;
  name: string;
  labels?: Record<string, string>;
}

const apiKey = claveRequerida('API_KEY_ELEVENLABS');

const res = await fetch('https://api.elevenlabs.io/v1/voices', {
  headers: { 'xi-api-key': apiKey },
});
if (!res.ok) salir(`Error ${res.status}: ${(await res.text()).slice(0, 300)}`);

const { voices } = (await res.json()) as { voices: Voz[] };
console.log(`🎙️  ${voices.length} voces en la cuenta:\n`);
for (const v of voices) {
  const etiquetas = Object.values(v.labels ?? {}).filter(Boolean).join(', ');
  console.log(`- ${v.name}${etiquetas ? `  (${etiquetas})` : ''}`);
}
