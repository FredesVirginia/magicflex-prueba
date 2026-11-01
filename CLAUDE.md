# Mini series MagicFlex

Kit para crear mini series de video con personajes que hablan, todo desde Claude:
imagen (OpenRouter) → voz (ElevenLabs) → animación (HeyGen) → unión (FFmpeg).

## Quién lo usa

La líder de marketing, que **no es desarrolladora**. Habla siempre en español sencillo, sin jerga
técnica. Ella pide lo que quiere en palabras; tú ejecutas los scripts. Nunca le pidas que edite código.

## Cómo trabajar

- Para crear personajes, voces, escenas o videos, sigue la skill `mini-serie`
  (`.claude/skills/mini-serie/SKILL.md`): tiene el flujo, los comandos y los costos.
- Antes de cualquier paso que cuesta dinero, di el costo aproximado y espera su OK.
- Si no sabes algo, dilo y propón dónde averiguarlo. No inventes.

## Reglas

- **Nunca leas ni muestres `.env`**: tiene las claves de API. Solo lo leen los scripts con `--env-file=.env`.
- Cada serie vive en `series/<serie>/`. No borres nada de ahí sin que ella lo pida.
- Los scripts están en `scripts/` y son TypeScript que Node ejecuta directamente (Node 24+).
  Si los modificas, revisa los tipos con `npx tsc --noEmit -p .` (solo funciona si se instalaron
  las dependencias de desarrollo con `npm install`).
- La instalación para una persona nueva está en `GUIA-INSTALACION.md`.
