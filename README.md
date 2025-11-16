# Ayuntamiento de Belmontejo

Este proyecto es el sitio web oficial del Ayuntamiento de Belmontejo, diseñado para proporcionar información y servicios a los ciudadanos.

## Características

- **Anuncios Oficiales (Bandos):** Muestra los bandos municipales, obtenidos automáticamente a través de un script.
- **Noticias y Proyectos:** Secciones para mantener a los ciudadanos informados sobre las últimas noticias y proyectos del ayuntamiento.
- **Información del Pueblo:** Detalles sobre la historia, lugares de interés y otra información relevante sobre Belmontejo.
- **Administración de Contenido:** Utiliza Decap CMS para una fácil gestión del contenido del sitio.
- **Diseño Adaptable:** Interfaz accesible y fácil de usar en diferentes dispositivos.

## Tecnologías Utilizadas

- **Astro:** Framework de desarrollo para construir sitios web rápidos y optimizados.
- **Vercel:** Plataforma para el despliegue y alojamiento del sitio.
- **Decap CMS:** Sistema de gestión de contenido (CMS) para actualizar el contenido de forma sencilla.
- **Node.js:** Entorno de ejecución para los scripts del proyecto.

## Estructura del Proyecto

El proyecto sigue la convención de Astro y añade algunos directorios auxiliares:

