# Legacy Cleanup Roadmap

## 🎯 Objetivo

Eliminar completamente `@layer legacy` del proyecto mediante migración progresiva y segura de todos los componentes restantes.

---

## 📊 Estado Actual

### Componentes Migrados ✅

| Componente        | Estado     | Archivos                    | Notas                 |
| ----------------- | ---------- | --------------------------- | --------------------- |
| Header/Navigation | ✅ Migrado | Header.astro, \_header.less | data-js aplicado      |
| Footer            | ✅ Migrado | Footer.astro, \_footer.less | Sin IDs               |
| Dark Mode Toggle  | ✅ Migrado | DarkModeToggle.astro        | data-js aplicado      |
| News Content      | ✅ Migrado | \_news-content.less         | Estilos en components |

### Pendientes de Migración ⏸️

| Componente      | Complejidad | Ocurrencias | Prioridad |
| --------------- | ----------- | ----------- | --------- |
| `.cs-*` Classes | ALTA        | ~50+        | 🔴 Alta   |
| Page Sections   | MEDIA       | ~10         | 🟡 Media  |
| Form Inputs     | BAJA        | ~5          | 🟢 Baja   |

---

## 📅 Roadmap en Fases

### **Fase 1: Migración de Clases CodeStitch (`.cs-*` → `.c-*`)**

**Fecha estimada:** Q1 2026  
**Complejidad:** 🔴 ALTA  
**Riesgo:** 🟡 MEDIO

#### Alcance

Reemplazar todas las clases `.cs-*` por `.c-*` en HTML/Astro.

**Archivos afectados (~15 archivos):**

```
src/pages/
  ├── index.astro (~40 ocurrencias)
  ├── sobre-el-pueblo.astro (~10)
  ├── contacto.astro (~5)
  ├── proyectos.astro (~3)
  └── testimonios.astro (~5)

src/layouts/
  ├── NewsRecentArticles.astro (~5)
  ├── BandosRecentArticlesWithSidebar.astro (~3)
  └── NewsRecentArticlesWithSidebar.astro (~3)

src/components/
  ├── FAQ.astro (~5)
  ├── GoogleMap.astro (~3)
  └── CTA.astro (~2)
```

#### Estrategia de Migración

**Opción A: Manual (Recomendada para primera vez)**

1. Crear branch `feat/migrate-cs-classes`
2. Archivo por archivo, reemplazar `.cs-*` por `.c-*`
3. Testing visual después de cada archivo
4. Commit por archivo para fácil revert

**Opción B: Script Automatizado**

```javascript
// scripts/migrate-cs-classes.js
const replacements = {
  'cs-topper': 'c-topper',
  'cs-title': 'c-title',
  'cs-text': 'c-text',
  'cs-button-solid': 'c-button',
  'cs-button-transparent': 'c-button--outline',
  // ... más mappings
};

// Aplicar con find-and-replace en todos los .astro
```

#### Checklist Pre-migración

- [ ] Compilar proyecto: `npm run build`
- [ ] Ejecutar análisis CSS: `npm run analyze:css`
- [ ] Capturar screenshots de todas las páginas
- [ ] Crear branch de trabajo
- [ ] Backup de archivos críticos

#### Checklist Post-migración

- [ ] Testing visual completo (ver sección Testing)
- [ ] Compilar sin errores
- [ ] Stylelint pasa sin errores
- [ ] Dark mode funciona
- [ ] Responsive funciona en todos los breakpoints
- [ ] Ejecutar `npm run purge:dry` y verificar

#### Eliminación de Aliases

Una vez verificado todo:

**Eliminar de `legacy/_id-aliases.less`:**

```less
// Eliminar TODOS los bloques :where(.cs-*)
:where(.cs-topper) {
}
:where(.cs-title) {
}
// ... (50+ selectores)
```

#### Métricas de Éxito

- ✅ 0 ocurrencias de `class="cs-` en archivos `.astro`
- ✅ 0 aliases `:where(.cs-*)` en legacy
- ✅ Todas las páginas se ven idénticas
- ✅ Reducción ~5-10 KB en CSS

---

### **Fase 2: Migración de Secciones de Página**

**Fecha estimada:** Q2 2026  
**Complejidad:** 🟡 MEDIA  
**Riesgo:** 🟢 BAJO

#### Alcance

Convertir IDs de secciones (`#hero`, `#services`, etc.) en componentes BEM.

**IDs a Migrar:**

