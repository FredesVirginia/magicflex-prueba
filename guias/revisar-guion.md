# Cómo revisar un guion

Ella suele traer el guion hecho en ChatGPT. **No lo reemplaces:** revísalo y propón mejoras. La decisión
siempre es suya, y puede quedarse con su texto original.

## Pasos

1. Guarda el texto tal como lo pegó en `series/<serie>/guion-original.md`. Ese archivo no se cambia.
2. Copia ese texto a `series/<serie>/guion.md`, con cada escena en un párrafo separado por una línea vacía.
3. Ejecuta la revisión:
   ```
   node scripts/revisar-texto.ts --archivo "series/<serie>/guion.md" --idioma <es|en> --tipo guion --limpiar
   ```
4. Mira cuatro cosas, usando los avisos del script y tu criterio:
   - **Gancho:** ¿la primera frase atrapa en unos 3 segundos? Si está floja, propón 3 opciones de
     fórmulas distintas de `guias/ganchos.md`, en el idioma del guion.
   - **Duración:** escenas de 5 a 20 segundos. La duración real se conoce al generar la voz.
   - **Tono:** ¿se puede decir en voz alta sin tropezar? Cambia lo que suene a texto escrito o a IA.
   - **Datos:** ver la regla de abajo.
5. Muéstrale una lista corta: qué cambiarías, por qué, y el guion resultante. Espera su OK.
6. Guarda en `guion.md` solo lo que ella aceptó.

## La regla de los datos

Los personajes son inventados, pero el público puede creerles. Cifras, ganancias, promesas o historias
en primera persona ("gané $2,000") solo se usan si están en "Datos que se pueden decir" de `marca.md`
o si ella confirma que son reales. Si no se confirman, propón otra frase sin el dato.
Si confirma un dato nuevo, ofrécele guardarlo en `marca.md`.

## Qué no promete esta revisión

Sirve para descartar lo flojo, no para predecir qué se hará viral. No le prometas resultados.
