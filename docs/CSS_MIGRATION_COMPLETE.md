# Migración CSS Completa - IDs, data-js y Limpieza Legacy

## 📅 Fechas: Octubre 2025

## 🎯 Resumen Ejecutivo

Se ha completado exitosamente la migración de IDs a clases y la implementación del patrón `data-js` para separar completamente CSS de JavaScript. El proyecto ahora cumple con `selector-max-id: 0` y tiene 0 `getElementById` en código de producción.

### Métricas Totales

- **Componentes migrados:** 9 componentes
- **Archivos HTML/Astro modificados:** 20+
- **Archivos CSS/LESS migrados:** 13
- **IDs eliminados:** 40+ (20 secciones + 20 JavaScript hooks)
- **`getElementById` eliminados:** 30+
- **Script automatizado creado:** `scripts/migrate-css-ids.js`

---

## ✅ Fase 1: Migración Inicial IDs a data-js (Octubre 2025)

### 1. Migración de IDs a `data-js` Attributes

#### **Problema**

Los selectores `#id` en CSS tienen alta especificidad y no deben usarse para estilos.  
Varios componentes usaban IDs tanto para JavaScript como para CSS.

#### **Solución**

Separar concerns: usar `data-js="*"` para JavaScript y mantener solo clases para estilos.

#### **Cambios Implementados (Primera Fase)**

| Componente           | Antes                     | Después                        | Archivo                |
| -------------------- | ------------------------- | ------------------------------ | ---------------------- |
| **Navigation**       | `id="cs-navigation"`      | `data-js="navigation"`         | `Header.astro`         |
| **Mobile Toggle**    | `id="mobile-menu-toggle"` | `data-js="mobile-menu-toggle"` | `Header.astro`         |
| **Dark Mode Toggle** | `id="dark-mode-toggle"`   | `data-js="data-mode-toggle"`   | `DarkModeToggle.astro` |
| **Footer**           | `id="footer"`             | `class="footer"`               | `Footer.astro`         |

#### **Archivos JavaScript Actualizados**

**`src/js/nav.js`:**

```javascript
// Antes
const CSnavbarMenu = document.getElementById('cs-navigation');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');

// Después
const CSnavbarMenu = document.querySelector('[data-js="navigation"]');
const mobileMenuToggle = document.querySelector(
  '[data-js="mobile-menu-toggle"]'
);
```

**`src/components/DarkModeToggle.astro`:**

```javascript
// Antes
const darkModeToggleButton = document.getElementById('dark-mode-toggle');

// Después
const darkModeToggleButton = document.querySelector(
  '[data-js="dark-mode-toggle"]'
);
```

---

### 2. Eliminación de Alias de IDs en Legacy

#### **Archivos Modificados**

**`src/styles/legacy/_id-aliases.less`:**

**Eliminado:**

- `#cs-navigation { }` - ✅ Ya no necesario, JS usa `data-js`
- `#dark-mode-toggle { }` - ✅ Ya no necesario, JS usa `data-js`
- `#footer { }` - ✅ Ya no necesario, sin dependencias JS
- `#news-content { }` - ✅ Ya no necesario, estilos en `.news-content`

**Mantenido (temporal):**

