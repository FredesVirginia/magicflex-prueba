---
name: plan-resultados
description: Registra lo publicado, analiza las estadísticas de Instagram (de cada publicación y generales de la cuenta) y propone el plan de la semana siguiente. Usar cuando digan que ya publicaron algo, compartan capturas o números de estadísticas, pregunten qué funcionó o cómo va la cuenta, o pidan un plan semanal o un calendario de contenido. No usar para crear el video, carrusel o historia en sí.
when_to_use: Frases como ya publiqué el carrusel, aquí están mis estadísticas, las estadísticas de octubre, cómo vamos comparado con el mes pasado, qué funcionó, por qué le fue mal a este video, analiza mis resultados, planea mi semana, qué publico esta semana.
argument-hint: "[publicación, estadísticas o semana]"
---

# Plan y resultados: aprender de lo publicado

Quien usa esto no es desarrolladora. Háblale en español sencillo. **Ella tiene el control:** tú analizas
y propones; ella decide qué se hace y lo publica. Nunca entres a Instagram ni publiques por ella.

Todo esto es gratis. Crear después lo que está en el plan sí puede costar.

## Dónde se guarda

Cada marca guarda lo suyo en `marcas/<marca>/resultados-estadisticas/`, que no se sube a git:

```
resultados-estadisticas/
├── capturas/            capturas de estadísticas
├── publicaciones.json   qué se publicó y cómo le fue
├── cuenta.json          estadísticas generales de la cuenta, por período
└── planes/              semana-AAAA-MM-DD.md
```

Crea lo que falte. Nunca le pidas que toque estos archivos. Si hay más de una marca y no está claro
cuál es, pregunta.

## 1. Registrar lo publicado

Cuando diga que publicó algo, agrégalo a `publicaciones.json`, una lista de objetos:

```json
[
  {
    "fecha": "AAAA-MM-DD",
    "titulo": "Nombre corto",
    "formato": "reel",
    "idioma": "es",
    "gancho": "Pregunta real",
    "carpeta": "piezas/nombre",
    "vistas": null,
    "alcance": null,
    "no_seguidores_pct": null,
    "retencion_3s_pct": null,
    "compartidos": null,
    "guardados": null,
    "comentarios": null,
    "seguidores_nuevos": null
  }
]
```

- `formato`: `reel`, `carrusel`, `post` o `historia`.
- `gancho`: el nombre de la fórmula en `guias/ganchos.md`, si se usó una.

## 2. Recibir las estadísticas

Ella puede pegar las capturas en el chat, decirte dónde están o dejarlas en `resultados-estadisticas/capturas/`.
Las encuentra en Instagram, en las estadísticas de cada publicación. Si pega capturas en el chat,
guarda los números en `publicaciones.json`.

- Lee cada número con cuidado y muéstrale lo que entendiste antes de analizar.
- **Lo que no se vea queda en `null`. Nunca adivines un número.**
- Si una captura no dice a qué publicación pertenece, pregúntale.
- Instagram cambia sus pantallas: si un dato no aparece o tiene otro nombre, díselo.

## 3. Analizar

```
node scripts/analizar-resultados.ts --marca "<marca>"
```

"Veces" compara las vistas con lo normal de la cuenta en ese formato: 3x es el triple de lo normal.
Por eso, en "Por formato" las veces siempre dan cerca de 1x: ahí compara vistas y compartidos.
Con esas cifras, explícale:

1. Qué funcionó y qué no, con los números a la vista.
2. Una posible razón, dicha como posibilidad, no como certeza:
   - Baja retención a los 3 segundos: probablemente falló el gancho.
   - Muchas vistas de no seguidores y pocos seguidores nuevos: el contenido llegó, pero el perfil no convenció.
   - Muchos compartidos: el tema le importa al público.
3. Una cosa para repetir y una para dejar de hacer.

Respeta el aviso de cantidad de datos del script. Con pocas publicaciones, di que son pistas. Mira
el día y la hora al final, y solo si nada más explica la diferencia. Prioriza siempre lo que ayude al
objetivo de `marca.md`; si está como Pendiente, pregúntalo.

## 4. Estadísticas generales de la cuenta

Si trae datos de toda la cuenta y no de una publicación, pregúntale qué fechas cubren si la captura
no lo muestra. Muéstrale lo que entendiste y agrégalo a `cuenta.json`, una lista de períodos:

```json
[
  {
    "nombre": "Octubre 2026",
    "desde": "2026-10-01",
    "hasta": "2026-10-31",
    "alcance": null,
    "visualizaciones": null,
    "interacciones": null,
    "seguidores_total": null,
    "seguidores_nuevos": null,
    "seguidores_perdidos": null,
    "visitas_perfil": null,
    "clics_enlace": null
  }
]
```

Lo que no se vea queda en `null`. Si la captura trae otro dato útil, díselo antes de ignorarlo.
Para comparar:

```
node scripts/analizar-cuenta.ts --marca "<marca>"
```

Explícale qué subió y qué bajó. Respeta los avisos del script: con un período no hay comparación, con
dos no hay tendencia, y períodos de distinta duración no se comparan directamente. Pídele períodos
iguales, por ejemplo mes contra mes. Si hay datos por publicación de esas fechas, úsalos para buscar
una posible razón, dicha como posibilidad.

## 5. Planear la semana

Usa `marca.md`, lo aprendido y `publicaciones.json`, para no repetir temas de las últimas dos semanas.
Pregúntale qué hay de nuevo esta semana: funciones, promociones, dudas frecuentes de usuarios.

Propón la cantidad de "Publicaciones por semana" de `marca.md`. Si está como Pendiente, pregúntala.
Varía los tipos:

| Tipo | Para qué |
|---|---|
| Enseñar | Mostrar una función o resolver una duda |
| Prueba | Un resultado real y confirmado |
| Opinión | Una postura que el público discuta |
| Historia | Una situación con un personaje |
| Oferta | Lo que se vende, dicho con claridad |

Por cada publicación indica: día, formato, idioma, tipo, tema concreto, gancho y costo aproximado:

| Pieza | Costo aproximado |
|---|---|
| Carrusel de 7 láminas con imagen en todas | ~0.50 USD |
| Carrusel con color de marca | gratis |
| Historias | ~0.07 USD por imagen, o gratis con color de marca |
| Video de 15 s con personaje nuevo | ~0.67 USD más los créditos de voz |

Aplica la regla de los datos de `guias/revisar-guion.md`. Guarda el plan en
`resultados-estadisticas/planes/semana-AAAA-MM-DD.md`, muéstraselo y deja que ella lo cambie.

El plan es una propuesta. Cuando diga "haz el del martes", usa la skill que corresponda.

## Reglas

- No inventes números, causas ni tendencias. Si los datos no alcanzan, dilo.
- No prometas resultados: analizar lo pasado no garantiza lo que viene.
- Nunca leas ni muestres el archivo `.env`.
- Nunca borres resultados ni planes sin que ella lo pida.
