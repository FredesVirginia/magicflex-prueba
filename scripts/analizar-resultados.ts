// Calcula qué funcionó mejor en las publicaciones de una marca (gratis, no usa internet)
// Lee marcas/<marca>/resultados-estadisticas/publicaciones.json. Los datos los anota Claude desde las capturas
// Uso: node scripts/analizar-resultados.ts --marca <marca>
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { salir, slug } from './lib/comun.ts';

interface Publicacion {
  fecha: string;
  titulo: string;
  formato: string;
  idioma?: string;
  gancho?: string;
  vistas?: number | null;
  alcance?: number | null;
  no_seguidores_pct?: number | null;
  retencion_3s_pct?: number | null;
  compartidos?: number | null;
  guardados?: number | null;
  comentarios?: number | null;
  seguidores_nuevos?: number | null;
}

interface Medida {
  pub: Publicacion;
  vistas: number;
  veces: number;
  compartidosPorMil: number | null;
  seguidoresPorMil: number | null;
}

const MINIMO_POR_FORMATO = 3;
const MINIMO_POR_GRUPO = 3;
const CUANTAS_EN_RANKING = 5;

const { values } = parseArgs({
  options: { marca: { type: 'string' } },
});
if (!values.marca) salir('Falta la marca. Uso: node scripts/analizar-resultados.ts --marca <marca>');

const ruta = join('marcas', slug(values.marca), 'resultados-estadisticas', 'publicaciones.json');
if (!existsSync(ruta)) salir(`Todavía no hay publicaciones registradas en ${ruta}`);

let publicaciones: Publicacion[] = [];
try {
  publicaciones = JSON.parse(await readFile(ruta, 'utf8')) as Publicacion[];
} catch {
  salir(`${ruta} tiene un error de formato.`);
}

function mediana(numeros: number[]): number {
  const orden = [...numeros].sort((a, b) => a - b);
  const mitad = Math.floor(orden.length / 2);
  return orden.length % 2 ? orden[mitad] : (orden[mitad - 1] + orden[mitad]) / 2;
}

// Cuántas veces ocurrió algo por cada 1,000 personas alcanzadas
function porMil(cantidad: number | null | undefined, alcance: number | null | undefined): number | null {
  if (cantidad == null || !alcance) return null;
  return (cantidad / alcance) * 1000;
}

function numero(valor: number | null, decimales = 1): string {
  return valor === null ? '-' : valor.toFixed(decimales);
}

const conVistas = publicaciones.filter((p) => typeof p.vistas === 'number');
const sinDatos = publicaciones.length - conVistas.length;

console.log(`📊 ${publicaciones.length} publicación(es) registrada(s), ${conVistas.length} con resultados`);
if (sinDatos > 0) console.log(`   ${sinDatos} todavía sin resultados`);
if (conVistas.length === 0) process.exit(0);

// Un Reel y una historia no alcanzan lo mismo: se comparan con su formato si hay suficientes
function vistasNormales(formato: string): number {
  const mismas = conVistas.filter((p) => p.formato === formato).map((p) => p.vistas as number);
  return mediana(mismas.length >= MINIMO_POR_FORMATO ? mismas : conVistas.map((p) => p.vistas as number));
}

const medidas: Medida[] = conVistas.map((pub) => {
  const vistas = pub.vistas as number;
  const normal = vistasNormales(pub.formato);
  return {
    pub,
    vistas,
    veces: normal > 0 ? vistas / normal : 0,
    compartidosPorMil: porMil(pub.compartidos, pub.alcance),
    seguidoresPorMil: porMil(pub.seguidores_nuevos, pub.alcance),
  };
});

const n = medidas.length;
if (n < 10) console.log('⚠️  Muy pocos datos: esto solo da pistas, no conclusiones.');
else if (n < 30) console.log('⚠️  Primeras señales: todavía hay que confirmarlas con más publicaciones.');
else console.log('✅ Ya hay datos suficientes para buscar patrones.');

function linea(m: Medida): string {
  const { pub } = m;
  return (
    `   ${m.veces.toFixed(1)}x | ${m.vistas} vistas | ${pub.formato} | ${pub.gancho ?? 'sin gancho anotado'} | ` +
    `retención 3 s: ${pub.retencion_3s_pct ?? '-'}% | no seguidores: ${pub.no_seguidores_pct ?? '-'}% | ` +
    `compartidos/1000: ${numero(m.compartidosPorMil)} | ${pub.fecha} ${pub.titulo}`
  );
}

const orden = [...medidas].sort((a, b) => b.veces - a.veces);
console.log('\n🏆 Mejores (veces sobre lo normal):');
for (const m of orden.slice(0, CUANTAS_EN_RANKING)) console.log(linea(m));

if (n > CUANTAS_EN_RANKING) {
  console.log('\n📉 Más bajas:');
  for (const m of orden.slice(-Math.min(CUANTAS_EN_RANKING, n - CUANTAS_EN_RANKING)).reverse()) console.log(linea(m));
}

function resumirPor(titulo: string, clave: (p: Publicacion) => string | undefined): void {
  const grupos = new Map<string, Medida[]>();
  for (const m of medidas) {
    const nombre = clave(m.pub) || 'sin anotar';
    grupos.set(nombre, [...(grupos.get(nombre) ?? []), m]);
  }
  console.log(`\n🔎 Por ${titulo}:`);
  const filas = [...grupos.entries()].sort(
    (a, b) => mediana(b[1].map((m) => m.veces)) - mediana(a[1].map((m) => m.veces)),
  );
  for (const [nombre, grupo] of filas) {
    const compartidos = grupo.map((m) => m.compartidosPorMil).filter((c) => c !== null);
    const aviso = grupo.length < MINIMO_POR_GRUPO ? ' (muy pocas para concluir)' : '';
    console.log(
      `   ${nombre}: ${grupo.length} publicación(es) | ${mediana(grupo.map((m) => m.vistas))} vistas | ` +
        `${mediana(grupo.map((m) => m.veces)).toFixed(1)}x | ` +
        `compartidos/1000: ${compartidos.length ? mediana(compartidos).toFixed(1) : '-'}${aviso}`,
    );
  }
}

resumirPor('formato', (p) => p.formato);
resumirPor('gancho', (p) => p.gancho);
resumirPor('idioma', (p) => p.idioma);

const seguidores = medidas.map((m) => m.seguidoresPorMil).filter((s) => s !== null);
if (seguidores.length > 0) {
  console.log(`\n👥 Seguidores nuevos por cada 1000 alcanzados (mediana): ${mediana(seguidores).toFixed(1)}`);
}
