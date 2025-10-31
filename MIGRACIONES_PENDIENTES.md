# Migraciones CSS Pendientes

**Fecha:** 31 de octubre de 2025  
**Estado:** Fase 5 parcialmente completada

---

## ✅ Completado en Fase 5

### Header Component

- ✅ Migración de clases en `Header.astro` (.cs-_ → .c-_)
- ✅ Migración de clases en `nav.js` (14 cambios)
- ✅ Eliminación de patrones de clase dual en múltiples archivos (13 instancias)
- ✅ Migración de `TableOfContents.astro` y `table-of-contents.less`
- ✅ Migración de clases de utilidad (`cs-hide-on-mobile`, `cs-shadow-*`)
- ✅ Migración de `NewsRecentArticles.astro` (cs-picture → c-picture)

---

## ⚠️ PROBLEMAS IDENTIFICADOS - NO RESUELTOS

### Header Mobile Navigation

**Archivo:** `src/styles/components/_header.less`

**Problema:** Al intentar consolidar `header.less` (745 líneas) con `_header.less` (377 líneas), el menú móvil no funciona correctamente.

**Intentos realizados:**

1. ❌ Copiar estilos de dropdown solamente
2. ❌ Añadir imports de breakpoints y tokens
3. ❌ Copiar sección de navegación móvil (scaleX/translateX)
4. ❌ Añadir estilos base de .c-navigation dentro del @media móvil
5. ❌ Añadir .c-container dentro del @media móvil

**Síntomas:**

- El menú móvil no se abre correctamente
- Los efectos de animación no son los mismos que en el original
- Las transformaciones (scaleX, translateX) no funcionan igual

**Archivos afectados:**

- `src/styles/components/_header.less` (modificado, NO funcional)
- `src/styles/components/header.less` (original, FUNCIONAL pero no se usa)
- `src/components/Header.astro` (importa `_header.less`)

**Recomendación para continuar:**

- **REVERTIR** los cambios en `_header.less` a su estado pre-consolidación
- **MANTENER** `header.less` como archivo principal
- **CAMBIAR** el import en `Header.astro` de `_header.less` → `header.less`
- La consolidación requiere un análisis más profundo de la arquitectura CSS móvil-first

---

## 📋 Pendiente de Migración

### 1. FAQ Component

**Archivo:** `src/components/FAQ.astro`

```javascript
// Línea 123
const faqItems = Array.from(document.querySelectorAll('.cs-faq-item'));
```

**Acción:** Cambiar `.cs-faq-item` → `.c-faq-item` en JavaScript y CSS correspondiente

---

### 2. CSPicture Component (Template)

**Archivo:** `src/components/TemplateComponents/CSPicture.astro`

```less
// Línea 66
@import '../../styles/components/cs-picture.less';
```

**Acción:**

- Renombrar archivo `cs-picture.less` → `c-picture.less` o `_picture.less`
- Actualizar import
- Migrar todas las clases `.cs-*` dentro del archivo

---

### 3. Table of Contents

**Archivo:** `src/styles/components/table-of-contents.less`

```less
// Línea 54
&.cs-toc-current {
```

**Acción:** Cambiar `.cs-toc-current` → `.c-toc-current` (se olvidó esta clase)

---

### 4. Comentarios en HTML (limpieza)

**Archivos afectados:**

- `src/pages/index.astro` (líneas 290, 351, 412)
- `src/pages/proyectos.astro` (líneas 94, 155, 217)
- `src/pages/proyectos/proyecto-1.astro` (líneas 89, 150, 212)
- `src/pages/proyectos/proyecto-2.astro` (líneas 89, 150, 212)

**Comentarios obsoletos:**

```html
<!-- To add more images, copy and paste this row's picture tags here in order from cs-picture-1 to cs-picture-3 -->
```

**Acción:** Actualizar comentarios `cs-picture-*` → `c-picture-*`

---

### 5. Form ID Legacy

**Archivo:** `src/styles/pages/contacto.less`

```less
// Línea 327
.c-contact :where(#cs-form) {
```

**Acción:** Evaluar si cambiar `#cs-form` → `#c-form` (requiere cambio en HTML también)

---

### 6. News Layout Floater

**Archivo:** `src/styles/layouts/news-recent-articles.less`

```less
// Línea 261
:where(.cs-floater) {
```

**Acción:** Cambiar `.cs-floater` → `.c-floater` (verificar HTML correspondiente)

---

### 7. Hero Background

**Archivo:** `src/styles/pages/index.less`

```less
// Línea 245
.hero :where(.cs-background) {
```

**Acción:** Cambiar `.cs-background` → `.c-background` (verificar HTML)

---

### 8. Base Component Import

**Archivo:** `src/styles/components/index.less`

```less
// Línea 12
@import './_cs-base.less';
```

**Acción:**

- Renombrar `_cs-base.less` → `_base.less`
- Actualizar import
- Migrar clases internas si las hay

---

### 9. Header Examples (documentación)

**Archivo:** `src/styles/examples/header-migrated.less`

Contiene referencias obsoletas a:

- `.cs-open`
- `#cs-navigation`
- `.cs-active`

**Acción:** Actualizar ejemplos o eliminar archivo si ya no se usa

---

## 🔍 Archivos con `cs-` para Revisar

Ejecutar búsqueda exhaustiva:

```bash
grep -r "cs-" src/ --include="*.astro" --include="*.less" --include="*.js"
```

**Áreas sospechosas:**

- Componentes de cookies (`analytics-consent` es válido, no migrar)
- Selectores `:where()` que pueden tener `.cs-*`
- Comentarios que mencionan clases antiguas

---

## 🎯 Plan de Acción Recomendado

### Paso 1: Revertir Header (PRIORITARIO)

```bash
# En Header.astro, cambiar:
import '../styles/components/_header.less';
# Por:
import '../styles/components/header.less';
```

### Paso 2: Migrar FAQ

1. Actualizar JavaScript en `FAQ.astro`
2. Actualizar CSS correspondiente
3. Probar funcionalidad

### Paso 3: Migrar CSPicture Template

1. Renombrar archivo CSS
2. Migrar clases internas
3. Actualizar imports
4. Actualizar comentarios en páginas

### Paso 4: Migrar elementos aislados

- Table of Contents (`.cs-toc-current`)
- Form ID si es necesario
- Floater, Background, etc.

### Paso 5: Limpieza final

- Actualizar comentarios obsoletos
- Revisar archivos de ejemplos
- Ejecutar grep final para verificar

---

## 📝 Notas Importantes

### No migrar:

- ✅ `analytics-consent` (nombre de localStorage, no clase CSS)
- ✅ Referencias en comentarios que son documentación
- ✅ Código dentro de strings literales no relacionados con CSS

### Precaución:

- ⚠️ Cualquier consolidación de archivos CSS requiere testing exhaustivo
- ⚠️ Las arquitecturas móvil-first son complejas, no asumir que copiar/pegar funciona
- ⚠️ Siempre verificar imports de variables y mixins LESS

### Herramientas:

El script `scripts/migrate-cs-classes.js` puede ayudar pero requiere supervisión manual para:

- Selectores `:where()`
- IDs (`#cs-*`)
- Referencias en JavaScript
- Comentarios y documentación

---

## Estado del Repositorio

**Branch:** `feat/css-improvements`  
**Último commit:** Migración Fase 5 parcial (Header con problemas)

**Recomendación:** Crear nuevo branch desde `develop` antes de continuar para no perder trabajo actual pero poder empezar limpio.

---

**Documentado por:** GitHub Copilot  
**Revisión necesaria:** ✅ Antes de continuar
