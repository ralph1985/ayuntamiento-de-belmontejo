# 🔍 Auditoría Completa de Componentes `.cs-*` en src/styles/pages

## 📌 Resumen Ejecutivo

**Total de coincidencias encontradas:** 192 componentes `.cs-*`  
**Archivos analizados:** 8 archivos en `src/styles/pages/`  
**Fecha:** 31 de octubre de 2025

---

## 📊 Componentes por Archivo

### 1. **contacto.less** (24 componentes)

#### Componentes Base

- `.cs-container` (3 usos)
- `.cs-content` (1 uso)
- `.cs-topper` (2 usos)
- `.cs-title` (2 usos)
- `.cs-text` (2 usos)
- `.cs-button-solid` (1 uso)

#### Componentes Específicos de Formulario

- `.cs-label-message` (3 usos) - **NUEVO: No estaba en inventario**

#### Componentes de Sección

- `.cs-right-section` (3 usos) - **NUEVO: No estaba en inventario**
- `.cs-header` (1 uso) - **NUEVO: No estaba en inventario**
- `.cs-link` (1 uso) - **NUEVO: No estaba en inventario**
- `.cs-block` (2 usos) - **NUEVO: No estaba en inventario**
- `.cs-bg-picture` (4 usos) - **NUEVO: No estaba en inventario**

**Propuestas de nomenclatura BEM:**

```less
.cs-label-message    → .c-label--message
.cs-right-section    → .c-contact-section  // o .c-section--contact
.cs-header           → .c-section__header
.cs-link             → .c-link
.cs-block            → .c-block
.cs-bg-picture       → .c-bg-picture;
```

---

### 2. **proyectos.less** (13 componentes)

#### Componentes de Layout

- `.cs-container` (1 uso)
- `.cs-image-group` (1 uso)

#### Componentes de Grid/Fila

- `.cs-row` (1 uso)
- `.cs-row-1` (1 uso) - **NUEVO: No estaba en inventario**
- `.cs-row-2` (1 uso) - **NUEVO: No estaba en inventario**
- `.cs-row-3` (1 uso) - **NUEVO: No estaba en inventario**

#### Componentes de Picture Numeradas

- `.cs-picture` (1 uso)
- `.cs-picture1` (3 usos) - **NUEVO: No estaba en inventario**
- `.cs-picture2` (3 usos) - **NUEVO: No estaba en inventario**
- `.cs-picture3` (3 usos) - **NUEVO: No estaba en inventario**

**Propuestas de nomenclatura BEM:**

```less
.cs-row
  →
  .c-gallery__row
  .cs-row-1
  →
  .c-gallery__row--1
  .cs-row-2
  →
  .c-gallery__row--2
  .cs-row-3
  →
  .c-gallery__row--3
  .cs-picture1
  →
  .c-gallery__picture--1
  .cs-picture2
  →
  .c-gallery__picture--2
  .cs-picture3
  →
  .c-gallery__picture--3;
```

---

### 3. **sobre-el-pueblo.less** (24 componentes)

#### Componentes Base

- `.cs-container` (2 usos)
- `.cs-topper` (2 usos)
- `.cs-title` (2 usos)
- `.cs-text` (2 usos)
- `.cs-h3` (2 usos)
- `.cs-button-solid` (1 uso)

#### Componentes de Layout Split

- `.cs-left` (3 usos)
- `.cs-right` (3 usos)
- `.cs-picture` (1 uso)
- `.cs-picture1` (1 uso)
- `.cs-picture2` (2 usos)

#### Componentes de Flex/Quote

- `.cs-flex-group` (2 usos)
- `.cs-flex-p` (2 usos)
- `.cs-name` (2 usos)
- `.cs-job` (2 usos)
- `.cs-quote-icon` (2 usos)

---

### 4. **index.less** (115 componentes) 🔥

#### Componentes Base (Alta Frecuencia)

- `.cs-container` (10 usos)
- `.cs-topper` (8 usos)
- `.cs-title` (8 usos)
- `.cs-text` (8 usos)
- `.cs-button-solid` (4 usos)
- `.cs-button-transparent` (1 uso)

#### Componentes de Layout Split

- `.cs-left` (6 usos)
- `.cs-right` (6 usos)
- `.cs-content` (2 usos)

#### Componentes de Media

- `.cs-picture` (5 usos)
- `.cs-picture1` (4 usos)
- `.cs-picture2` (6 usos)
- `.cs-img` (1 uso)
- `.cs-image-group` (1 uso)
- `.cs-background` (1 uso) - **NUEVO: No estaba en inventario**

#### Componentes de Grid/Gallery

- `.cs-row` (1 uso)
- `.cs-row-1` (1 uso)
- `.cs-row-2` (1 uso)
- `.cs-row-3` (1 uso)

#### Componentes de Flex/Quote

