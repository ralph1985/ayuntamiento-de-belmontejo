# Ayuntamiento de Belmontejo

Este proyecto es el sitio web oficial del Ayuntamiento de Belmontejo, diseñado para proporcionar información y servicios a los ciudadanos.

## Características

- **Anuncios Oficiales (Bandos):** Muestra los bandos municipales, obtenidos automáticamente a través de un script.
- **Noticias y Proyectos:** Secciones para mantener a los ciudadanos informados sobre las últimas noticias y proyectos del ayuntamiento.
- **Información del Pueblo:** Detalles sobre la historia, lugares de interés y otra información relevante sobre Belmontejo.
- **Contenido editorial:** Los textos y avisos se mantienen como archivos versionados del proyecto.
- **Diseño Adaptable:** Interfaz accesible y fácil de usar en diferentes dispositivos.

## Tecnologías Utilizadas

- **Astro:** Framework de desarrollo para construir sitios web rápidos y optimizados.
- **Vercel:** Plataforma para el despliegue y alojamiento del sitio.
- **Node.js:** Entorno de ejecución para los scripts del proyecto.

## Estructura del Proyecto

El proyecto sigue la convención de Astro y añade algunos directorios auxiliares:

- **/src/pages/**: rutas del sitio (bandos, noticias, páginas estáticas y API).
- **/src/components/**: componentes reutilizables.
- **/src/layouts/**: envoltorios compartidos para las páginas.
- **/src/content/**: colecciones de noticias, bandos y FAQs en Markdown.
- **/src/assets**, **/src/icons**, **/src/styles**, **/src/js**: recursos estáticos, iconografía, utilidades de estilo y scripts de apoyo.
- **/src/data/**: fuentes de datos estáticas que se consumen en el build.
- **/scripts/**: automatizaciones (`fetch-bandos.js`, `run-e2e.js`).
- **/tests/**: pruebas unitarias (`tests/unit`) y flujos end-to-end (`tests/e2e`).
- **/public/**: archivos estáticos servidos tal cual.
- **/dist/**: salida del build (no debe versionarse).
- **/coverage/** y **/test-results/**: artefactos generados por Vitest y Playwright.

## Puesta en Marcha

### Requisitos

- Node.js 22 (ver `.nvmrc`).
- pnpm 10.25.0, habilitado con `corepack enable`.
- Playwright instalado localmente (`pnpm exec playwright install`) para ejecutar las pruebas end-to-end.

### Pasos iniciales

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/tu-usuario/ayuntamiento-de-belmontejo.git
   ```

2. **Instalar dependencias**

   ```bash
   pnpm install --frozen-lockfile
   ```

   La instalación no ejecuta scripts de dependencias: esta protección está activa en `.npmrc`.

3. **Ejecutar el servidor de desarrollo**

   ```bash
   pnpm run dev
   # o
   pnpm run start
   ```

4. **Generar la build de producción**

   ```bash
   pnpm run build
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

| Script                            | Descripción                                                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `pnpm run dev` / `pnpm run start` | Inicia el servidor de desarrollo con recarga en caliente.                                                                |
| `pnpm run build`                  | Genera la versión optimizada en `dist/`.                                                                                 |
| `pnpm run preview`                | Alias de `astro dev`. Para revisar la build estática ejecuta `pnpm run build && pnpm exec astro preview`.                |
| `pnpm run fetch-bandos`           | Descarga el feed RSS municipal y crea/actualiza Markdown en `src/content/bandos/`, formateando con Prettier al terminar. |
| `pnpm run lint`                   | Ejecuta ESLint con las reglas de Astro, TypeScript y accesibilidad.                                                      |
| `pnpm run lint:fix`               | Igual que `lint` pero aplica autocorrecciones posibles.                                                                  |
| `pnpm run format`                 | Verifica el formato con Prettier.                                                                                        |
| `pnpm run format:write`           | Aplica el formato de Prettier sobre todo el proyecto.                                                                    |
| `pnpm run test:unit`              | Lanza las pruebas unitarias de Vitest.                                                                                   |
| `pnpm run test:unit:coverage`     | Ejecuta Vitest y genera cobertura en `coverage/unit/`.                                                                   |
| `pnpm run test:e2e`               | Construye el sitio y ejecuta Playwright mediante `scripts/run-e2e.js`.                                                   |
| `pnpm run test:e2e:navigation`    | Suite ligera centrada en flujos de navegación.                                                                           |
| `pnpm run sonar:scan`             | Ejecuta el análisis de SonarQube/SonarCloud empleando `sonar-project.properties` y las variables definidas en `.env`.    |

## Pruebas

### Unitarias (Vitest)

- Ejecuta `pnpm run test:unit` para validar los helpers de la interfaz.
- `pnpm run test:unit:coverage` genera métricas en `coverage/unit/` y en `coverage/unit/lcov.info` para Sonar.

### End-to-End (Playwright)

- `scripts/run-e2e.js` se asegura de construir el sitio antes de lanzar Playwright.
- Todas las banderas y argumentos tras `pnpm run test:e2e -- ...` se transfieren a `pnpm exec playwright test` (por ejemplo, `--update-snapshots`, `--project=chromium`).
- Puedes limitar la ejecución a subconjuntos definidos en `scripts/e2e-groups.js` con `pnpm run test:e2e -- --group <nombre>` (por ejemplo, `flows:navigation`).
- Las specs y snapshots visuales se conservan en `tests/e2e/specs/visual/` y `tests/e2e/__screenshots__/`, pero están desactivados hasta que se revisen y regeneren sus bases de referencia.
- El servidor que utiliza Playwright se levanta con `pnpm run preview -- --host 127.0.0.1 --port 4173`.

### Artefactos generados

- Los resultados de Playwright se guardan en `test-results/` y en el informe HTML (`playwright-report/` cuando se genera).
- Las coberturas de Vitest se almacenan en `coverage/unit/`.

## Automatización de bandos

El comando `pnpm run fetch-bandos` consume el RSS municipal (`https://www.bandomovil.com/rss.php?codigo=belmontejo`) y genera entradas en `src/content/bandos/`. El script:

- Normaliza los nombres de archivo con slug e ID.
- Limpia el contenido HTML/CDATA y lo transforma en Markdown legible.
- Marca bandos recientes o con palabras clave como `isFeatured`.
- Evita reescribir archivos sin cambios y formatea solo los bandos generados.

El flujo de GitHub Actions puede ejecutarse manualmente desde la pestaña Actions y abre o actualiza una PR revisable contra `main`. La sincronización periódica se realiza mediante `scripts/sync-bandos-cron.sh`: descarga el RSS, valida el contenido con unitarios y build y publica en `main` solo si hay cambios. Nunca instala dependencias ni continúa si el árbol de trabajo no está limpio. Tras un `push` correcto, envía un aviso SMTP con los archivos publicados a `BANDOS_NOTIFY_TO`. Configura `BANDOS_SMTP_HOST`, `BANDOS_SMTP_PORT`, `BANDOS_SMTP_SECURE`, `BANDOS_SMTP_USER`, `BANDOS_SMTP_PASSWORD`, `BANDOS_NOTIFY_FROM` y `BANDOS_NOTIFY_TO` en el archivo local `.env`; no se versionan credenciales. En el servidor autorizado, programa una ejecución diaria con cron, por ejemplo:

```cron
PATH=/home/rafa/.nvm/versions/node/v22.23.1/bin:/usr/local/bin:/usr/bin:/bin
23 7 * * * /home/rafa/dev/ayuntamiento-de-belmontejo/scripts/sync-bandos-cron.sh >> /tmp/ayuntamiento-belmontejo-bandos.log 2>&1
```

La hora se interpreta en la zona horaria del servidor. Para comprobar el proceso sin publicar cambios, usa `SYNC_BANDOS_DRY_RUN=1 scripts/sync-bandos-cron.sh`.

## Descubrimiento automático de noticias

El comando `pnpm run discover-news` invoca Codex con búsqueda web para localizar noticias nuevas de Belmontejo en medios fiables de Cuenca y Castilla-La Mancha. La salida se valida contra la colección existente, excluye bandos y genera una única PR revisable; no publica noticias directamente en `main`. Las imágenes solo se incorporan cuando se puede conservar una atribución visible al medio.

La automatización reutiliza una autenticación válida de `gh` (`gh auth token`) o, como alternativa, `NEWS_GITHUB_TOKEN` (token fino con permisos de contenidos y pull requests). También reutiliza las variables SMTP de bandos si no se definen las variables `NEWS_*` equivalentes. Para probarla sin escribir archivos, crear ramas ni abrir PR usa `pnpm run discover-news:dry-run`.

En el servidor autorizado, programa la ejecución diaria a las 13:00 de Madrid:

```cron
PATH=/home/rafa/.nvm/versions/node/v22.23.1/bin:/usr/local/bin:/usr/bin:/bin
CRON_TZ=Europe/Madrid
0 13 * * * /home/rafa/dev/ayuntamiento-de-belmontejo/scripts/discover-news-cron.sh >> /tmp/ayuntamiento-belmontejo-news.log 2>&1
```

## Calidad y estilo del código

- `pnpm run lint`, `pnpm run lint:fix`, `pnpm run format` y `pnpm run format:write` ayudan a asegurar el estilo (ESLint + Prettier).
- No se instalan ni ejecutan hooks o scripts de ciclo de vida automáticamente. Ejecuta las comprobaciones de forma explícita antes de publicar cambios.

## Seguridad de dependencias

- `.npmrc` desactiva los scripts de ciclo de vida durante `pnpm install`, incluidos `preinstall`, `install`, `postinstall` y `prepare`.
- `pnpm-workspace.yaml` impone una edad mínima de publicación de 10.080 minutos (7 días), sin excepciones: una versión recién publicada no puede instalarse.
- Usa siempre `pnpm install --frozen-lockfile` en entornos reproducibles. Cualquier dependencia nueva requiere revisión explícita y una versión exacta.

## Análisis estático

Para ejecutar SonarQube/SonarCloud en local utiliza:

```bash
pnpm run sonar:scan
```

Asegúrate de que el archivo `sonar-project.properties` contiene los identificadores correctos y de definir `SONAR_TOKEN` (u otras credenciales requeridas) en tu `.env`.

## Despliegue

El sitio está configurado para un despliegue continuo en Vercel. Cada vez que se realiza un `push` a la rama principal, se despliega automáticamente una nueva versión.

## Variables de Entorno

El formulario de contacto no necesita variables de entorno ni un backend: valida los campos en el navegador y prepara un correo `mailto:` dirigido a `alcaldia@belmontejo.es`. Si el dispositivo no tiene una aplicación de correo configurada, muestra la dirección municipal y una opción para copiarla.

No compartas el archivo `.env` ni las credenciales generadas.

La web no recibe ni almacena los datos introducidos en el formulario de contacto. La entrega del mensaje depende de la aplicación de correo que elija la persona usuaria.
