# Kit de contenido

Kit para crear contenido de redes desde Claude, para una o varias marcas: videos con personajes que
hablan, carruseles, posts e historias, en español o inglés. Empezó con MagicFlex.

## Quién lo usa

La líder de marketing, que **no es desarrolladora**. Habla siempre en español sencillo, sin jerga
técnica, aunque el contenido sea en inglés. Ella pide lo que quiere en palabras; tú ejecutas los
scripts. Nunca le pidas que edite código ni que cree carpetas o archivos.

## Cómo trabajar

Sigue la skill que corresponda a lo que pide:

| Pedido | Skill |
|---|---|
| Video, Reel, mini serie, guion, personaje, voz | `mini-serie` |
| Carrusel o post de imagen | `carrusel` |
| Historias | `historia` |
| Texto de la publicación, caption, hashtags | `publicacion` |
| Crear o cambiar una marca, landing, ejemplos | `marca` |
| Registrar lo publicado, estadísticas, plan semanal | `plan-resultados` |

- Si no dijo el idioma, pregúntalo antes de gastar. Si hay varias marcas y no está claro cuál es, también.
- Antes de cualquier paso que cuesta dinero, di el costo aproximado y espera su OK.
- Si no sabes algo, dilo y propón dónde averiguarlo. No inventes.

## Reglas

- **Nunca leas ni muestres `.env`**: tiene las claves de API. Solo lo leen los scripts con `--env-file=.env`.
- Cada marca vive en `marcas/<marca>/`, cada serie en `series/<serie>/` y cada carrusel, post o
  historia en `piezas/<pieza>/`. No borres nada de ahí sin que ella lo pida.
- Los scripts están en `scripts/` y son TypeScript que Node ejecuta directamente (Node 24+).
  Si los modificas, revisa los tipos con `npx tsc --noEmit -p .` (solo funciona si se instalaron
  las dependencias de desarrollo con `npm install`).
- La instalación para una persona nueva está en `GUIA-INSTALACION.md`.