- **/src/pages/**: rutas del sitio (bandos, noticias, páginas estáticas y API).
- **/src/components/**: componentes reutilizables.
- **/src/layouts/**: envoltorios compartidos para las páginas.
- **/src/content/**: colecciones gestionadas por Decap CMS y Markdown generado automáticamente.
- **/src/assets**, **/src/icons**, **/src/styles**, **/src/js**: recursos estáticos, iconografía, utilidades de estilo y scripts de apoyo.
- **/src/data/**: fuentes de datos estáticas que se consumen en el build.
- **/scripts/**: automatizaciones (`fetch-bandos.js`, `run-e2e.js`).
- **/tests/**: pruebas unitarias (`tests/unit`) y flujos end-to-end (`tests/e2e`).
- **/public/**: archivos estáticos servidos tal cual, incluido el panel `/admin`.
- **/dist/**: salida del build (no debe versionarse).
- **/coverage/** y **/test-results/**: artefactos generados por Vitest y Playwright.

## Puesta en Marcha

### Requisitos

- Node.js 22 (ver `.nvmrc`).
- npm (se recomienda la versión incluida con Node 22).
- Playwright instalado localmente (`npx playwright install`) para ejecutar las pruebas end-to-end.

### Pasos iniciales

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/tu-usuario/ayuntamiento-de-belmontejo.git
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

   Este paso habilita los hooks de Husky definidos en `.husky/`.

3. **Ejecutar el servidor de desarrollo**

   ```bash
   npm run dev
   # o
   npm run start
   ```

4. **Generar la build de producción**

   ```bash
   npm run build
   ```

### Git LFS para capturas de Playwright

Las capturas visuales (`tests/e2e/__screenshots__/**`) se gestionan con [Git LFS](https://git-lfs.com/) para evitar inflar el historial. Después de clonar el repo asegúrate de:

```bash
# Instalar la extensión si aún no la tienes
brew install git-lfs

# Registrar los filtros en tu usuario (solo la primera vez)
git lfs install

# Descargar las capturas almacenadas en LFS
git lfs pull
```

Si ya tenías el repositorio clonado antes de activar LFS, ejecuta igualmente `git lfs install --force` dentro del proyecto seguido de `git lfs pull` para convertir tu working copy. A partir de ahí, cualquier `git add tests/e2e/__screenshots__/**` creará automáticamente los punteros correctos en los futuros commits.

## Scripts Disponibles

| Script                                | Descripción                                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `npm run dev` / `npm run start`       | Inicia el servidor de desarrollo con recarga en caliente.                                                                |
| `npm run build`                       | Genera la versión optimizada en `dist/`.                                                                                 |
| `npm run preview`                     | Alias de `astro dev`. Para revisar la build estática ejecuta `npm run build && npx astro preview`.                       |
| `npm run fetch-bandos`                | Descarga el feed RSS municipal y crea/actualiza Markdown en `src/content/bandos/`, formateando con Prettier al terminar. |
| `npm run lint`                        | Ejecuta ESLint con las reglas de Astro, TypeScript y accesibilidad.                                                      |
| `npm run lint:fix`                    | Igual que `lint` pero aplica autocorrecciones posibles.                                                                  |
| `npm run format`                      | Verifica el formato con Prettier.                                                                                        |
| `npm run format:write`                | Aplica el formato de Prettier sobre todo el proyecto.                                                                    |
| `npm run test:unit`                   | Lanza las pruebas unitarias de Vitest.                                                                                   |
| `npm run test:unit:coverage`          | Ejecuta Vitest y genera cobertura en `coverage/unit/`.                                                                   |
| `npm run test:e2e`                    | Construye el sitio y ejecuta Playwright mediante `scripts/run-e2e.js`.                                                   |
| `npm run test:e2e:visual`             | Ejecuta todos los escenarios visuales (páginas y buscador, desktop y mobile).                                            |
| `npm run test:e2e:visual:update`      | Ejecuta todos los escenarios visuales actualizando sus snapshots.                                                        |
| `npm run test:e2e:visual:last`        | Repite únicamente los escenarios visuales (páginas/buscador) que fallaron en la última ejecución.                        |
| `npm run test:e2e:visual:last:update` | Repite los escenarios visuales fallidos y actualiza sus snapshots.                                                       |
| `npm run test:e2e:navigation`         | Suite ligera centrada en flujos de navegación.                                                                           |
| `npm run sonar:scan`                  | Ejecuta el análisis de SonarQube/SonarCloud empleando `sonar-project.properties` y las variables definidas en `.env`.    |

## Pruebas

### Unitarias (Vitest)

- Ejecuta `npm run test:unit` para validar los helpers de la interfaz.
- `npm run test:unit:coverage` genera métricas en `coverage/unit/` y en `coverage/unit/lcov.info` para Sonar.

### End-to-End (Playwright)

- `scripts/run-e2e.js` se asegura de construir el sitio antes de lanzar Playwright y aporta valores ficticios para `OAUTH_GITHUB_CLIENT_ID` y `OAUTH_GITHUB_CLIENT_SECRET` si no están definidos.
- Todas las banderas y argumentos tras `npm run test:e2e -- ...` se transfieren a `npx playwright test` (por ejemplo, `--update-snapshots`, `--project=chromium`).
- Puedes limitar la ejecución a subconjuntos definidos en `scripts/e2e-groups.js` con `npm run test:e2e -- --group <nombre>` (por ejemplo, `visual:all`, `flows:navigation`).
- Los snapshots visuales viven en `tests/e2e/__screenshots__/`. Actualízalos solo cuando la diferencia sea intencionada (`npm run test:e2e -- --update-snapshots` o los atajos `test:e2e:visual:*`).
- El servidor que utiliza Playwright se levanta con `npm run preview -- --host 127.0.0.1 --port 4173`.

### Artefactos generados

- Los resultados de Playwright se guardan en `test-results/` y en el informe HTML (`playwright-report/` cuando se genera).
- Las coberturas de Vitest se almacenan en `coverage/unit/`.

## Automatización de bandos

El comando `npm run fetch-bandos` consume el RSS municipal (`https://www.bandomovil.com/rss.php?codigo=belmontejo`) y genera entradas en `src/content/bandos/`. El script:

- Normaliza los nombres de archivo con slug e ID.
- Limpia el contenido HTML/CDATA y lo transforma en Markdown legible.
- Marca bandos recientes o con palabras clave como `isFeatured`.
- Ejecuta Prettier para asegurar el formato consistente.

Ejecuta este comando antes de subir contenido nuevo para mantener la web sincronizada con el feed oficial.

## Calidad y estilo del código

- `npm run lint`, `npm run lint:fix`, `npm run format` y `npm run format:write` ayudan a asegurar el estilo (ESLint + Prettier).
- El hook `pre-push` de Husky ejecuta automáticamente `lint`, `format`, `test:unit` y `test:e2e`. Si alguno falla, el push se cancela; corrige los problemas y vuelve a intentarlo.

## Análisis estático

Para ejecutar SonarQube/SonarCloud en local utiliza:

```bash
npm run sonar:scan
```

Asegúrate de que el archivo `sonar-project.properties` contiene los identificadores correctos y de definir `SONAR_TOKEN` (u otras credenciales requeridas) en tu `.env`.

## Despliegue

El sitio está configurado para un despliegue continuo en Vercel. Cada vez que se realiza un `push` a la rama principal, se despliega automáticamente una nueva versión.

## Panel de Administración

El sitio incluye un panel de administración de Decap CMS en `/admin`. Para habilitarlo, es necesario configurar la variable de entorno `PUBLIC_ADMIN_MENU` a `true`.

## Variables de Entorno

Es necesario crear un archivo `.env` en la raíz del proyecto con las siguientes variables para el correcto funcionamiento del panel de administración:

- `GITHUB_CLIENT_ID`: ID de cliente OAuth de GitHub que usa `astro-decap-cms-oauth` en producción (por ejemplo, en Vercel).
- `GITHUB_CLIENT_SECRET`: Secreto asociado al cliente anterior.
- `PUBLIC_ADMIN_MENU`: `true` o `false` para mostrar u ocultar el menú de administración en la navegación.
- `OAUTH_GITHUB_CLIENT_ID` y `OAUTH_GITHUB_CLIENT_SECRET` (opcional): sobrescriben los valores ficticios usados por `scripts/run-e2e.js` durante los builds locales.
- `RESEND_API_KEY`: clave privada de Resend con permisos para enviar correos.

Los campos `contact.formSender` y `contact.formRecipient` (ver `src/data/contact-info.json`) se gestionan desde Decap CMS y controlan el remitente/destinatario usados por la API de Resend. Mientras no exista un remitente bajo el dominio municipal, utiliza `onboarding@resend.dev` (valor ya cargado en `formSender`).

No compartas el archivo `.env` ni las credenciales generadas. Antes de habilitar el panel de administración en un entorno público, revisa que el despliegue esté protegido siguiendo las directrices de Vercel.

### Monitoreo de errores (Sentry)

El SDK de Sentry queda configurado mediante `sentry.client.config.ts` y `sentry.server.config.ts`. Para activarlo, define las siguientes variables:

- `PUBLIC_SENTRY_DSN`: DSN público que se inyecta en el bundle del navegador.
- `SENTRY_DSN`: DSN privado usado en el runtime del servidor (renderizado SSR en Vercel).
- `PUBLIC_SENTRY_ENVIRONMENT` / `SENTRY_ENVIRONMENT` (opcional): etiqueta el entorno (`production`, `preview`, etc.). En caso de ausencia se usará `import.meta.env.MODE`.
- `PUBLIC_SENTRY_TRACES_SAMPLE_RATE` / `SENTRY_TRACES_SAMPLE_RATE` (opcional): ajuste decimal entre `0` y `1` para el muestreo de trazas. Por defecto se envía `0.1`.
- `PUBLIC_SENTRY_RELEASE` / `SENTRY_RELEASE` (opcional): identifica la release desplegada; si no se define se utiliza automáticamente la versión de `package.json`.
- `SENTRY_ENABLE_SERVER` (opcional): ajústalo a `true` si quieres habilitar el rastreo de errores en el runtime de servidor. Por defecto permanece desactivado para evitar procesar datos sin consentimiento explícito.

El SDK en el navegador sólo se carga cuando el usuario acepta las cookies analíticas (mismo grupo que Google Analytics). También se expone `import.meta.env.PUBLIC_APP_VERSION` con la versión actual del proyecto, útil para mostrar la release activa en alguna sección de la UI. Si alguna variable no está presente, la inicialización correspondiente se omite de forma silenciosa. La subida automática de _source maps_ está desactivada por defecto para evitar requerir un `SENTRY_AUTH_TOKEN`; si necesitas habilitarla, elimina la opción `sourcemaps.disable` del bloque `sentry()` en `astro.config.mjs` y configura `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` y `SENTRY_PROJECT`.
