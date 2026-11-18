---
name: carrusel
description: Crea carruseles y posts de imagen para Instagram en español o inglés, con los textos de cada lámina, las imágenes de fondo y los archivos listos para subir (1080×1350). Usar cuando pidan un carrusel, láminas, slides, un post o una imagen para el feed. No usar para videos, Reels ni historias.
when_to_use: Frases como haz un carrusel, arma las láminas, crea un post, una imagen para el feed, make a carousel, convierte esto en carrusel.
argument-hint: "[tema del carrusel o post]"
---

# Carrusel o post: de la idea a las imágenes

Quien usa esto no es desarrolladora. Háblale en español sencillo, aunque el contenido sea en inglés,
y nunca le pidas que toque código ni ejecute comandos.

## Reglas que no se rompen

1. **Antes de generar fondos**, di cuántos son y el costo aproximado, y **espera su OK**.
2. **Nunca leas ni muestres el archivo `.env`.**
3. **Nunca uses `--reemplazar`** sin que ella lo pida: borra algo que ya se pagó.
4. Ejecuta los comandos desde la carpeta raíz del proyecto.
5. Si algo falla, explícalo en palabras simples. Si no sabes qué pasa, díselo.

## Costos aproximados

| Paso | Costo |
|---|---|
| Fondo con IA (OpenRouter) | ~0.07 USD por imagen |
| Lámina con color de la marca, sin imagen | gratis |
| Poner el texto sobre las láminas | gratis |

Una imagen puede servir de fondo para varias láminas: copia el archivo con el nombre de cada lámina.

## El flujo

### 1. Planear con ella
Confirma marca, idioma, tema y nombre de la pieza. Lee `marcas/<marca>/marca.md` y mira
`marcas/<marca>/ejemplos/` si tiene algo: imita su estilo. Si faltan colores en la ficha, pídeselos
o ofrece leer la landing con la skill `marca`.

### 2. Escribir las láminas
Si ella trae el texto de ChatGPT, revísalo y propón mejoras: no lo reemplaces sin su OK.

- **Carrusel:** de 6 a 10 láminas.
  1. Portada: gancho de máximo 6 palabras (ver `guias/ganchos.md`).
  2. Por qué importa, en una frase.
  3. Una idea por lámina: título de 3 a 7 palabras y máximo 25 palabras debajo.
  4. Penúltima: resumen que se entienda sola.
  5. Última: una sola petición al público.
- **Post:** una lámina con una sola idea.

Aplica la regla de los datos de `guias/revisar-guion.md`. Muéstrale la lista de láminas y espera su
OK **antes de generar nada**.

### 3. Crear los fondos (si los quiere)
```
node --env-file=.env scripts/generar-fondo.ts --pieza "<pieza>" --lamina <número> --descripcion "<descripción en inglés>" --formato 4:5
```
- Escribe la descripción en inglés. Si sale un personaje, agrega su imagen con `--referencia "<ruta>"`.
- Una lámina sin fondo usa el color de la marca. Mira cada imagen y pídele que la revise.

### 4. Armar las láminas (gratis)
Crea `piezas/<pieza>/pieza.json`, con los datos de `marca.md`:

```json
{
  "tipo": "carrusel",
  "cuenta": "@cuenta",
  "logo": "marcas/<marca>/logo.png",
  "fuente": "Arial, sans-serif",
  "colores": { "fondo": "#000000", "texto": "#FFFFFF", "acento": "#FF0000" },
  "laminas": [
    { "titulo": "Portada", "texto": "Línea opcional", "posicion": "centro" }
  ]
}
```

- `tipo`: `carrusel` o `post`. `posicion`: `arriba`, `centro` o `abajo`.
- `alinear`: `izquierda` o `centro`. `velo`: pon `false` si el fondo ya deja espacio limpio para el
  texto; si no, la imagen se oscurece para que se pueda leer.
- `cuenta`, `logo` y `fuente` son opcionales: si no están confirmados, no los pongas.

```
node scripts/componer.ts --pieza "<pieza>"
```

**Mira cada imagen** de `piezas/<pieza>/final/`: que el texto entre, se lea bien y no tape algo
importante. Corrige `pieza.json`, vuelve a armar y luego muéstraselas.

### 5. Entregar
Dile dónde están las imágenes y el costo total. Ofrece el texto de la publicación con la skill
`publicacion`. Ella publica en Instagram.

## Si no le gusta o quiere cambiar algo

Siempre se puede cambiar: pregúntale qué no le gustó y cambia solo eso.

- **Textos, colores, orden o posición (gratis):** corrige `pieza.json` y vuelve a armar. Para quitar
  una lámina, cambia también el nombre de los fondos que siguen, para que cada uno quede con su lámina.
- **Imagen (cuesta otra vez):** di el costo, espera su OK y repite el paso 3 con `--reemplazar`,
  explicando en la descripción qué debe cambiar.
- **Volver a una imagen anterior (gratis):** las reemplazadas quedan en `fondos/anteriores/`. Cópiala
  a `fondos/` con el nombre de la lámina y vuelve a armar.

Si después de dos intentos una imagen sigue sin gustarle, díselo y propón otra idea en vez de seguir gastando.

## Problemas comunes

| Mensaje | Qué hacer |
|---|---|
| "Necesito Microsoft Edge o Google Chrome" | Que instale uno de los dos |
| "No encontré el logo" | Revisar la ruta en `pieza.json`, o quitar `logo` |
| OpenRouter `400` con el formato | Decírselo: ese formato no fue aceptado. No gastes reintentando |
| OpenRouter `402` | Falta saldo en openrouter.ai/settings/credits |
| "ya existe" | Otro número de lámina, o `--reemplazar` solo con su OK |