- `.cs-flex-group` (5 usos)
- `.cs-flex-p` (5 usos)
- `.cs-name` (5 usos)
- `.cs-job` (5 usos)
- `.cs-quote-icon` (5 usos)
- `.cs-h3` (2 usos)

#### Componentes de Testimonios/Reviews

- `.cs-card-group` (2 usos) - **NUEVO: No estaba en inventario**
- `.cs-item` (3 usos) - **NUEVO: No estaba en inventario**
- `.cs-item-img` (1 uso) - **NUEVO: No estaba en inventario**
- `.cs-item-p` (2 usos) - **NUEVO: No estaba en inventario**
- `.cs-reviewer` (2 usos) - **NUEVO: No estaba en inventario**
- `.cs-desc` (2 usos) - **NUEVO: No estaba en inventario**
- `.cs-item-stars` (1 uso) - **NUEVO: No estaba en inventario**

**Propuestas de nomenclatura BEM:**

```less
.cs-background
  →
  .c-background
  .cs-card-group
  →
  .c-review-cards
  .cs-item
  →
  .c-review-card
  .cs-item-img
  →
  .c-review-card__img
  .cs-item-p
  →
  .c-review-card__text
  .cs-reviewer
  →
  .c-review-card__author
  .cs-desc
  →
  .c-review-card__desc
  .cs-item-stars
  →
  .c-review-card__stars;
```

---

### 5. **buscar.less** (9 componentes)

#### Componentes de Layout

- `.cs-container` (3 usos)
- `.cs-search-wrapper` (3 usos) - **NUEVO: No estaba en inventario**
- `.cs-search-tips` (3 usos) - **NUEVO: No estaba en inventario**

**Propuestas de nomenclatura BEM:**

```less
.cs-search-wrapper → .c-search__wrapper .cs-search-tips → .c-search__tips;
```

---

### 6. **404.less** (0 componentes)

✅ Este archivo **NO usa componentes `.cs-*`**, usa clases específicas:

- `.error-container`
- `.navigation-links`
- `.btn-primary`

**Nota:** Este archivo ya está usando nomenclatura propia y no requiere migración.

---

### 7. **politica-de-cookies.less** (0 componentes)

✅ Este archivo **NO usa componentes `.cs-*`**, usa clases específicas:

- `.cookie-policy`
- `.container`
- `.cookie-policy-header`
- `.subtitle`
- `.last-updated`
- `.cookie-policy-content`
- `.policy-section`

**Nota:** Este archivo ya está usando nomenclatura propia y no requiere migración.

---

### 8. **testimonios.less** (0 componentes)

✅ Este archivo **NO usa componentes `.cs-*`**, usa clases específicas:

- `.container`
- `.review`
- `.profile`
- `.star-group`
- `.name`
- `.desc`

**Nota:** Este archivo ya está usando nomenclatura propia y no requiere migración.

---

## 🆕 Componentes Adicionales Descubiertos (No en Inventario Original)

### Componentes de Formulario (contacto.less)

1. `.cs-label-message` → `.c-label--message`

### Componentes de Sección (contacto.less)

2. `.cs-right-section` → `.c-contact-section`
3. `.cs-header` → `.c-section__header`
4. `.cs-link` → `.c-link`
5. `.cs-block` → `.c-block`
6. `.cs-bg-picture` → `.c-bg-picture`

### Componentes de Grid Numerados (proyectos.less, index.less)

7. `.cs-row-1` → `.c-gallery__row--1`
8. `.cs-row-2` → `.c-gallery__row--2`
9. `.cs-row-3` → `.c-gallery__row--3`
10. `.cs-picture1` → `.c-gallery__picture--1`
11. `.cs-picture2` → `.c-gallery__picture--2`
12. `.cs-picture3` → `.c-gallery__picture--3`

### Componentes de Testimonios/Reviews (index.less)

13. `.cs-card-group` → `.c-review-cards`
14. `.cs-item` → `.c-review-card`
15. `.cs-item-img` → `.c-review-card__img`
16. `.cs-item-p` → `.c-review-card__text`
17. `.cs-reviewer` → `.c-review-card__author`
18. `.cs-desc` → `.c-review-card__desc`
19. `.cs-item-stars` → `.c-review-card__stars`

### Componentes de Búsqueda (buscar.less)

20. `.cs-search-wrapper` → `.c-search__wrapper`
21. `.cs-search-tips` → `.c-search__tips`

### Otros

22. `.cs-background` → `.c-background`

---

## 📈 Estadísticas Finales

### Por Tipo de Componente

