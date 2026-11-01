---
name: mini-serie
description: Crea mini series de video con personajes que hablan, de principio a fin. Genera la imagen del personaje (OpenRouter), la voz de cada escena (ElevenLabs), anima al personaje para que hable con esa voz (HeyGen) y une las escenas en un video vertical (FFmpeg). Usar cuando pidan crear un personaje, una escena, una voz, animar, unir escenas o hacer una mini serie o video para redes.
when_to_use: Frases como haz una mini serie, crea un personaje, haz la escena 2, cambia la voz, anima a Carlos, une las escenas, elige una voz, revisa que todo esté listo.
argument-hint: "[qué quieres crear]"
---

# Mini serie: de la idea al video final

Quien usa esto es la líder de marketing: **no es desarrolladora**. Háblale en español sencillo, sin
jerga técnica, y nunca le pidas que toque código ni que ejecute comandos: los ejecutas tú.

## Reglas que no se rompen

1. **Antes de cada paso que cuesta dinero** (imagen, voz, animación), dile qué vas a hacer y cuánto
   costará aproximadamente, y **espera su OK**. Unir escenas es gratis.
2. **Nunca leas ni muestres el archivo `.env`.** Las claves solo las leen los scripts.
3. **Nunca uses `--reemplazar`** sin que ella lo pida explícitamente: borra algo que ya se pagó.
4. Ejecuta los comandos desde la carpeta raíz del proyecto, exactamente como están abajo.
5. Si un script falla, explícale el problema en palabras simples (ver "Problemas comunes") y
   propón cómo seguir. No inventes soluciones: si no sabes qué pasa, díselo.

## Costos aproximados (medidos en la prueba de octubre 2026)

| Paso | Costo aproximado |
|---|---|
| Imagen de un personaje (OpenRouter) | ~$0.07 por imagen |
| Voz (ElevenLabs) | créditos del plan de ElevenLabs según cantidad de caracteres |
| Animación (HeyGen) | ~$0.04 por segundo de video (una escena de 10 s ≈ $0.40) |
| Unir escenas (FFmpeg) | gratis |

## Cómo se organiza

Cada mini serie tiene su carpeta en `series/<nombre-de-la-serie>/`:

```
series/<serie>/
├── personajes/   carlos.png, ana.png …
├── voces/        escena1.mp3, escena2.mp3 …
├── videos/       escena1.mp4, escena2.mp4 …
└── final/        <serie>.mp4
```

Los scripts crean las carpetas solos. El nombre de la serie y de los personajes se normaliza
(minúsculas, sin acentos ni espacios): "Doña Ana" → `dona-ana`.

## El flujo

### 0. Planear con ella
Pregúntale lo que falte y resume en una lista corta antes de gastar nada:
- nombre de la serie,
- personajes (cómo se ven),
- escenas: quién habla y qué dice en cada una (frases cortas: 5 a 20 segundos por escena),
- voz de cada personaje.

Da el costo total estimado y espera su OK.

### 1. Revisar las cuentas (gratis)
```
node --env-file=.env scripts/probar-claves.ts
```
Si alguna sale con ❌ o sin saldo, díselo antes de seguir.

### 2. Crear cada personaje
```
node --env-file=.env scripts/generar-imagen.ts --serie "<serie>" --personaje "<nombre>" --descripcion "<descripción en inglés>"
```
- Escribe la descripción **en inglés**, detallada: edad, rasgos, ropa, lugar, luz, encuadre vertical.
- HeyGen solo anima **caras humanas o parecidas a humanas**, bien visibles. Para mascotas,
  animales u objetos, avísale que este flujo no funciona todavía.
- Si ella tiene imágenes de un personaje que ya existe, agrégalas con `--referencia "<ruta>"`
  (se puede repetir, máximo 14) para que se vea igual.
- Después de generarla, **mira la imagen tú mismo** y pídele que la revise antes de seguir.
  Si no le gusta, vuelve a generarla con `--reemplazar` (con su OK, cuesta otra vez).

### 3. Elegir la voz (gratis)
Si no sabe qué voz usar, muéstrale las disponibles:
```
node --env-file=.env scripts/listar-voces.ts
```
Las etiquetas indican idioma y acento (`en`, `american`, `british`…). Para una serie en español,
recomiéndale que agregue en la web de ElevenLabs una voz en español a "Mis voces" y luego usa su nombre.

### 4. Generar la voz de cada escena
```
node --env-file=.env scripts/generar-voz.ts --serie "<serie>" --escena <número> --texto "<frase>" --voz "<nombre de la voz>"
```
- El script muestra la duración del audio y cuánto costaría animarlo: díselo antes del paso 5.
- No uses comillas dobles dentro del texto; si hacen falta, usa comillas simples.

### 5. Animar cada escena
```
node --env-file=.env scripts/animar.ts --serie "<serie>" --escena <número> --personaje "<nombre>"
```
- Tarda varios minutos por escena. Avísale y espera a que termine.
- Usa el mismo personaje en todas sus escenas para que se vea igual.

### 6. Unir las escenas (gratis)
```
node scripts/unir.ts --serie "<serie>"
```
Une `escena1.mp4`, `escena2.mp4`… en orden y deja el video final en
`series/<serie>/final/<serie>.mp4` (vertical 1080×1920). No agrega música ni transiciones:
eso ella lo hace después en CapCut o Canva.

### 7. Entregar
Dile dónde está el video final, cuánto duró y el costo aproximado total. Pregunta si quiere cambiar
alguna escena: para rehacer una sola escena, repite los pasos 4 y 5 de esa escena con `--reemplazar`
(con su OK) y vuelve a unir.

## Problemas comunes

| Mensaje | Qué significa | Qué hacer |
|---|---|---|
| OpenRouter `402` / "never purchased credits" | La cuenta de la clave no tiene saldo | Cargar saldo en openrouter.ai/settings/credits, en la misma cuenta donde se creó la clave |
| HeyGen `400` al crear el video | Probablemente no detectó una cara humana | Generar otra imagen con la cara más visible y centrada |
| HeyGen `insufficient_api_key_scope` | A la clave de HeyGen le faltan permisos | Crear una clave con acceso completo en app.heygen.com/developers/api |
| "No encontré la voz" | Ese nombre no está en la cuenta de ElevenLabs | Mostrar las voces con `listar-voces.ts` |
| "Falta API_KEY_… en el .env" | Falta una clave | Que ella la agregue siguiendo `GUIA-INSTALACION.md` (tú no tocas el `.env`) |
| "ya existe" | El archivo ya se generó antes | Usar otro número de escena, o `--reemplazar` solo con su OK |
