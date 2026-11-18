// Funciones compartidas por todos los scripts
import { mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

export interface CarpetasSerie {
  raiz: string;
  personajes: string;
  voces: string;
  videos: string;
  final: string;
}

// Muestra el error y termina el script
export function salir(mensaje: string): never {
  console.log(`❌ ${mensaje}`);
  process.exit(1);
}

// Convierte un nombre libre en un nombre de archivo seguro: "Doña Ana" -> "dona-ana"
export function slug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function claveRequerida(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) salir(`Falta ${nombre} en el .env (¿ejecutaste con --env-file=.env?)`);
  return valor;
}

// Crea (si no existen) y devuelve las carpetas de una serie
export async function prepararSerie(serie: string): Promise<CarpetasSerie> {
  const raiz = join('series', slug(serie));
  const carpetas: CarpetasSerie = {
    raiz,
    personajes: join(raiz, 'personajes'),
    voces: join(raiz, 'voces'),
    videos: join(raiz, 'videos'),
    final: join(raiz, 'final'),
  };
  for (const ruta of Object.values(carpetas)) await mkdir(ruta, { recursive: true });
  return carpetas;
}

export interface CarpetasPieza {
  raiz: string;
  fondos: string;
  final: string;
}

// Crea (si no existen) y devuelve las carpetas de un carrusel, post o historia
export async function prepararPieza(pieza: string): Promise<CarpetasPieza> {
  const raiz = join('piezas', slug(pieza));
  const carpetas: CarpetasPieza = {
    raiz,
    fondos: join(raiz, 'fondos'),
    final: join(raiz, 'final'),
  };
  for (const ruta of Object.values(carpetas)) await mkdir(ruta, { recursive: true });
  return carpetas;
}

// Evita sobrescribir por accidente algo que ya costó dinero generar
export function protegerArchivo(ruta: string, reemplazar: boolean | undefined): void {
  if (existsSync(ruta) && !reemplazar) {
    salir(`${ruta} ya existe. Usa --reemplazar si de verdad quieres generarlo de nuevo.`);
  }
}

const EXTENSIONES_IMAGEN = ['.png', '.jpg', '.jpeg', '.webp'];

export function tipoImagen(ruta: string): string {
  const r = ruta.toLowerCase();
  if (r.endsWith('.png')) return 'image/png';
  if (r.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

// Busca la imagen de un personaje en la carpeta personajes/ de la serie
export async function buscarPersonaje(carpeta: string, personaje: string): Promise<string> {
  const nombre = slug(personaje);
  const archivos = await readdir(carpeta);
  const encontrado = archivos.find((f) =>
    EXTENSIONES_IMAGEN.some((ext) => f.toLowerCase() === `${nombre}${ext}`),
  );
  if (!encontrado) {
    const disponibles = archivos.filter((f) => EXTENSIONES_IMAGEN.some((ext) => f.toLowerCase().endsWith(ext)));
    salir(
      `No encontré el personaje "${personaje}" en ${carpeta}. Disponibles: ${disponibles.join(', ') || '(ninguno)'}`,
    );
  }
  return join(carpeta, encontrado);
}

// Duración en segundos de un audio o video (usa ffprobe, que viene con FFmpeg)
export function duracionSegundos(ruta: string): number {
  const salida = execFileSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', ruta],
    { encoding: 'utf8' },
  );
  return Number.parseFloat(salida.trim());
}

// Costo observado en la prueba del 30/10/2026: 14.5 s de video costaron ~$0.55
export const HEYGEN_USD_POR_SEGUNDO = 0.04;
