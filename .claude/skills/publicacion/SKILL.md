---
name: publicacion
description: Escribe y revisa el texto que acompaña una publicación de Instagram (caption, descripción y hashtags) en español o inglés. Usar cuando pidan el texto de la publicación, el caption, la descripción o los hashtags, o al terminar un video, carrusel o post. No usar para guiones ni para el texto dentro de las láminas.
when_to_use: Frases como escribe el caption, qué pongo en la descripción, dame los hashtags, revisa este texto para Instagram, write the caption.
argument-hint: "[qué se va a publicar]"
---

# Publicación: el texto que va con el contenido

Quien usa esto no es desarrolladora. Háblale en español sencillo, aunque el texto sea en inglés.

## Antes de escribir

- Lee `marcas/<marca>/marca.md`. Si hay más de una marca y no está claro cuál es, pregunta.
- Usa el idioma que ella pidió. Si no lo dijo, pregunta.
- Si trae un texto de ChatGPT, revísalo y propón mejoras: no lo reemplaces sin su OK.

## Cómo es un buen texto

1. **Primera línea:** Instagram muestra unos 125 caracteres antes de "más". Sin saludos, hashtags ni
   emojis al inicio.
   - Video: el gancho ya está en el video, así que esta línea dice qué ganan o qué hacer.
   - Carrusel o post: esta línea hace de gancho (ver `guias/ganchos.md`).
2. **Cuerpo:** párrafos cortos, con las palabras que el público buscaría.
3. **Una sola petición:** comentar una palabra, guardar o escribir. Solo una.
4. **Hashtags:** máximo 5, específicos, al final. Nada de `#viral` o `#fyp`.
5. **Sin enlaces:** en el texto no se pueden tocar. Di "enlace en la bio".

Aplica la regla de los datos de `guias/revisar-guion.md`: nada de cifras ni promesas sin confirmar.

## Revisar y entregar

Guarda el texto como `publicacion.md` en la carpeta del contenido (`series/<serie>/` o `piezas/<pieza>/`) y revísalo:

```
node scripts/revisar-texto.ts --archivo "<ruta>/publicacion.md" --idioma <es|en> --tipo publicacion --limpiar
```

Corrige lo que corresponda y muéstrale el texto listo para copiar y pegar.

## Antes de publicar

Claude no publica en Instagram: lo hace ella. Si el contenido tiene **video o voz realistas hechos con
IA**, recuérdale activar la etiqueta de IA al publicar, porque Meta lo pide en sus reglas. Las imágenes
fijas no lo requieren, aunque Instagram puede marcarlas si detecta IA.
Detalle: https://help.instagram.com/761121959519495

Dile que, cuando publique, te avise para registrarlo con la skill `plan-resultados`.
