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
- **/src/styles/**: Sistema de estilos con arquitectura ITCSS y tokens de diseño.
- **/public/**: Archivos estáticos como imágenes y el panel de administración.
- **/scripts/**: Scripts para tareas automatizadas, como la obtención de bandos.

### 🎨 Arquitectura CSS

El proyecto implementa una arquitectura **ITCSS** (Inverted Triangle CSS) con **CSS Cascade Layers** y un sistema completo de **tokens de diseño**.

**Documentación de estilos:**

- 📘 **[TOKENS_README.md](./TOKENS_README.md)** - Guía rápida y referencia de tokens
- 📗 **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Guía detallada de migración
- 📕 **[ARCHITECTURE_EXPLAINED.md](./ARCHITECTURE_EXPLAINED.md)** - Explicación técnica profunda
- 📙 **[TOKENS_SUMMARY.md](./TOKENS_SUMMARY.md)** - Resumen ejecutivo

**Características:**

- ✅ Sistema de tokens centralizado (colores, tipografía, espaciado, etc.)
- ✅ Modo oscuro automático
- ✅ Compatibilidad 100% con CSS existente
- ✅ Variables LESS + CSS Custom Properties
- ✅ Arquitectura escalable y mantenible
- ✅ Mixins de breakpoints para media queries consistentes

### 📱 Breakpoints y Media Queries

El proyecto usa **mixins de breakpoints** centralizados para mantener consistencia en media queries.

**Breakpoints disponibles:**

```less
@bp-xs: 0em // 0px - Mobile (base)
  @bp-sm: 30em // 480px - Mobile grande
  @bp-md: 48em // 768px - Tablet
  @bp-lg: 64em // 1024px - Desktop
  @bp-xl: 80em // 1280px - Desktop grande
  @bp-2xl: 96em; // 1536px - Desktop extra grande
```

**Uso de mixins:**

```less
// Mobile-first (min-width)
.component {
  padding: 1rem;

  .mq-up(@bp-md) {
    padding: 2rem; // Tablet y superior
  }
}

// Desktop-first (max-width)
.component {
  .mq-down(@bp-md) {
    display: block; // Solo mobile
  }
}

// Rango específico
.component {
  .mq-between(@bp-md, @bp-lg) {
    font-size: 1.2rem; // Solo tablet
  }
}
```

**📖 Ver documentación completa:** [BREAKPOINTS_MIGRATION.md](./BREAKPOINTS_MIGRATION.md)

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
- **`npm run lint`:** Ejecuta ESLint en archivos JavaScript/TypeScript/Astro.
- **`npm run lint:fix`:** Ejecuta ESLint y corrige automáticamente los problemas encontrados.
- **`npm run lint:css`:** Ejecuta Stylelint en archivos CSS/LESS (modo warning).
- **`npm run lint:css:fix`:** Ejecuta Stylelint y corrige automáticamente los problemas de formato.
- **`npm run format`:** Verifica el formato del código con Prettier.
- **`npm run format:write`:** Formatea todo el código con Prettier.

### 🎨 Linting CSS/LESS

El proyecto utiliza **Stylelint** para mantener la calidad y consistencia del código CSS/LESS:

**Política de Warnings (Actual):**

- ⚠️ **Modo Warning:** Por ahora, Stylelint está configurado en modo `"warning"` para no bloquear PRs.
- 📝 **Recomendación:** Ejecuta `npm run lint:css` antes de cada commit para detectar problemas.
- 🔧 **Auto-fix:** Usa `npm run lint:css:fix` para corregir automáticamente problemas de formato.

**Reglas principales:**

- Máximo 3 niveles de anidación LESS
- Nomenclatura BEM ligera para clases (bloque, `__elemento`, `--modificador`)
- Sin nombres de colores (`red`, `blue`), usar hex/rgb/hsl
- Sin selectores por ID
- Orden de propiedades consistente

**Política futura:**

- 🎯 Una vez estabilizado el código, cambiaremos a `"defaultSeverity": "error"` para bloquear PRs con problemas.
- 🚀 El workflow de CI ya está configurado pero en modo permisivo.

**Archivos ignorados:**

- `/dist/**`, `/build/**`, `/.astro/**`, `/public/**`

## Despliegue

El sitio está configurado para un despliegue continuo en Vercel. Cada vez que se realiza un `push` a la rama principal, se despliega automáticamente una nueva versión.

## Panel de Administración

El sitio incluye un panel de administración de Decap CMS en `/admin`. Para habilitarlo, es necesario configurar la variable de entorno `PUBLIC_ADMIN_MENU` a `true`.

## Variables de Entorno

Es necesario crear un archivo `.env` en la raíz del proyecto con las siguientes variables para el correcto funcionamiento del panel de administración:

- `GITHUB_CLIENT_ID`: ID de cliente de la aplicación OAuth de GitHub.
- `GITHUB_CLIENT_SECRET`: Secreto de cliente de la aplicación OAuth de GitHub.
- `PUBLIC_ADMIN_MENU`: `true` o `false` para mostrar u ocultar el menú de administración.
