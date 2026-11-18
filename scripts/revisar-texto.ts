// Revisa un guion o el texto de una publicación antes de gastar o publicar (gratis, no usa internet)
// Son avisos para decidir, no reglas: cada aviso lo revisa Claude junto con ella
// Uso:
//   node scripts/revisar-texto.ts --archivo <ruta> --idioma es|en --tipo guion|publicacion [--limpiar]
// En un guion, cada párrafo (separado por una línea vacía) es una escena
import { readFile, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { salir } from './lib/comun.ts';

type Idioma = 'es' | 'en';

// Medido en la prueba: 13 palabras en español duraron 5.1 s (~150 por minuto). El inglés es una estimación
const PALABRAS_POR_MINUTO: Record<Idioma, number> = { es: 150, en: 165 };
const SEGUNDOS_GANCHO = 3;
const SEGUNDOS_ESCENA = 20;
const CARACTERES_VISIBLES = 125;
const CARACTERES_MAXIMOS = 2200;
const HASHTAGS_MAXIMOS = 5;

const INVISIBLES = /[­᠎​-‏‪-‮⁠-⁤﻿]/g;
const ESPACIOS_RAROS = /[   ]/g;

const SALUDOS: Record<Idioma, RegExp> = {
  es: /^\s*(hola|hey|buenas|bienvenid|en este video|hoy (te|les) voy)/i,
  en: /^\s*(hi\b|hello|hey guys|welcome|in this video|today i)/i,
};

const PROMESAS: Record<Idioma, RegExp> = {
  es: /garantiz\p{L}*|sin riesgo|nunca más|el mejor|la mejor|número uno|(?<!\p{L})gan(a|as|ar|arás|é|amos)(?!\p{L})/giu,
  en: /guarante\w*|risk[- ]free|never again|the best|number one|\bearn(s|ed|ing)?\b/gi,
};

const PETICIONES: Record<Idioma, RegExp[]> = {
  es: [/\bcomenta\b/i, /\bguarda\b/i, /\bcomparte\b/i, /\bescr[ií]be(me|nos)\b/i, /\bs[ií]gue(me|nos)\b/i, /\bdescarga\b/i, /\b(link|enlace) en (la |nuestra |mi )?bio\b/i],
  en: [/\bcomment\b/i, /\bsave (this|it)\b/i, /\bshare\b/i, /\b(dm|message) (me|us)\b/i, /\bfollow (me|us)\b/i, /\bdownload\b/i, /\blink in (the |our |my )?bio\b/i],
};

const HASHTAGS_VACIOS = ['#viral', '#fyp', '#foryou', '#explorepage', '#parati'];

const { values } = parseArgs({
  options: {
    archivo: { type: 'string' },
    idioma: { type: 'string' },
    tipo: { type: 'string' },
    limpiar: { type: 'boolean' },
  },
});

const { archivo, tipo } = values;
const idioma = values.idioma as Idioma;
if (!archivo || !tipo || (idioma !== 'es' && idioma !== 'en')) {
  salir('Faltan datos. Uso: --archivo <ruta> --idioma es|en --tipo guion|publicacion [--limpiar]');
}
if (tipo !== 'guion' && tipo !== 'publicacion') salir('El tipo debe ser guion o publicacion.');

let texto = '';
try {
  texto = await readFile(archivo, 'utf8');
} catch {
  salir(`No pude leer ${archivo}`);
}

const avisos: string[] = [];

// Caracteres que no se ven: suelen venir pegados desde otras herramientas
const invisibles = (texto.match(INVISIBLES) ?? []).length + (texto.match(ESPACIOS_RAROS) ?? []).length;
if (invisibles > 0 && values.limpiar) {
  texto = texto.replace(INVISIBLES, '').replace(ESPACIOS_RAROS, ' ');
  await writeFile(archivo, texto);
  console.log(`🧹 Quité ${invisibles} caracteres invisibles de ${archivo}`);
} else if (invisibles > 0) {
  avisos.push(`Tiene ${invisibles} caracteres invisibles. Usa --limpiar para quitarlos.`);
}

const rayas = (texto.match(/—/g) ?? []).length;
if (rayas > 0) avisos.push(`Tiene ${rayas} raya(s) larga(s) (—), típicas de textos hechos con IA.`);

// Frases que delatan un texto hecho con IA. La lista se puede editar en guias/frases-ia.json
const listas = JSON.parse(await readFile('guias/frases-ia.json', 'utf8')) as Record<Idioma, string[]>;
const textoRecto = texto.replace(/[’‘]/g, "'");
const frases = listas[idioma].filter((frase) => {
  const escapada = frase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<!\\p{L})${escapada}(?!\\p{L})`, 'iu').test(textoRecto);
});
if (frases.length > 0) avisos.push(`Frases que suenan a IA: ${frases.join(' | ')}`);

// Cifras y promesas: hay que confirmar que sean reales antes de ponerlas en boca de un personaje
const cifras = texto.match(/[$€]\s?\d[\d.,]*|\d[\d.,]*\s?(%|usd|dólares|dollars)/gi) ?? [];
const promesas = texto.match(PROMESAS[idioma]) ?? [];
const porConfirmar = [...new Set([...cifras, ...promesas].map((t) => t.trim().toLowerCase()))];
if (porConfirmar.length > 0) avisos.push(`Confirmar que sea real: ${porConfirmar.join(' | ')}`);

function segundos(frase: string): number {
  const palabras = frase.split(/\s+/).filter(Boolean).length;
  return (palabras / PALABRAS_POR_MINUTO[idioma]) * 60;
}

if (tipo === 'guion') {
  const escenas = texto
    .split(/\r?\n\s*\r?\n/)
    .map((e) => e.replace(/^\s*(escena|scene)\s*\d+\s*[:.\-]?\s*/i, '').trim())
    .filter(Boolean);
  if (escenas.length === 0) salir('El guion está vacío.');

  console.log(`🎬 ${escenas.length} escena(s), estimado a ${PALABRAS_POR_MINUTO[idioma]} palabras por minuto:`);
  let total = 0;
  escenas.forEach((escena, i) => {
    const duracion = segundos(escena);
    total += duracion;
    console.log(`   Escena ${i + 1}: ~${duracion.toFixed(1)} s | ${escena.slice(0, 60)}`);
    if (duracion > SEGUNDOS_ESCENA) avisos.push(`La escena ${i + 1} dura más de ${SEGUNDOS_ESCENA} s: conviene dividirla.`);
  });
  console.log(`   Total: ~${total.toFixed(1)} s`);

  const gancho = escenas[0].split(/(?<=[.!?])\s/)[0];
  const duracionGancho = segundos(gancho);
  console.log(`🪝 Gancho (~${duracionGancho.toFixed(1)} s): ${gancho}`);
  if (duracionGancho > SEGUNDOS_GANCHO) avisos.push(`El gancho dura más de ${SEGUNDOS_GANCHO} s: conviene acortarlo.`);
  if (SALUDOS[idioma].test(escenas[0])) avisos.push('Empieza con un saludo o una introducción: mejor abrir directo con el gancho.');
} else {
  const limpio = texto.trim();
  const visible = limpio.slice(0, CARACTERES_VISIBLES);
  console.log(`👀 Lo que se ve antes de "más":\n   ${visible.replace(/\s*\n\s*/g, ' / ')}`);
  console.log(`📏 ${limpio.length} de ${CARACTERES_MAXIMOS} caracteres`);
  if (limpio.length > CARACTERES_MAXIMOS) avisos.push(`Pasa el máximo de ${CARACTERES_MAXIMOS} caracteres.`);
  if (SALUDOS[idioma].test(limpio)) avisos.push('Empieza con un saludo o una introducción: mejor abrir directo con la idea.');
  if (/^(#|\p{Extended_Pictographic})/u.test(limpio)) avisos.push('Empieza con un hashtag o un emoji: mejor abrir con palabras.');

  const hashtags = limpio.match(/(?<![\p{L}\p{N}])#[\p{L}\p{N}_]+/gu) ?? [];
  console.log(`# ${hashtags.length} hashtag(s): ${hashtags.join(' ') || '(ninguno)'}`);
  if (hashtags.length > HASHTAGS_MAXIMOS) avisos.push(`Tiene más de ${HASHTAGS_MAXIMOS} hashtags.`);
  const vacios = hashtags.filter((h) => HASHTAGS_VACIOS.includes(h.toLowerCase()));
  if (vacios.length > 0) avisos.push(`Hashtags que no describen nada: ${vacios.join(' ')}`);

  if (/https?:\/\/|www\./i.test(limpio)) avisos.push('Tiene un enlace: en Instagram no se puede tocar. Mejor en la bio.');

  const peticiones = PETICIONES[idioma].filter((p) => p.test(limpio)).length;
  if (peticiones === 0) avisos.push('No le pide nada al público (comentar, guardar, escribir…).');
  if (peticiones > 1) avisos.push(`Le pide ${peticiones} cosas distintas al público: mejor una sola.`);
}

if (avisos.length === 0) {
  console.log('✅ Sin avisos');
} else {
  console.log(`⚠️  ${avisos.length} aviso(s):`);
  for (const aviso of avisos) console.log(`   - ${aviso}`);
}
