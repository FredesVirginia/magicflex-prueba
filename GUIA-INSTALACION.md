# Guía de instalación: Mini series con Claude

Esta guía se hace **una sola vez**. Después, para crear videos solo hablas con Claude.

---

## 1. Instalar los programas

Necesitas tres cosas en tu computadora (Windows):

| Programa | Para qué sirve |
|---|---|
| **App de Claude** (escritorio) | Donde le pides todo a Claude |
| **Node.js** (versión 24 o más nueva) | Ejecuta los scripts que generan imágenes, voces y videos |
| **FFmpeg** | Une las escenas en un solo video |

Si ya tienes la app de Claude, para los otros dos abre **PowerShell** (búscalo en el menú Inicio) y
escribe estos dos comandos, uno por uno:

```
winget install OpenJS.NodeJS.LTS
```

```
winget install Gyan.FFmpeg
```

Cuando terminen, **cierra y vuelve a abrir** PowerShell y la app de Claude para que los reconozcan.

> ¿Prefieres no usar PowerShell? Abre la carpeta del proyecto en Claude (paso 4) y pídele:
> *"Ayúdame a instalar Node.js y FFmpeg"*.

---

## 2. Copiar la carpeta del proyecto

Copia la carpeta `magicflex-prueba` a tu computadora (por ejemplo en Documentos).
**No necesitas** el archivo `.env` de otra persona ni la carpeta `node_modules`: usarás tus propias claves.

---

## 3. Crear tus claves de API

Necesitas una clave de cada servicio. **Las claves son como contraseñas: no las compartas ni las
pegues en el chat de Claude.**

Primero, en la carpeta del proyecto, haz una copia del archivo `.env.example` y llámala `.env`.
Ábrela con el Bloc de notas: ahí pegarás cada clave después del `=`, sin comillas ni espacios.

### OpenRouter (imágenes de los personajes)
1. Crea tu cuenta en [openrouter.ai](https://openrouter.ai).
2. Carga saldo en [openrouter.ai/settings/credits](https://openrouter.ai/settings/credits) (con $10 alcanza para muchas pruebas).
3. En **Keys**, crea una clave con un **límite de crédito** (por ejemplo $10).
   ⚠️ Crea la clave **en la misma cuenta u organización donde cargaste el saldo**.
4. Pégala en `.env` → `API_KEY_OPENROUTER=`

### ElevenLabs (voces)
1. Entra a [elevenlabs.io](https://elevenlabs.io) con tu cuenta.
2. Ve a **API Keys** y crea una clave nueva.
3. En los permisos, habilita **Text to Speech** y **Voices** (lectura).
4. Pégala en `.env` → `API_KEY_ELEVENLABS=`

### HeyGen (animar a los personajes)
1. Crea tu cuenta en [heygen.com](https://www.heygen.com).
2. El saldo de la API es **aparte** del plan de la web: carga como mínimo **$5**.
3. En la barra izquierda, entra a **Developers → API keys** y crea una clave con **acceso completo**.
   Cópiala enseguida: HeyGen no la vuelve a mostrar.
4. Pégala en `.env` → `API_KEY_HEYGEN=`

Tu `.env` debe quedar así (con tus claves en lugar de los puntos):

```
API_KEY_OPENROUTER=...
API_KEY_ELEVENLABS=...
API_KEY_HEYGEN=...
```

---

## 4. Abrir el proyecto en Claude

1. Abre la app de Claude y entra a la pestaña **Code**.
2. Abre una sesión nueva eligiendo la carpeta del proyecto.
3. Si la app pregunta si confías en la carpeta, di que **sí** (así Claude puede ejecutar los scripts
   sin pedirte permiso cada vez).
4. Escribe: **"Revisa que todo esté listo"**. Claude comprobará tus tres claves y tus saldos.

---

## 5. ¡A crear!

Háblale a Claude con normalidad. Por ejemplo:

- *"Quiero una mini serie llamada 'ofertas-flex' con Carlos, un repartidor de 25 años en su auto."*
- *"Muéstrame las voces que tengo."*
- *"Haz la escena 1: Carlos dice '¿Cansado de perder bloques?'"*
- *"Rehaz la escena 2 con una voz más alegre."*
- *"Une todas las escenas."*

Claude siempre te dirá cuánto va a costar antes de gastar, y esperará tu OK.
Los videos quedan en `series/<nombre-de-la-serie>/final/`.