- Aliases `:where(.cs-*)` - Mantener hasta migración completa de HTML
- IDs de secciones de página (#hero, #services, etc.) - Migrados en Fase 3

---

## ✅ Fase 3: Migración Completa Section IDs → Classes (Octubre 2025)

### Problema Detectado

Tras la Fase 1, el header y footer dejaron de funcionar. La causa: **HTML cambió IDs a clases, pero CSS seguía usando selectores `#id`**.

### Solución: Script Automatizado

**Creado:** `scripts/migrate-css-ids.js`

El script migra automáticamente todos los selectores ID a clases en archivos LESS/CSS:

```javascript
const ID_TO_CLASS_MAP = {
  '#hero': '.hero',
  '#services': '.services',
  '#sbs': '.sbs',
  // ... 19 mappings totales
};
```

### Archivos HTML/Astro Migrados (16 archivos)

| Archivo                                | IDs Migrados                                                                 | Cambios |
| -------------------------------------- | ---------------------------------------------------------------------------- | ------- |
| `src/pages/index.astro`                | hero, services, sbs, sbs-r, gallery, reviews, featured-content, social-media | 8 IDs   |
| `src/pages/contacto.astro`             | cs-contact, cs-form                                                          | 2 IDs   |
| `src/pages/buscar.astro`               | main-content                                                                 | 1 ID    |
| `src/pages/sobre-el-pueblo.astro`      | sbs                                                                          | 1 ID    |
| `src/pages/testimonios.astro`          | reviews                                                                      | 1 ID    |
| `src/pages/proyectos.astro`            | gallery                                                                      | 1 ID    |
| `src/pages/proyectos/proyecto-1.astro` | gallery                                                                      | 1 ID    |
| `src/pages/proyectos/proyecto-2.astro` | gallery                                                                      | 1 ID    |
| `src/components/Landing.astro`         | int-hero, home-h                                                             | 2 IDs   |
| `src/components/GoogleMap.astro`       | google-map                                                                   | 1 ID    |
| `src/components/FAQ.astro`             | faq-1741                                                                     | 1 ID    |
| `src/components/CTA.astro`             | cta                                                                          | 1 ID    |
| `src/layouts/NewsRecentArticles.astro` | noticias-1144                                                                | 1 ID    |
| `src/layouts/BaseLayout.astro`         | main                                                                         | 1 ID    |
| `src/layouts/NewsPostLayout.astro`     | news-content                                                                 | 1 ID    |
| `src/layouts/BandoPostLayout.astro`    | news-content                                                                 | 1 ID    |

**Total:** 20+ IDs eliminados

### Archivos CSS/LESS Migrados (13 archivos)

Usuario ejecutó el script manualmente:

```bash
node scripts/migrate-css-ids.js
```

**Resultado:** 100+ reemplazos de selectores `#id` → `.class`

| Archivo CSS                                    | Selectores Migrados                              |
| ---------------------------------------------- | ------------------------------------------------ |
| `src/styles/pages/index.less`                  | #hero, #services, #sbs, #gallery, #reviews, etc. |
| `src/styles/pages/contacto.less`               | #cs-contact, #cs-form                            |
| `src/styles/pages/buscar.less`                 | #search-section                                  |
| `src/styles/pages/sobre-el-pueblo.less`        | #sbs                                             |
| `src/styles/pages/testimonios.less`            | #reviews                                         |
| `src/styles/pages/proyectos.less`              | #gallery                                         |
| `src/styles/components/google-map.less`        | #google-map                                      |
| `src/styles/components/cta.less`               | #cta                                             |
| `src/styles/components/landing.less`           | #int-hero, #home-h                               |
| `src/styles/components/faq.less`               | #faq-1741                                        |
| `src/styles/components/header.less`            | #cs-navigation                                   |
| `src/styles/components/footer.less`            | #footer                                          |
| `src/styles/layouts/news-recent-articles.less` | #noticias-1144                                   |

### Verificación

```bash
# Usuario confirmó:
"Ya se ve bien"
```

✅ **0 violaciones** de `selector-max-id: 0`

---

## ✅ Fase 4: JavaScript IDs → data-js Completo (Octubre 2025)

### Objetivo

Migrar TODOS los IDs usados por JavaScript a `data-js` attributes para completar la separación CSS ↔ JS.

### Componentes Migrados

#### 1. SearchBox.astro

**IDs migrados (6):**

- `id="search-input"` → `data-js="search-input"`
- `id="search-button"` → `data-js="search-button"`
- `id="search-results"` → `data-js="search-results"`
- `id="search-loading"` → `data-js="search-loading"`
- `id="search-no-results"` → `data-js="search-no-results"`
- `id="search-results-list"` → `data-js="search-results-list"`

**JavaScript actualizado:**

```javascript
// Antes
const searchInput = document.getElementById('search-input');

// Después
const searchInput = document.querySelector('[data-js="search-input"]');
```

**Total:** 6 `getElementById` → `querySelector`

#### 2. CookieConsent.astro

**IDs migrados (9):**

- `cookie-banner`
- `accept-all-cookies`
- `accept-necessary-only`
- `cookie-settings`
- `cookie-settings-modal`
- `close-cookie-modal`
- `necessary-cookies`
- `analytics-cookies`
- `save-cookie-preferences`

**Total:** 13 `getElementById` → `querySelector`

#### 3. FloatingCookieManager.astro

**IDs migrados (1):**

- `floating-cookie-manager`

**Total:** 5 `getElementById` → `querySelector`

#### 4. politica-de-cookies.astro

**IDs migrados (1):**

- `open-cookie-settings`

**Total:** 3 `getElementById` → `querySelector`

#### 5. Header.astro (ARIA simplificado)

**Cambio:**

- `id="cs-expanded-ul"` → `id="expanded-menu"`
- Mantiene accesibilidad ARIA (`aria-controls="expanded-menu"`)

### Resultado Final Fase 4

- ✅ **0 `getElementById`** en código de producción
- ✅ **20+ IDs** migrados a `data-js`
- ✅ **30+ reemplazos** getElementById → querySelector
- ✅ **Separación completa** CSS ↔ JavaScript
- ✅ **IDs de formulario preservados** (accesibilidad con `<label for="">`)

---

## 🎯 Estado Final del Proyecto

### Métricas Globales

| Métrica                        | Antes (Sept 2025) | Después (Oct 2025) | Mejora |
| ------------------------------ | ----------------- | ------------------ | ------ |
| IDs en HTML (secciones)        | 20+               | 0                  | -100%  |
| IDs JavaScript                 | 20+               | 0                  | -100%  |
| `getElementById` en producción | 30+               | 0                  | -100%  |
| Selectores `#id` en CSS        | 100+              | 0                  | -100%  |
| Violaciones `selector-max-id`  | ~100              | 0                  | -100%  |
| IDs formulario (preservados)   | 5                 | 5                  | ✅ OK  |

### Archivos Totales Modificados

- **HTML/Astro:** 20+ archivos
- **CSS/LESS:** 13 archivos
- **JavaScript:** 5 archivos
- **Scripts creados:** 1 (`migrate-css-ids.js`)
- **Configuración:** 1 (`.stylelintrc.json`)

---

#### **Configuración Actualizada**

**Archivo:** `.stylelintrc.json`

**Cambios:**

````json
{
  "defaultSeverity": "error", // ← Antes: "warning"
  "rules": {
    "selector-max-id": 0, // No IDs permitidos (error)
    "max-nesting-depth": [
      3,
      {
        "ignore": ["blockless-at-rules", "pseudo-classes"]
      }
    ],
    "block-no-empty": [
      true,
      {
        "severity": "warning" // Rulesets vacíos = warning (no error)
      }
    ],
    "selector-class-pattern": [
      "^([a-z0-9]+(?:-[a-z0-9]+)*)?(?:__(?:[a-z0-9]+(?:-[a-z0-9]+)*))?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$|^u-[a-z0-9-]+$",
      {
        "message": "Usa BEM ligero: bloque, __elemento, --modificador, o utilidades u-*",
        "severity": "error"
      }
    ]
## ⚙️ Configuración Stylelint (Actualizada)

### Stylelint Activado en Modo Error

**Archivo:** `.stylelintrc.json`

**Configuración actual:**

```json
{
  "defaultSeverity": "error", // ← Modo estricto activado
  "rules": {
    "selector-max-id": 0, // ✅ No IDs permitidos (error)
    "max-nesting-depth": [
      3,
      {
        "ignore": ["blockless-at-rules", "pseudo-classes"]
      }
    ],
    "block-no-empty": [
      true,
      {
        "severity": "warning" // Rulesets vacíos = warning (no error)
      }
    ],
    "selector-class-pattern": [
      "^([a-z0-9]+(?:-[a-z0-9]+)*)?(?:__(?:[a-z0-9]+(?:-[a-z0-9]+)*))?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$|^u-[a-z0-9-]+$",
      {
        "message": "Usa BEM ligero: bloque, __elemento, --modificador, o utilidades u-*",
        "severity": "error"
      }
    ]
  },
  "ignoreFiles": [
    "**/legacy/_id-aliases.less", // Ignorar aliases temporales (deprecated)
    "**/examples/**" // Ignorar archivos de ejemplo
  ]
}
````

**Beneficios:**

- ✅ Bloquea PRs con nuevos IDs en CSS
- ✅ Fuerza nomenclatura BEM consistente
- ✅ Permite archivos legacy/examples (excluidos)
- ✅ Mantiene 3 niveles máx de anidación
- ✅ **Resultado actual:** 0 violaciones en código de producción

---

## � Próximos Pasos (Trabajo Futuro)

### Opción A: Migración de Clases `.cs-*` → `.c-*`

**Estado:** ⏸️ PENDIENTE  
**Alcance:** 200+ ocurrencias en archivos `.astro`  
**Complejidad:** 🔴 ALTA  
**Prioridad:** 🟡 MEDIA

**Plan:**

1. Analizar todas las ocurrencias de `.cs-*` en el proyecto
2. Crear script de migración automática
3. Ejecutar migración archivo por archivo
4. Eliminar aliases `:where(.cs-*)` de `_id-aliases.less`
5. Ejecutar `purge:dry` para validar
6. Testing visual completo
7. Eliminar `_id-aliases.less` completamente

**Riesgo:** MEDIO - Requiere testing visual exhaustivo en todos los componentes

---

### Opción B: Eliminar @layer legacy Completamente

**Estado:** ⏸️ BLOQUEADO (requiere completar Opción A primero)  
**Complejidad:** 🔴 ALTA  
**Prioridad:** � BAJA

**Pre-requisitos:**

- ✅ Migración `.cs-*` → `.c-*` completa
- ✅ Todos los aliases eliminados
- ✅ Testing exhaustivo

**Plan:**

1. Verificar con PurgeCSS que `@layer legacy` esté vacío
2. Eliminar carpeta `src/styles/legacy/`
3. Eliminar imports de legacy en `root.less`
4. Eliminar capa `@layer legacy` de configuración
5. Reducción estimada: 15-20 KB CSS

**Beneficios esperados:**

- ✅ Reducción ~40-50% de tamaño CSS total
- ✅ Arquitectura ITCSS pura
- ✅ Cero deuda técnica CSS
- ✅ Mantenibilidad mejorada

---

---

## 📋 Convenciones Establecidas

### Regla 1: IDs Solo para Accesibilidad o Hooks JS

**Uso permitido de `id`:**

```html
<!-- ✅ Accesibilidad (label for) -->
<label for="email">Email</label>
<input type="email" id="email" name="email" />

<!-- ❌ NO usar para CSS -->
<div id="header">
  <!-- MAL -->

  <!-- ✅ Usar data-js para JavaScript -->
  <button data-js="mobile-toggle" class="c-toggle"></button>
</div>
```

**Selectores JavaScript:**

```javascript
// ✅ BIEN - data attributes
document.querySelector('[data-js="toggle"]');

// ❌ MAL - IDs
document.getElementById('toggle');
```

---

### Regla 2: Nomenclatura BEM Ligera

**Patrón:**

```
.bloque
.bloque__elemento
.bloque--modificador
.bloque__elemento--modificador
```

**Ejemplos:**

```less
.c-card {
} // Componente
.c-card__title {
} // Elemento
.c-card--featured {
} // Modificador
.c-card__title--large {
} // Elemento con modificador

.u-mt-md {
} // Utilidad
```

---

### Regla 3: Utilidades vs Componentes

**Cuándo usar utilidades:**

- Spacing puntual (1-2 propiedades)
- Alineaciones simples
- Display helpers

**Cuándo crear componente:**

- 3+ utilidades juntas permanentemente
- Lógica de layout compleja
- Reutilizable en múltiples lugares

**Ejemplo:**

```html
<!-- ✅ BIEN: Spacing puntual -->
<article class="c-card u-mt-lg">
  <!-- ❌ MAL: 5+ utilidades permanentes -->
  <div class="u-flex u-items-center u-justify-between u-p-md u-bg-primary">
    <!-- Crear .c-header-bar en su lugar -->
  </div>
</article>
```

---

## 🎯 Métricas de Calidad

### Antes de esta Migración

- IDs en CSS: ~10 selectores
- Especificidad promedio: 1,0,2 (alta)
- Stylelint: Modo warning (no bloquea)
- Legacy aliases: 80+ reglas vacías

### Después de esta Migración

- IDs en CSS: 0 (✅ eliminados los migrados)
- Especificidad promedio: 0,1,0 (media)
- Stylelint: Modo error (bloquea PRs)
- Legacy aliases: ~50 (solo `.cs-*` temporales)

### Objetivo Final (Post Fase 1-3)

- IDs en CSS: 0
- Especificidad promedio: 0,1,0
- Stylelint: Modo error activo
- Legacy aliases: 0
- `@layer legacy`: Eliminada completamente

---

## ✅ Checklist de Verificación

### Funcionalidad

- [x] Navigation hamburger toggle funciona
- [x] Dark mode toggle funciona
- [x] Navegación desktop funciona
- [x] Dropdowns de navegación funcionan
- [x] Footer se visualiza correctamente

### Compatibilidad

- [x] JavaScript usa `data-js` attributes
- [x] Stylelint no bloquea código válido
- [x] Legacy aliases mantienen compatibilidad temporal
- [x] View Transitions no se rompen

### Calidad

- [x] Sin IDs en CSS (excluidos los pendientes)
- [x] Nomenclatura BEM consistente
- [x] Máx 3 niveles de anidación
- [x] Documentación actualizada

---

## 📚 Documentación Relacionada

- 📘 [LEGACY_CLEANUP_ROADMAP.md](./LEGACY_CLEANUP_ROADMAP.md) - Plan futuro de limpieza
- 📗 [WHERE_MIGRATION_COMPLETE.md](./WHERE_MIGRATION_COMPLETE.md) - Migración `:where()`
- 📕 [CSS_OPTIMIZATION.md](./CSS_OPTIMIZATION.md) - Optimización y purgado
- 📙 [README.md](../README.md) - Documentación principal

---

## 🎓 Lecciones Aprendidas

### 1. Separar Concerns (CSS vs JS)

**Antes:** `id="header"` usado para CSS y JS  
**Después:** `class="c-header"` (CSS) + `data-js="navigation"` (JS)

**Beneficio:** Refactors de CSS no rompen JavaScript

---

### 2. Migración Progresiva

**No intentar:** Migrar todo en un solo PR  
**Mejor:** Fases iterativas con testing

**Beneficio:** Menor riesgo, más fácil de revertir

---

### 3. Aliases Temporales con `:where()`

**Técnica:** Usar `:where(.old-class)` con especificidad 0  
**Beneficio:** Compatibilidad sin interferir con nuevas clases

---

**Última actualización:** 31 Octubre 2025  
**Estado:** ✅ Fase de IDs Completada  
**Siguiente:** Migración .cs-_ → .c-_ (Futuro PR)
