# Guía de Migración de Selectores ID a Clases

## 📋 Índice

1. [Estrategia General](#estrategia-general)
2. [Arquitectura de Capas](#arquitectura-de-capas)
3. [Plan de Lotes](#plan-de-lotes)
4. [Cambios Realizados](#cambios-realizados)
5. [Verificación y Testing](#verificación-y-testing)
6. [Plan de Retirada de Aliases](#plan-de-retirada-de-aliases)
7. [Hooks JavaScript](#hooks-javascript)
8. [FAQ](#faq)

---

## Estrategia General

### ¿Por qué migrar IDs a clases?

1. **Reducción de especificidad**: Los selectores de clase (`.header`) tienen menor especificidad que los IDs (`#header`), lo que facilita el mantenimiento y evita guerras de especificidad.
2. **Reutilización**: Las clases pueden aplicarse a múltiples elementos, permitiendo patrones más flexibles.
3. **Mejores prácticas CSS**: Los IDs deberían reservarse para hooks de JavaScript o anclajes de navegación, no para estilos.
4. **Arquitectura ITCSS**: Las clases se integran mejor en la arquitectura de componentes.

### Estrategia de Migración Dual

Para garantizar **cero downtime** y compatibilidad total durante la transición:

```html
<!-- ANTES: Solo ID -->
<header id="cs-navigation">
  <!-- DURANTE: Dual selector (ID + clase) -->
  <header id="cs-navigation" class="cs-navigation">
    <!-- DESPUÉS: Solo clase (objetivo final) -->
    <header class="cs-navigation"></header>
  </header>
</header>
```

**CSS en dos capas:**

```less
// @layer components (especificidad baja, nuevos estilos)
.cs-navigation {
  width: 100%;
  background-color: var(--background-main);
  /* ... todos los estilos */
}

// @layer legacy (especificidad alta, alias temporal vacío)
#cs-navigation {
  /* Placeholder - estilos en .cs-navigation */
}
```

### Uso de `:where()` para Especificidad

Si detectas conflictos de especificidad, usa `:where()` para reducirla:

```less
// Sin :where() - especificidad normal
.page .header {
  background: blue;
}

// Con :where() - especificidad = 0
.page :where(.header) {
  background: blue;
}
```

---

## Arquitectura de Capas

### CSS Cascade Layers

El proyecto usa `@layer` para controlar el orden de cascada:

```less
@layer base, components, utilities, legacy;
```

**Orden de prioridad (menor a mayor):**

1. `base` - Variables, reset, elementos HTML base
2. `components` - Componentes con clases (`.cs-navigation`, `.footer`, etc.)
3. `utilities` - Clases de utilidad
4. `legacy` - Estilos antiguos con IDs (máxima prioridad durante transición)

### Ubicación de Archivos

```
src/styles/
├── components/           # 🆕 Nuevos componentes con clases
│   ├── _header.less      # .cs-navigation
│   ├── _footer.less      # .footer
│   ├── _dark-mode-toggle.less  # .dark-mode-toggle
│   ├── _news-content.less      # .news-content
│   └── index.less        # Importa todos los componentes
├── legacy/
│   ├── _id-aliases.less  # 🆕 Aliases temporales (#cs-navigation {})
│   └── legacy.less       # Importa aliases
└── main.less             # Entry point
```

---

## Plan de Lotes

### ✅ Lote 1: Header y Dark Mode Toggle

**Elementos migrados:**

- `#cs-navigation` → `.cs-navigation`
- `#dark-mode-toggle` → `.dark-mode-toggle`

**Archivos modificados:**

| Tipo | Archivo                                        | Cambio                                                                         |
| ---- | ---------------------------------------------- | ------------------------------------------------------------------------------ |
| CSS  | `src/styles/components/_header.less`           | ✅ Creado con todos los estilos                                                |
| CSS  | `src/styles/components/_dark-mode-toggle.less` | ✅ Creado con todos los estilos                                                |
| CSS  | `src/styles/legacy/_id-aliases.less`           | ✅ Alias temporal vacío                                                        |
| HTML | `src/components/Header.astro`                  | ✅ `id="cs-navigation" class="cs-navigation"`                                  |
| HTML | `src/components/DarkModeToggle.astro`          | ✅ `id="dark-mode-toggle" class="dark-mode-toggle" data-js="dark-mode-toggle"` |
| JS   | `src/components/DarkModeToggle.astro`          | ⚠️ Pendiente migración a `data-js`                                             |
| JS   | `src/js/nav.js`                                | ⚠️ Pendiente migración a `data-js`                                             |

**Notas especiales:**

- Se añadió `data-js="dark-mode-toggle"` como hook JS futuro
- El toggle mantiene `getElementById` temporalmente (ver sección [Hooks JavaScript](#hooks-javascript))

---

### ✅ Lote 2: Footer

**Elementos migrados:**

- `#footer` → `.footer`

**Archivos modificados:**

| Tipo | Archivo                              | Cambio                          |
| ---- | ------------------------------------ | ------------------------------- |
| CSS  | `src/styles/components/_footer.less` | ✅ Creado con todos los estilos |
| CSS  | `src/styles/legacy/_id-aliases.less` | ✅ Alias temporal vacío         |
| HTML | `src/components/Footer.astro`        | ✅ `id="footer" class="footer"` |

**Notas especiales:**

- No hay dependencias JavaScript
- Migración directa sin complicaciones

---

### ✅ Lote 3: News Content (Markdown)

**Elementos migrados:**

- `#news-content` → `.news-content`

**Archivos modificados:**

| Tipo | Archivo                                    | Cambio                                      |
| ---- | ------------------------------------------ | ------------------------------------------- |
| CSS  | `src/styles/components/_news-content.less` | ✅ Creado con todos los estilos             |
| CSS  | `src/styles/legacy/_id-aliases.less`       | ✅ Alias temporal vacío                     |
| HTML | `src/layouts/NewsPostLayout.astro`         | ✅ `id="news-content" class="news-content"` |
| HTML | `src/layouts/BandoPostLayout.astro`        | ✅ `id="news-content" class="news-content"` |

**Notas especiales:**

- Contenedor para contenido markdown del CMS
- Usado en posts de noticias y bandos
- No hay dependencias JavaScript

---

### 🔲 Lote 4: Secciones de Páginas (Pendiente)

**Elementos por migrar:**

| ID actual         | Clase futura      | Archivo                                      | Complejidad |
| ----------------- | ----------------- | -------------------------------------------- | ----------- |
| `#hero`           | `.hero`           | `pages/index.astro`                          | Media       |
| `#services`       | `.services`       | `pages/index.astro`                          | Baja        |
| `#sbs`            | `.sbs`            | `pages/index.astro`, `sobre-el-pueblo.astro` | Media       |
| `#sbs-r`          | `.sbs-r`          | `pages/index.astro`                          | Media       |
| `#gallery`        | `.gallery`        | `pages/index.astro`, `proyectos.astro`       | Media       |
| `#reviews`        | `.reviews`        | `pages/index.astro`, `testimonios.astro`     | Media       |
| `#search-section` | `.search-section` | `pages/buscar.astro`                         | Baja        |
| `#cs-contact`     | `.cs-contact`     | `pages/contacto.astro`                       | Media       |

**Pasos para cada sección:**

1. Copiar estilos de `src/styles/pages/[page].less` a nuevo archivo `src/styles/components/_[component].less`
2. Cambiar selectores `#id` por `.clase`
3. Añadir alias vacío en `src/styles/legacy/_id-aliases.less`
4. Actualizar HTML con dual selector `id="..." class="..."`
5. Verificar visualmente en todas las páginas donde aparece

---

### 🔲 Lote 5: Form Elements (Análisis Pendiente)

**IDs de formulario:**

- `#name`, `#email`, `#phone`, `#find`, `#message`

**Estrategia especial:**

Los IDs en `<input>` sirven para vincular `<label for="id">` (accesibilidad). No es necesario eliminarlos, pero sí separar:

- **ID**: Mantener para accesibilidad (`<input id="name">` + `<label for="name">`)
- **Clase**: Usar para estilos (`.form-input`, `.input--text`, etc.)

```html
<!-- ANTES -->
<input id="name" type="text" />
<label for="name">Nombre</label>

<!-- DESPUÉS (mantener ID funcional) -->
<input id="name" class="form-input" type="text" />
<label for="name" class="form-label">Nombre</label>
```

**Estatus:** ⏸️ No prioritario - IDs funcionales para accesibilidad

---

## Cambios Realizados

### Resumen de Archivos Creados

```
✅ src/styles/components/_header.less (440 líneas)
✅ src/styles/components/_dark-mode-toggle.less (95 líneas)
✅ src/styles/components/_footer.less (295 líneas)
✅ src/styles/components/_news-content.less (120 líneas)
✅ src/styles/components/index.less (15 líneas)
✅ src/styles/legacy/_id-aliases.less (115 líneas)
```

### Resumen de Archivos Modificados

```
✅ src/styles/main.less (añadido import de components)
✅ src/styles/legacy/legacy.less (añadido import de _id-aliases)
✅ src/components/Header.astro (añadida clase .cs-navigation)
✅ src/components/Footer.astro (añadida clase .footer)
✅ src/components/DarkModeToggle.astro (añadida clase + data-js)
✅ src/layouts/NewsPostLayout.astro (añadida clase .news-content)
✅ src/layouts/BandoPostLayout.astro (añadida clase .news-content)
```

### Diff CSS - Ejemplo Header

**ANTES (en `root.less`):**

```less
@media only screen and (min-width: 0em) {
  #cs-navigation {
    width: 100%;
    box-sizing: border-box;
    /* ... 400+ líneas de estilos */
  }
}
```

**DESPUÉS:**

```less
// 📁 src/styles/components/_header.less (en @layer components)
@media only screen and (min-width: 0em) {
  .cs-navigation {
    width: 100%;
    box-sizing: border-box;
    /* ... 400+ líneas de estilos (mismo contenido, selector cambiado) */
  }
}

// 📁 src/styles/legacy/_id-aliases.less (en @layer legacy)
#cs-navigation {
  /* Placeholder - estilos en .cs-navigation */
}
```

### Diff HTML - Ejemplo Header

**ANTES:**

```html
<header id="cs-navigation">
  <div class="cs-container">
    <!-- ... -->
  </div>
</header>
```

**DESPUÉS:**

```html
<header id="cs-navigation" class="cs-navigation">
  <div class="cs-container">
    <!-- ... -->
  </div>
</header>
```

---

## Verificación y Testing

### Checklist por Lote

Para cada lote migrado, verificar:

- [ ] **Build sin errores**: `npm run build`
- [ ] **Lint sin errores**: `npm run lint`
- [ ] **DevTools**: Inspeccionar elemento y verificar que `.clase` aplica estilos
- [ ] **DevTools**: Verificar orden de capas con `@layer` en Chrome DevTools > Elements > Computed
- [ ] **Visual**: Captura antes/después de cada página afectada
- [ ] **Estados**: Verificar `:hover`, `:focus`, `:active` funcionan
- [ ] **Responsive**: Verificar breakpoints móvil/tablet/desktop
- [ ] **Dark Mode**: Verificar modo oscuro si aplica
- [ ] **JavaScript**: Verificar funcionalidad JS (toggles, navegación, etc.)

### Rutas para Testing Visual

#### Lote 1 (Header + Toggle)

- [ ] `/` (Home)
- [ ] `/noticias/` (Listado)
- [ ] `/noticias/[slug]` (Detalle)
- [ ] `/bandos/` (Listado)
- [ ] `/sobre-el-pueblo`
- [ ] `/contacto`
- [ ] Toggle dark mode en cada ruta

#### Lote 2 (Footer)

- [ ] `/` (Home)
- [ ] Cualquier página (footer es global)

#### Lote 3 (News Content)

- [ ] `/noticias/[cualquier-noticia]`
- [ ] `/bandos/[cualquier-bando]`
- [ ] Verificar formateo markdown (headers, listas, imágenes, código)

#### Lote 4 (Secciones) - Cuando se implemente

- [ ] `/` - `#hero`, `#services`, `#sbs`, `#sbs-r`, `#gallery`, `#reviews`
- [ ] `/sobre-el-pueblo` - `#sbs`
- [ ] `/proyectos` - `#gallery`
- [ ] `/testimonios` - `#reviews`
- [ ] `/buscar` - `#search-section`
- [ ] `/contacto` - `#cs-contact`, `#cs-form`

### Herramientas de Testing

**Visual Regression Testing (opcional):**

```bash
# Si quieres automatizar capturas
npm install -D playwright
# Crear tests en tests/visual/
```

**Manual Testing:**

```bash
# 1. Servidor de desarrollo
npm run dev

# 2. Build de producción
npm run build
npm run preview

# 3. Comparar ambos
```

---

## Plan de Retirada de Aliases

### Fase 1: Migración Dual (✅ ACTUAL)

**Duración:** 2-4 semanas

- Ambos selectores coexisten (`id="..." class="..."`)
- CSS en dos capas (components + legacy)
- JavaScript usa `getElementById` (aún no migrado)

**Objetivo:** Garantizar cero breaking changes

---

### Fase 2: Verificación Completa

**Duración:** 1-2 semanas

**Checklist:**

- [ ] Todas las rutas probadas en móvil/tablet/desktop
- [ ] Dark mode verificado en todos los componentes
- [ ] JavaScript funcionando correctamente
- [ ] No hay regresiones visuales
- [ ] Lighthouse/WAVE no reporta errores de accesibilidad
- [ ] Performance no degradada (revisar Lighthouse)

**Herramientas:**

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# Accesibilidad
npm install -D @axe-core/cli
axe http://localhost:4321
```

---

### Fase 3: Migración de JavaScript

**Duración:** 1 semana

Migrar hooks JavaScript de `getElementById` a `data-js`:

**ANTES:**

```javascript
const darkModeToggle = document.getElementById('dark-mode-toggle');
```

**DESPUÉS:**

```javascript
const darkModeToggle = document.querySelector('[data-js="dark-mode-toggle"]');
```

**Archivos a modificar:**

| Archivo                         | Selector actual                        | Nuevo selector                                    |
| ------------------------------- | -------------------------------------- | ------------------------------------------------- |
| `DarkModeToggle.astro` (script) | `getElementById('dark-mode-toggle')`   | `querySelector('[data-js="dark-mode-toggle"]')`   |
| `src/js/nav.js`                 | `getElementById('cs-navigation')`      | `querySelector('[data-js="navigation"]')`         |
| `src/js/nav.js`                 | `getElementById('mobile-menu-toggle')` | `querySelector('[data-js="mobile-menu-toggle"]')` |

**Ventajas de `data-js`:**

- Separa hooks JS de IDs semánticos
- Más claro para otros desarrolladores
- No interfiere con selectores CSS

---

### Fase 4: Retirada de IDs del HTML

**Duración:** 1 semana

**Proceso:**

1. **Commit separado por componente** (para fácil rollback)
2. **Eliminar atributos `id=""` del HTML**
3. **Eliminar aliases de `_id-aliases.less`**
4. **Verificar build y tests**

**Ejemplo Header:**

```html
<!-- ANTES (Fase 1-3) -->
<header id="cs-navigation" class="cs-navigation" data-js="navigation">
  <!-- DESPUÉS (Fase 4) -->
  <header class="cs-navigation" data-js="navigation"></header>
</header>
```

**PR pequeños:**

- PR #1: Remover IDs de Header + DarkModeToggle
- PR #2: Remover ID de Footer
- PR #3: Remover IDs de News Content
- PR #4: Remover IDs de secciones (cuando estén migradas)

---

### Fase 5: Limpieza Final

**Duración:** 1-2 días

1. **Eliminar archivo `_id-aliases.less`**
2. **Eliminar import en `legacy.less`**
3. **Actualizar documentación**
4. **Cerrar ticket de migración**

```bash
# Eliminar archivo
rm src/styles/legacy/_id-aliases.less

# Remover import de legacy.less
# (eliminar línea @import "./_id-aliases.less")
```

---

## Hooks JavaScript

### Estrategia de Data Attributes

En lugar de depender de IDs para JavaScript, usamos `data-js`:

**Ventajas:**

- ✅ Separa semántica CSS de hooks JS
- ✅ Más explícito para otros desarrolladores
- ✅ No interfiere con navegación por anclaje (`#section`)
- ✅ Compatible con múltiples elementos (si se necesita)

**Patrón recomendado:**

```html
<!-- HTML -->
<button
  class="dark-mode-toggle"
  data-js="dark-mode-toggle"
  aria-pressed="false"
>
  Toggle
</button>

<!-- JavaScript -->
<script>
  const toggle = document.querySelector('[data-js="dark-mode-toggle"]');
  if (toggle) {
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
    });
  }
</script>
```

### Tabla de Migración JS

| Elemento           | ID actual               | data-js futuro                   | Archivo JS             | Prioridad |
| ------------------ | ----------------------- | -------------------------------- | ---------------------- | --------- |
| Dark Mode Toggle   | `#dark-mode-toggle`     | `data-js="dark-mode-toggle"`     | `DarkModeToggle.astro` | Alta ⚠️   |
| Navigation         | `#cs-navigation`        | `data-js="navigation"`           | `nav.js`               | Alta ⚠️   |
| Mobile Menu Toggle | `#mobile-menu-toggle`   | `data-js="mobile-menu-toggle"`   | `nav.js`               | Alta ⚠️   |
| Cookie Settings    | `#open-cookie-settings` | `data-js="open-cookie-settings"` | (script inline)        | Media     |
| Contact Form       | `#cs-form`              | `data-js="contact-form"`         | (si existe)            | Baja      |

---

## FAQ

### ¿Por qué usar clases en lugar de IDs?

**Especificidad:** Un ID (`#header`) tiene especificidad de `0,1,0,0`, mientras que una clase (`.header`) tiene `0,0,1,0`. Esto hace que las clases sean más fáciles de sobrescribir sin usar `!important`.

**Reutilización:** Las clases pueden aplicarse a múltiples elementos. Los IDs deben ser únicos en el documento.

**Mejores prácticas:** Los IDs deberían reservarse para navegación por anclaje (`#seccion`) o hooks JavaScript, no para estilos.

---

### ¿Qué pasa si uso `:where()` incorrectamente?

`:where()` reduce la especificidad a `0,0,0,0`, lo que puede hacer que tus estilos sean sobrescritos por cualquier cosa.

**Úsalo solo cuando:**

- Necesites evitar conflictos con legacy code de alta especificidad
- Quieras crear estilos base fácilmente sobrescribibles
- Entiendas las consecuencias

```less
// ❌ MAL - demasiado genérico
:where(.header) {
  background: blue; // Cualquier cosa lo sobrescribe
}

// ✅ BIEN - scope limitado
.page :where(.header) {
  background: blue; // Solo afecta .header dentro de .page
}
```

---

### ¿Puedo eliminar los IDs inmediatamente?

**NO.** Sigue el plan de 5 fases:

1. ✅ Migración dual (HTML con `id + class`, CSS en ambas capas)
2. ✅ Verificación completa (testing exhaustivo)
3. ⏳ Migración de JavaScript (cambiar `getElementById` por `querySelector`)
4. ⏳ Retirada de IDs del HTML
5. ⏳ Limpieza final (eliminar `_id-aliases.less`)

---

### ¿Qué hago con IDs de formulario?

**Mantenerlos** si son necesarios para accesibilidad:

```html
<!-- ✅ BIEN - ID para <label for="...">, clase para estilos -->
<label for="email" class="form-label">Email</label>
<input id="email" class="form-input" type="email" />

<!-- ❌ MAL - ID para estilos -->
<style>
  #email {
    /* ... */
  }
</style>
```

---

### ¿Cómo verifico que las capas CSS funcionan?

**Chrome DevTools:**

1. Inspecciona el elemento (F12)
2. Ve a la pestaña **Computed**
3. Busca la propiedad (ej. `background-color`)
4. Verás el layer donde se originó:
   ```
   background-color: #faf9f7
   └─ @layer components → .cs-navigation
   ```

**Console:**

```javascript
// Ver todos los layers definidos
document.querySelectorAll('style, link[rel=stylesheet]').forEach(el => {
  console.log(el.sheet?.cssRules[0]?.cssText);
});
```

---

### ¿Puedo usar BEM para simplificar selectores complejos?

**Sí**, especialmente en componentes con muchos estados:

**ANTES (alto acoplamiento):**

```less
#header nav ul li a.active {
  color: blue;
}
```

**DESPUÉS (BEM ligero):**

```less
.header__nav-link.is-active {
  color: blue;
}

// O con :where() para bajar especificidad
.header :where(.header__nav-link.is-active) {
  color: blue;
}
```

**Convención BEM:**

- `.block` - Componente principal (`.header`)
- `.block__element` - Elemento hijo (`.header__logo`, `.header__nav`)
- `.block--modifier` - Variante (`.header--sticky`)
- `.is-state` - Estado temporal (`.is-active`, `.is-open`)

---

## Ticket de Seguimiento

### 🎫 Issue: "Retirar aliases legacy de IDs migrados"

**Descripción:**

Eliminar selectores ID del HTML y CSS tras verificación completa de la migración a clases.

**Criterios de aceptación:**

- [ ] Todas las rutas probadas visualmente (ver [Rutas para Testing](#rutas-para-testing-visual))
- [ ] JavaScript migrado de `getElementById` a `querySelector('[data-js="..."]')`
- [ ] Lighthouse score sin degradación (>90 Performance, >95 Accessibility)
- [ ] Dark mode funcional en todos los componentes
- [ ] Responsive design funcional en todos los breakpoints

**Checklist de retirada:**

- [ ] **Header**: Eliminar `id="cs-navigation"` de `Header.astro`
- [ ] **Dark Mode**: Eliminar `id="dark-mode-toggle"` de `DarkModeToggle.astro`
- [ ] **Footer**: Eliminar `id="footer"` de `Footer.astro`
- [ ] **News Content**: Eliminar `id="news-content"` de layouts
- [ ] **CSS**: Eliminar `src/styles/legacy/_id-aliases.less`
- [ ] **CSS**: Remover import de `_id-aliases.less` en `legacy.less`
- [ ] **Docs**: Actualizar este README con estado final

**Estimación:** 2-3 días (tras verificación completa)

---

## Recursos

### Documentación del proyecto

- [INDEX.md](./INDEX.md) - Documentación principal ITCSS
- [ARCHITECTURE_EXPLAINED.md](./ARCHITECTURE_EXPLAINED.md) - Explicación de capas
- [TOKENS_README.md](./TOKENS_README.md) - Sistema de tokens de diseño
- [BREAKPOINTS_GUIDE.md](./BREAKPOINTS_GUIDE.md) - Mixins de breakpoints

### Enlaces externos

- [ITCSS Architecture](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/)
- [CSS Cascade Layers](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
- [`:where()` pseudo-class](https://developer.mozilla.org/en-US/docs/Web/CSS/:where)
- [BEM Methodology](https://getbem.com/)
- [Data Attributes for JS](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes)

---

## Changelog

### v1.0.0 - 2025-10-31

**Migrado:**

- ✅ Header (`#cs-navigation` → `.cs-navigation`)
- ✅ Dark Mode Toggle (`#dark-mode-toggle` → `.dark-mode-toggle`)
- ✅ Footer (`#footer` → `.footer`)
- ✅ News Content (`#news-content` → `.news-content`)

**Archivos creados:**

- `src/styles/components/_header.less`
- `src/styles/components/_dark-mode-toggle.less`
- `src/styles/components/_footer.less`
- `src/styles/components/_news-content.less`
- `src/styles/components/index.less`
- `src/styles/legacy/_id-aliases.less`

**Archivos modificados:**

- `src/styles/main.less` (import de components)
- `src/styles/legacy/legacy.less` (import de aliases)
- `src/components/Header.astro` (dual selector + data-js)
- `src/components/DarkModeToggle.astro` (dual selector + data-js)
- `src/components/Footer.astro` (dual selector)
- `src/layouts/NewsPostLayout.astro` (dual selector)
- `src/layouts/BandoPostLayout.astro` (dual selector)

**Pendiente:**

- ⏳ Lote 4: Secciones de páginas (#hero, #services, #sbs, etc.)
- ⏳ Migración de JavaScript a `data-js`
- ⏳ Retirada de aliases legacy
- ⏳ Limpieza final

---

**Última actualización:** 31 de octubre de 2025  
**Autor:** GitHub Copilot  
**Versión:** 1.0.0