| ID Actual     | Clase Nueva                | Componente              | Archivo                            |
| ------------- | -------------------------- | ----------------------- | ---------------------------------- |
| `#hero`       | `.c-hero`                  | Hero section            | index.astro                        |
| `#services`   | `.c-services`              | Services grid           | index.astro                        |
| `#sbs`        | `.c-side-by-side`          | Content blocks          | index.astro, sobre-el-pueblo.astro |
| `#sbs-r`      | `.c-side-by-side--reverse` | Content blocks reversed | index.astro                        |
| `#gallery`    | `.c-gallery`               | Image gallery           | index.astro                        |
| `#reviews`    | `.c-reviews`               | Testimonials            | index.astro, testimonios.astro     |
| `#cs-contact` | `.c-contact`               | Contact section         | contacto.astro                     |
| `#cs-form`    | `.c-form`                  | Contact form            | contacto.astro                     |

#### Estrategia

**Para cada sección:**

1. **Crear componente en `components/`:**

   ```less
   // src/styles/components/_hero.less
   .c-hero {
     // Estilos migrados desde #hero
   }
   ```

2. **Actualizar HTML:**

   ```html
   <!-- Antes -->
   <section id="hero" class="hero">
     <!-- Después -->
     <section class="c-hero"></section>
   </section>
   ```

3. **Eliminar de legacy:**

   ```less
   // Eliminar #hero { } de legacy/pages/
   ```

4. **Testing visual**

#### Checklist

- [ ] Todos los IDs eliminados del HTML
- [ ] Todos los componentes creados en `components/`
- [ ] Todos los selectores `#id` eliminados de CSS
- [ ] Stylelint pasa sin warnings de IDs
- [ ] Testing visual OK

---

### **Fase 3: Form Inputs (Caso Especial)**

**Fecha estimada:** Q2 2026  
**Complejidad:** 🟢 BAJA  
**Riesgo:** 🟢 BAJO

#### Estrategia

Form inputs **MANTIENEN** `id` por accesibilidad (`<label for="id">`).

**Solución:** Dual approach

```html
<!-- ✅ Mantener ID para accesibilidad -->
<label for="email">Email</label>
<input type="email" id="email" class="c-input" name="email" />
```

**CSS:**

```less
// ✅ Estilizar por clase
.c-input {
  border: 1px solid var(--color-border);
}

// ❌ NO usar #id para estilos
#email {
} // PROHIBIDO
```

**Stylelint:** No aplica `selector-max-id: 0` a formularios (ignorar).

---

### **Fase 4: Eliminación Completa de Legacy**

**Fecha estimada:** Q3 2026  
**Complejidad:** 🔴 ALTA  
**Riesgo:** 🟡 MEDIO

#### Pre-requisitos

- ✅ Fase 1 completa (`.cs-*` migrados)
- ✅ Fase 2 completa (IDs de sección migrados)
- ✅ Fase 3 completa (Forms revisados)
- ✅ Testing exhaustivo

#### Proceso

1. **Análisis con PurgeCSS:**

   ```bash
   npm run purge:dry
   cat dist/purge-analysis/*.analysis.txt
   ```

2. **Verificar que legacy está vacío:**

   ```bash
   # Contar líneas de CSS real (sin comentarios)
   grep -v "^[[:space:]]*\/\/" src/styles/legacy/*.less | grep -v "^[[:space:]]*$" | wc -l
   ```

3. **Eliminar directorio legacy:**

   ```bash
   rm -rf src/styles/legacy/
   ```

4. **Actualizar `main.less`:**

   ```less
   // Eliminar
   @layer legacy {
     @import './legacy/legacy.less';
   }
   ```

5. **Actualizar PostCSS config:**

   ```javascript
   // Eliminar exclusión de legacy en purge-css.js
   ```

6. **Testing final completo**

#### Métricas de Éxito

- ✅ Directorio `legacy/` eliminado
- ✅ `@layer legacy` eliminado de `main.less`
- ✅ Reducción ~40-50% tamaño CSS total
- ✅ Todas las páginas funcionan correctamente
- ✅ Stylelint pasa sin errores

---

## 🧪 Protocolo de Testing

### Testing Visual (Obligatorio en Cada Fase)

**Páginas a verificar:**

- [ ] **Home** (`/`) - Hero, services, SBS, gallery, reviews
- [ ] **Sobre el Pueblo** (`/sobre-el-pueblo`) - SBS sections
- [ ] **Noticias** (`/noticias`) - Listing + individual posts
- [ ] **Bandos** (`/bandos`) - Listing + individual posts
- [ ] **Contacto** (`/contacto`) - Form, map, contact info
- [ ] **Proyectos** (`/proyectos`) - Project listing
- [ ] **Testimonios** (`/testimonios`) - Reviews grid

**Estados a verificar:**

- [ ] `:hover` en todos los links/botones
- [ ] `:focus` en elementos interactivos (teclado)
- [ ] `:active` en botones
- [ ] Dark mode toggle funciona
- [ ] Modo claro y oscuro se ven correctos

