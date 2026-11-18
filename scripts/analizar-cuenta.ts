// Compara las estadísticas generales de la cuenta entre períodos (gratis, no usa internet)
// Lee marcas/<marca>/resultados-estadisticas/cuenta.json. Los datos los anota Claude desde las capturas
// Uso: node scripts/analizar-cuenta.ts --marca <marca>
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { salir, slug } from './lib/comun.ts';

const DATOS = {
  alcance: 'Alcance',
  visualizaciones: 'Visualizaciones',
  interacciones: 'Interacciones',
  seguidores_total: 'Seguidores totales',
  seguidores_nuevos: 'Seguidores nuevos',
  seguidores_perdidos: 'Seguidores perdidos',
  visitas_perfil: 'Visitas al perfil',
  clics_enlace: 'Clics en el enlace',
} as const;

type Dato = keyof typeof DATOS;

type Periodo = { nombre: string; desde: string; hasta: string } & Partial<Record<Dato, number | null>>;

const { values } = parseArgs({
  options: { marca: { type: 'string' } },
});
if (!values.marca) salir('Falta la marca. Uso: node scripts/analizar-cuenta.ts --marca <marca>');

const ruta = join('marcas', slug(values.marca), 'resultados-estadisticas', 'cuenta.json');
if (!existsSync(ruta)) salir(`Todavía no hay estadísticas generales registradas en ${ruta}`);

let periodos: Periodo[] = [];
try {
  periodos = JSON.parse(await readFile(ruta, 'utf8')) as Periodo[];
} catch {
  salir(`${ruta} tiene un error de formato.`);
}
if (periodos.length === 0) salir('Todavía no hay períodos registrados.');

function dias(periodo: Periodo): number {
  return Math.round((Date.parse(periodo.hasta) - Date.parse(periodo.desde)) / 86_400_000) + 1;
}

function saldo(periodo: Periodo): number | null {
  const { seguidores_nuevos: nuevos, seguidores_perdidos: perdidos } = periodo;
  return nuevos == null || perdidos == null ? null : nuevos - perdidos;
}

const orden = [...periodos].sort((a, b) => a.hasta.localeCompare(b.hasta));
const actual = orden[orden.length - 1];
const anterior = orden[orden.length - 2];

console.log(`📅 ${orden.length} período(s) registrado(s). Último: ${actual.nombre} (${actual.desde} a ${actual.hasta})`);

if (!anterior) {
  for (const [dato, etiqueta] of Object.entries(DATOS)) {
    console.log(`   ${etiqueta}: ${actual[dato as Dato] ?? '-'}`);
  }
  console.log('⚠️  Con un solo período todavía no se puede comparar.');
  process.exit(0);
}

console.log(`🔎 Comparado con ${anterior.nombre} (${anterior.desde} a ${anterior.hasta}):`);
// Hasta 3 días de diferencia es normal: los meses no duran lo mismo
if (Math.abs(dias(actual) - dias(anterior)) > 3) {
  console.log(`⚠️  Los períodos no duran lo mismo (${dias(actual)} y ${dias(anterior)} días): compara con cuidado.`);
}

function comparar(etiqueta: string, ahora: number | null | undefined, antes: number | null | undefined): void {
  if (ahora == null || antes == null) {
    console.log(`   ${etiqueta}: ${ahora ?? '-'} (antes ${antes ?? '-'}), sin comparación`);
    return;
  }
  const cambio = ahora - antes;
  const signo = cambio > 0 ? '+' : '';
  const porcentaje = antes === 0 ? '' : ` (${signo}${((cambio / Math.abs(antes)) * 100).toFixed(1)}%)`;
  console.log(`   ${etiqueta}: ${ahora} (antes ${antes}) | ${signo}${cambio}${porcentaje}`);
}

for (const [dato, etiqueta] of Object.entries(DATOS)) {
  comparar(etiqueta, actual[dato as Dato], anterior[dato as Dato]);
}
comparar('Saldo de seguidores', saldo(actual), saldo(anterior));

if (orden.length < 3) console.log('⚠️  Con dos períodos se ve el cambio, pero todavía no una tendencia.');
