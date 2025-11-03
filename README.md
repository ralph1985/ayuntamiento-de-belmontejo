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

El proyecto sigue la estructura estándar de Astro:

- **/src/pages/**: Contiene las diferentes páginas del sitio.
- **/src/components/**: Componentes reutilizables de Astro.
- **/src/layouts/**: Plantillas de diseño para las páginas.
- **/src/content/**: Almacena el contenido del sitio gestionado por Decap CMS.
- **/public/**: Archivos estáticos como imágenes y el panel de administración.
- **/scripts/**: Scripts para tareas automatizadas, como la obtención de bandos.

## Configuración y Ejecución

### Requisitos

- Node.js (versión recomendada en `.nvmrc`)
- npm (o un gestor de paquetes similar)

### Pasos

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/tu-usuario/ayuntamiento-de-belmontejo.git
   ```

2. **Instalar dependencias:**

   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo:**

   ```bash
   npm run dev
   ```

4. **Compilar el proyecto:**
   ```bash
   npm run build
   ```

## Scripts Disponibles

- **`npm run dev`:** Inicia el servidor de desarrollo de Astro.
- **`npm run build`:** Compila el sitio para producción.
- **`npm run preview`:** Vista previa del sitio compilado.
- **`npm run fetch-bandos`:** Script para obtener y actualizar los bandos municipales.
- **`npm run test:e2e`:** Construye el sitio y ejecuta la batería de pruebas end-to-end con Playwright.

### Pruebas end-to-end

Las pruebas visuales están implementadas con [Playwright](https://playwright.dev/) y generan capturas de referencia para detectar regresiones.

1. Instala los navegadores de Playwright (una sola vez):

   ```bash
   npx playwright install
   ```

2. Ejecuta las pruebas (construye el sitio y lanza las comparaciones). El script asigna valores ficticios a `OAUTH_GITHUB_CLIENT_ID` y `OAUTH_GITHUB_CLIENT_SECRET` si no están definidos para que el build no falle durante el pipeline local:

   ```bash
   npm run test:e2e
   ```

La primera vez que se ejecute la suite se generarán las capturas de referencia en `tests/e2e/__screenshots__/`. Si hay cambios visuales esperados, actualiza las capturas con:

```bash
npm run test:e2e -- --update-snapshots
```

## Despliegue

El sitio está configurado para un despliegue continuo en Vercel. Cada vez que se realiza un `push` a la rama principal, se despliega automáticamente una nueva versión.

## Panel de Administración

El sitio incluye un panel de administración de Decap CMS en `/admin`. Para habilitarlo, es necesario configurar la variable de entorno `PUBLIC_ADMIN_MENU` a `true`.

## Variables de Entorno

Es necesario crear un archivo `.env` en la raíz del proyecto con las siguientes variables para el correcto funcionamiento del panel de administración:

- `GITHUB_CLIENT_ID`: ID de cliente de la aplicación OAuth de GitHub.
- `GITHUB_CLIENT_SECRET`: Secreto de cliente de la aplicación OAuth de GitHub.
- `PUBLIC_ADMIN_MENU`: `true` o `false` para mostrar u ocultar el menú de administración.