**Breakpoints a verificar:**

- [ ] Mobile (320px - 767px)
- [ ] Tablet (768px - 1023px)
- [ ] Desktop (1024px+)
- [ ] Desktop XL (1280px+)

**Navegadores:**

- [ ] Chrome/Edge (últimas 2 versiones)
- [ ] Firefox (última versión)
- [ ] Safari (macOS/iOS)

### Testing Automatizado

```bash
# 1. Build
npm run build

# 2. Stylelint
npm run lint:css

# 3. PurgeCSS analysis
npm run purge:dry

# 4. Preview
npm run preview
```

---

## 📊 Tracking de Progreso

### Métricas Clave

| Métrica                | Antes   | Objetivo | Actual  |
| ---------------------- | ------- | -------- | ------- |
| Tamaño CSS Total       | ~125 KB | ~70 KB   | ~125 KB |
| IDs en CSS             | ~15     | 0        | ~5      |
| Aliases `.cs-*`        | ~50     | 0        | ~50     |
| Archivos en legacy/    | ~10     | 0        | ~8      |
| Especificidad promedio | 1,0,2   | 0,1,0    | 0,1,1   |

### Estado por Fase

- [x] **Fase 0:** IDs → data-js (Header, Footer, Toggle) ✅
- [ ] **Fase 1:** `.cs-*` → `.c-*` ⏸️
- [ ] **Fase 2:** IDs de sección → clases ⏸️
- [ ] **Fase 3:** Form inputs (revisión) ⏸️
- [ ] **Fase 4:** Eliminar legacy ⏸️

---

## 🚨 Rollback Plan

### Si algo sale mal en cualquier fase:

1. **Revertir commit:**

   ```bash
   git revert <commit-hash>
   ```

2. **Restaurar backup:**

   ```bash
   git checkout <branch-before-migration> -- src/
   ```

3. **Recompilar:**

   ```bash
   npm run build
   ```

4. **Verificar:**
   ```bash
   npm run preview
   ```

---

## 📋 Checklist General (Aplicable a Todas las Fases)

### Pre-migración

- [ ] Branch de trabajo creada
- [ ] Screenshots de estado actual capturados
- [ ] `npm run build` exitoso
- [ ] `npm run lint:css` sin errores críticos
- [ ] Backup de archivos a modificar

### Durante Migración

- [ ] Commits atómicos (uno por cambio lógico)
- [ ] Testing visual incremental
- [ ] Sin `!important` añadido
- [ ] Nomenclatura BEM consistente

### Post-migración

- [ ] Testing visual completo (ver protocolo)
- [ ] `npm run lint:css` pasa
- [ ] `npm run build` exitoso
- [ ] `npm run purge:dry` verificado
- [ ] Dark mode funcional
- [ ] Responsive OK en todos los breakpoints
- [ ] Performance no degradado
- [ ] Documentación actualizada

---

## 📚 Recursos

### Scripts Útiles

**Buscar todas las clases `.cs-*`:**

```bash
grep -rn "class=.*cs-" src/**/*.astro
```

**Contar ocurrencias:**

```bash
grep -ro "cs-[a-z-]*" src/**/*.astro | sort | uniq -c | sort -nr
```

**Verificar IDs en CSS:**

```bash
grep -rn "^#[a-z]" src/styles/**/*.less
```

### Documentación Relacionada

- [CSS_MIGRATION_COMPLETE.md](./CSS_MIGRATION_COMPLETE.md) - Estado actual
- [WHERE_MIGRATION_COMPLETE.md](./WHERE_MIGRATION_COMPLETE.md) - Migración `:where()`
- [CSS_OPTIMIZATION.md](./CSS_OPTIMIZATION.md) - Optimización y purgado

---

## 🎯 Objetivos Finales

Al completar este roadmap, el proyecto tendrá:

✅ **Arquitectura ITCSS Pura**

- 0 deuda técnica CSS
- Solo 4 capas: settings, tools, components, utilities
- Legacy completamente eliminado

✅ **Nomenclatura Consistente**

- 100% BEM ligero
- 0 IDs en CSS
- Clases `.c-*` para componentes
- Clases `.u-*` para utilidades

✅ **Performance Optimizada**

- ~40-50% reducción de tamaño CSS
- PurgeCSS en todas las capas
- Especificidad baja y predecible

✅ **Mantenibilidad**

- Código predecible y escalable
- Stylelint en modo error
- Convenciones documentadas

---

**Última actualización:** 31 Octubre 2025  
**Responsable:** Equipo de Desarrollo  
**Revisión:** Trimestral
