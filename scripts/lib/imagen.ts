// Pide una imagen a Nano Banana 2 (OpenRouter). La usan generar-imagen.ts y generar-fondo.ts
import { readFile } from 'node:fs/promises';
import { salir, tipoImagen } from './comun.ts';

interface ImagenGenerada {
  b64_json: string;
  media_type?: string;
}

interface RespuestaImagen {
  data: ImagenGenerada[];
  usage?: { cost?: number };
}

export interface ImagenLista {
  contenido: Buffer;
  extension: string;
  costo: number | undefined;
}

export async function pedirImagen(
  apiKey: string,
  prompt: string,
  formato: string,
  referencias: string[],
): Promise<ImagenLista> {
  // Las imágenes de referencia ayudan a que un personaje o un estilo se vea igual (máximo 14)
  if (referencias.length > 14) salir('OpenRouter acepta como máximo 14 imágenes de referencia.');
  const inputReferences = await Promise.all(
    referencias.map(async (ruta) => ({
      type: 'image_url',
      image_url: { url: `data:${tipoImagen(ruta)};base64,${(await readFile(ruta)).toString('base64')}` },
    })),
  );

  const res = await fetch('https://openrouter.ai/api/v1/images', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3.1-flash-image',
      prompt,
      aspect_ratio: formato,
      resolution: '1K',
      n: 1,
      ...(inputReferences.length > 0 && { input_references: inputReferences }),
    }),
  });

  if (!res.ok) salir(`Error ${res.status}: ${(await res.text()).slice(0, 500)}`);

  const datos = (await res.json()) as RespuestaImagen;
  const img = datos.data[0];
  if (!img) salir('La respuesta no trajo ninguna imagen');

  return {
    contenido: Buffer.from(img.b64_json, 'base64'),
    extension: (img.media_type ?? 'image/png').split('/')[1],
    costo: datos.usage?.cost,
  };
}