| Tipo          | Componentes Únicos | Ocurrencias Totales |
| ------------- | ------------------ | ------------------- |
| Typography    | 4                  | ~40                 |
| Buttons       | 2                  | ~8                  |
| Layout        | 8                  | ~50                 |
| Media         | 8                  | ~35                 |
| Content/Quote | 4                  | ~20                 |
| Reviews       | 7                  | ~10                 |
| Form          | 1                  | 3                   |
| Section       | 5                  | ~12                 |
| Search        | 2                  | 6                   |
| Gallery/Grid  | 6                  | ~15                 |
| **TOTAL**     | **47**             | **~192**            |

### Por Archivo

| Archivo                    | Componentes `.cs-*` | Estado                        |
| -------------------------- | ------------------- | ----------------------------- |
| `index.less`               | 115                 | ⚠️ Requiere migración         |
| `sobre-el-pueblo.less`     | 24                  | ⚠️ Requiere migración         |
| `contacto.less`            | 24                  | ⚠️ Requiere migración         |
| `proyectos.less`           | 13                  | ⚠️ Requiere migración         |
| `buscar.less`              | 9                   | ⚠️ Requiere migración         |
| `testimonios.less`         | 0                   | ✅ Ya usa nomenclatura propia |
| `404.less`                 | 0                   | ✅ Ya usa nomenclatura propia |
| `politica-de-cookies.less` | 0                   | ✅ Ya usa nomenclatura propia |
| **TOTAL**                  | **192**             |                               |

---

## 🎯 Plan de Acción Revisado

### Fase 1: Actualizar \_cs-base.less ✅ (COMPLETADO)

- [x] Crear módulo base con 19 componentes iniciales
- [x] Usar tokens al 100%
- [x] Agregar aliases en legacy layer

### Fase 2: Ampliar \_cs-base.less con Nuevos Componentes (PENDIENTE)

**2.1 Componentes de Formulario**

```less
// src/styles/components/_cs-base.less
.c-label--message {
  margin-bottom: clamp(2rem, 6.3vw, 3rem);
}
```

**2.2 Componentes de Sección/Background**

```less
.c-bg-picture {
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  transition: transform 0.6s;

  &:before {
    content: '';
    width: 100%;
    height: 100%;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.8) 100%
    );
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
  }
}

.c-contact-section {
  height: calc(320rem / 16);
  padding: clamp(1.5rem, 3vw, 2.5rem) clamp(1.25rem, 3vw, 2.5rem);
  border-radius: calc(8rem / 16);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  position: relative;
  overflow: hidden;

  &:hover {
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
  }
}

.c-section__header {
  font-size: clamp(1rem, 3vw, 1.25rem);
  font-weight: 700;
  line-height: 1.2em;
  margin-bottom: calc(8rem / 16);
  color: var(--color-text-white, var(--bodyTextColorWhite));
  display: block;
}

.c-link {
  font-size: clamp(1rem, 3vw, 1.25rem);
  line-height: 1.2em;
  text-decoration: none;
  margin-bottom: calc(20rem / 16);
  color: var(--color-text-white, var(--bodyTextColorWhite));
  display: block;
  position: relative;

  &:before {
    content: '';
    width: 0%;
    height: 2px;
    background: currentColor;
    opacity: 1;
    display: block;
    position: absolute;
    bottom: calc(-2rem / 16);
    left: 0;
    transition: width 0.3s;
  }

  &:hover:before {
    width: 100%;
  }
}

.c-block {
  display: block;
}

.c-background {
  // Definir estilos específicos
}
```

**2.3 Componentes de Gallery/Grid**

```less
.c-gallery__row {
  display: flex;
  gap: var(--spacing-md, 1rem);

  &--1 {
    /* estilos específicos row 1 */
  }
  &--2 {
    /* estilos específicos row 2 */
  }
  &--3 {
    /* estilos específicos row 3 */
  }
}

.c-gallery__picture {
  &--1 {
    /* estilos específicos picture 1 */
  }
  &--2 {
    /* estilos específicos picture 2 */
  }
  &--3 {
    /* estilos específicos picture 3 */
  }
}
```

**2.4 Componentes de Reviews/Testimonios**

```less
.c-review-cards {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg, 2rem);
}

.c-review-card {
  background: var(--color-bg-white, #fff);
  border-radius: var(--radius-md, 8px);
  padding: var(--spacing-lg, 2rem);
  box-shadow: var(--shadow-card, 0 4px 20px rgba(0, 0, 0, 0.1));
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
  }

  &__img {
    width: 100%;
    height: auto;
    border-radius: var(--radius-sm, 4px);
  }

  &__text {
    font-size: var(--font-size-body, 1rem);
    line-height: 1.6;
    color: var(--color-text, var(--bodyTextColor));
  }

  &__author {
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-text-dark, var(--headerColor));
  }

  &__desc {
    font-size: var(--font-size-sm, 0.875rem);
    color: var(--color-text-light, #575757);
  }

  &__stars {
    display: flex;
    gap: 0.25rem;
  }
}
```

**2.5 Componentes de Search**

