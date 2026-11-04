---
name: historia
description: Crea historias de Instagram (Stories) en español o inglés, con la secuencia de pantallas, el sticker de cada una y las imágenes listas para subir (1080×1920). Usar cuando pidan historias, stories o una secuencia para historias. No usar para Reels, videos, carruseles ni posts del feed.
when_to_use: Frases como haz las historias de hoy, crea una historia, qué subo a stories, una encuesta para historias, make stories.
argument-hint: "[tema de las historias]"
---

# Historias: la secuencia del día

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
| Pantalla con color de la marca, sin imagen | gratis |
| Poner el texto sobre las pantallas | gratis |

Si una pantalla necesita un personaje que habla, se hace como escena con la skill `mini-serie`.

## El flujo

### 1. Planear con ella
Confirma marca, idioma, tema y nombre de la pieza. Lee `marcas/<marca>/marca.md` y mira
`marcas/<marca>/ejemplos/` si tiene algo: imita su estilo.

### 2. Escribir la secuencia
Si ella trae el texto de ChatGPT, revísalo y propón mejoras: no lo reemplaces sin su OK.

De 3 a 7 pantallas, con una idea por pantalla:

1. **Apertura:** algo concreto que llame la atención, de preferencia con una persona.
2. **Medio:** el contenido, en una o dos pantallas.
3. **Petición:** un solo sticker, antes del final.
4. **Cierre:** la respuesta, el resultado o lo que viene mañana.

| Sticker | Para qué sirve |
|---|---|
| Encuesta | Muchas respuestas con un toque |
| Preguntas | Conocer las palabras exactas del público |
| Quiz | Enseñar algo que muchos creen mal |
| Enlace | Llevar a la landing |
| Cuenta regresiva | Anunciar una fecha |

Aplica la regla de los datos de `guias/revisar-guion.md`. Muéstrale la secuencia y espera su OK
**antes de generar nada**.

### 3. Crear los fondos (si los quiere)
```
node --env-file=.env scripts/generar-fondo.ts --pieza "<pieza>" --lamina <número> --descripcion "<descripción en inglés>" --formato 9:16
```
Escribe la descripción en inglés. Si sale un personaje, agrega su imagen con `--referencia "<ruta>"`.
Mira cada imagen y pídele que la revise.

### 4. Armar las pantallas (gratis)
Crea `piezas/<pieza>/pieza.json`, con los datos de `marca.md`:

```json
{
  "tipo": "historia",
  "logo": "marcas/<marca>/logo.png",
  "fuente": "Arial, sans-serif",
  "colores": { "fondo": "#000000", "texto": "#FFFFFF", "acento": "#FF0000" },
  "laminas": [
    { "titulo": "Texto grande", "texto": "Texto opcional", "posicion": "arriba" }
  ]
}
```

`logo` y `fuente` son opcionales: si no están confirmados, no los pongas. En la pantalla con sticker
usa `posicion` `arriba`, para dejar espacio. El texto queda dentro de la zona que no tapa Instagram.
También puedes usar `alinear` (`izquierda` o `centro`) y `velo`: pon `false` si el fondo ya deja
espacio limpio para el texto; si no, la imagen se oscurece para que se pueda leer.

```
node scripts/componer.ts --pieza "<pieza>"
```

**Mira cada imagen** de `piezas/<pieza>/final/`. Corrige `pieza.json` si hace falta, vuelve a armar y
luego muéstraselas.

### 5. Entregar
Dile dónde están las imágenes y dale esta lista: pantalla por pantalla, qué sticker agregar y con qué
texto. **Los stickers se ponen a mano en Instagram:** las imágenes no los traen. Ella publica.

## Si no le gusta o quiere cambiar algo

Siempre se puede cambiar: pregúntale qué no le gustó y cambia solo eso.

- **Textos, colores, orden o posición (gratis):** corrige `pieza.json` y vuelve a armar. Para quitar
  una pantalla, cambia también el nombre de los fondos que siguen, para que cada uno quede con la suya.
- **Imagen (cuesta otra vez):** di el costo, espera su OK y repite el paso 3 con `--reemplazar`,
  explicando en la descripción qué debe cambiar.
- **Volver a una imagen anterior (gratis):** las reemplazadas quedan en `fondos/anteriores/`. Cópiala
  a `fondos/` con el nombre de la pantalla y vuelve a armar.

Si después de dos intentos una imagen sigue sin gustarle, díselo y propón otra idea en vez de seguir gastando.

## Problemas comunes

| Mensaje | Qué hacer |
|---|---|
| "Necesito Microsoft Edge o Google Chrome" | Que instale uno de los dos |
| "No encontré el logo" | Revisar la ruta en `pieza.json`, o quitar `logo` |
| OpenRouter `402` | Falta saldo en openrouter.ai/settings/credits |
| "ya existe" | Otro número de pantalla, o `--reemplazar` solo con su OK |