```less
.c-search {
  &__wrapper {
    max-width: 600px;
    margin: 0 auto;
    padding: var(--spacing-md, 1rem);
  }

  &__tips {
    font-size: var(--font-size-sm, 0.875rem);
    color: var(--color-text-light, #666);
    margin-top: var(--spacing-sm, 0.5rem);
  }
}
```

### Fase 3: Actualizar Aliases en Legacy Layer

Agregar a `src/styles/legacy/_id-aliases.less`:

```less
// Nuevos aliases descubiertos
:where(.cs-label-message) {
  /* Alias → .c-label--message */
}
:where(.cs-right-section) {
  /* Alias → .c-contact-section */
}
:where(.cs-header) {
  /* Alias → .c-section__header */
}
:where(.cs-link) {
  /* Alias → .c-link */
}
:where(.cs-block) {
  /* Alias → .c-block */
}
:where(.cs-bg-picture) {
  /* Alias → .c-bg-picture */
}
:where(.cs-background) {
  /* Alias → .c-background */
}
:where(.cs-row-1) {
  /* Alias → .c-gallery__row--1 */
}
:where(.cs-row-2) {
  /* Alias → .c-gallery__row--2 */
}
:where(.cs-row-3) {
  /* Alias → .c-gallery__row--3 */
}
:where(.cs-picture1) {
  /* Alias → .c-gallery__picture--1 */
}
:where(.cs-picture2) {
  /* Alias → .c-gallery__picture--2 */
}
:where(.cs-picture3) {
  /* Alias → .c-gallery__picture--3 */
}
:where(.cs-card-group) {
  /* Alias → .c-review-cards */
}
:where(.cs-item) {
  /* Alias → .c-review-card */
}
:where(.cs-item-img) {
  /* Alias → .c-review-card__img */
}
:where(.cs-item-p) {
  /* Alias → .c-review-card__text */
}
:where(.cs-reviewer) {
  /* Alias → .c-review-card__author */
}
:where(.cs-desc) {
  /* Alias → .c-review-card__desc */
}
:where(.cs-item-stars) {
  /* Alias → .c-review-card__stars */
}
:where(.cs-search-wrapper) {
  /* Alias → .c-search__wrapper */
}
:where(.cs-search-tips) {
  /* Alias → .c-search__tips */
}
```

### Fase 4: Migración HTML por Lotes

**Lote 1:** index.less (115 componentes)  
**Lote 2:** sobre-el-pueblo.less (24 componentes)  
**Lote 3:** contacto.less (24 componentes)  
**Lote 4:** proyectos.less (13 componentes)  
**Lote 5:** buscar.less (9 componentes)

### Fase 5: Limpieza de Duplicaciones

Remover definiciones duplicadas de:

- root.less
- pages/index.less
- pages/sobre-el-pueblo.less
- pages/contacto.less
- pages/proyectos.less
- pages/buscar.less

---

## ✅ Checklist de Verificación

- [ ] Ampliar \_cs-base.less con 22 nuevos componentes
- [ ] Agregar 22 nuevos aliases en \_id-aliases.less
- [ ] Actualizar CS_COMPONENTS_INVENTORY.md con componentes nuevos
- [ ] Actualizar CS_COMPONENTS_MIGRATION.md con nuevas rutas
- [ ] Migrar HTML de index.astro
- [ ] Migrar HTML de sobre-el-pueblo.astro
- [ ] Migrar HTML de contacto.astro
- [ ] Migrar HTML de proyectos.astro
- [ ] Migrar HTML de buscar.astro
- [ ] Verificar visualmente todas las páginas
- [ ] Medir reducción de bundle size
- [ ] Remover duplicaciones de archivos LESS
- [ ] Remover aliases de legacy layer (Fase final)

---

## 📝 Notas Finales

1. **Componentes numerados** (`.cs-picture1`, `.cs-row-2`, etc.):
   - Considerar si son componentes genéricos o específicos de página
   - Evaluar si deben estar en `_cs-base.less` o en archivos de página específicos
   - Propuesta: Crear `.c-gallery__picture--{n}` como modificadores

2. **Componentes de reviews**:
   - Son específicos de la sección de testimonios en index.less
   - Pueden ser extraídos a un módulo separado `_reviews.less` o integrados en `_cs-base.less`

3. **Archivos sin componentes `.cs-*`**:
   - `testimonios.less`, `404.less`, `politica-de-cookies.less` ya usan nomenclatura propia
   - No requieren migración
   - Considerar estandarizar con BEM en futuras refactorizaciones

4. **Total de componentes únicos**: **47 componentes** (19 originales + 22 nuevos + 6 ya existentes pero no documentados)

---

**Documento generado:** 31 de octubre de 2025  
**Próxima revisión:** Después de Fase 2 (ampliación de \_cs-base.less)
