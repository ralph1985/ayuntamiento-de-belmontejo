# Plan de Migración de Media Queries a Mixins de Breakpoints

## 📊 Análisis Inicial

### Breakpoints Disponibles

```less
@bp-xs: 0em; // 0px (mobile first)
@bp-sm: 30em; // 480px (móvil grande)
@bp-md: 48em; // 768px (tablet)
@bp-lg: 64em; // 1024px (desktop)
@bp-xl: 80em; // 1280px (desktop grande)
@bp-2xl: 96em; // 1536px (desktop extra grande)
```

### Mixins Disponibles

```less
.mq-up(@bp)          // min-width (mobile-first)
.mq-down(@bp)        // max-width (desktop-first)
.mq-between(@min, @max) // rango específico
.mq-only(@bp)        // un solo breakpoint;
```

## 🎯 Lotes de Migración

### ⚠️ BLOQUEADOR: Mixins de Breakpoints Requieren Corrección

**PROBLEMA IDENTIFICADO:**
Los mixins `.mq-up()`, `.mq-down()`, `.mq-between()` en `src/styles/tools/_breakpoints.less` tienen el bloque de contenido comentado:

```less
.mq-up(@bp) {
  @media (min-width: @bp) {
    // & {
    //   .-();
    // }
  }
}
```

Esto hace que los mixins NO generen código CSS, dejando las media queries vacías.

**SOLUCIÓN NECESARIA:**

1. Descomentar el bloque `& { .-(); }` en los mixins
2. O rediseñar los mixins para no usar el patrón detached ruleset
3. Probar que funcionen correctamente

**ESTADO ACTUAL:**

- ❌ Migración del Lote 1 **REVERTIDA** (header.less y footer.less vuelven a @media)
- ⏳ Esperando corrección de mixins antes de continuar

---

### Lote 1: Layouts Principales ⏳ PENDIENTE (Bloqueado)

**Archivos:**

- ✅ `src/styles/components/_header.less` - 3 media queries migradas
- ✅ `src/styles/components/_footer.less` - 1 media query migrada

**Total Lote 1:** 4 media queries migradas (excluidas 2 base `@media (min-width: 0em)`)

**Mapeo Aplicado:**
| Archivo | Media Query Original | Migrado a | Notas |
|---------|---------------------|-----------|-------|
| header.less | `@media (min-width: 48em)` | `.mq-up(@bp-md)` | Tablet 768px |
| header.less | `@media (min-width: 64em)` | `.mq-up(@bp-lg)` | Desktop 1024px |
| header.less | `@media (min-width: 81.25em)` | `.mq-up(81.25em)` | Custom 1300px |
| footer.less | `@media (min-width: 64em)` | `.mq-up(@bp-lg)` | Desktop 1024px |

**Cambios realizados:**

- ✅ Sustituidas 4 media queries por mixins
- ✅ Mantenida estructura y especificidad
- ✅ No cambios en valores o propiedades
- ✅ Solo modificado envoltorio de media query

**Próxima verificación:**

- [ ] Probar en 360px (mobile)
- [ ] Probar en 1024px (desktop)
- [ ] Probar en 1440px (large desktop)
- [ ] Ejecutar `npm run lint:css`

---

### Lote 2: Componentes Base ⏳ PENDIENTE

**Archivos pendientes:**

- `src/styles/components/_cs-base.less`
- `src/styles/layouts/news-post-layout.less`
- `src/styles/layouts/bando-post-layout.less`
- `src/styles/layouts/news-recent-articles.less`
- `src/styles/layouts/news-recent-articles-with-sidebar.less`
- `src/styles/layouts/bandos-recent-articles-with-sidebar.less`

### Lote 3: Páginas Principales

**Archivos pendientes:**

- `src/styles/pages/index.less`
- `src/styles/layouts/news-post-layout.less` (detalle noticia)

### Lote 4: Resto de Páginas

**Archivos pendientes:**

- `src/styles/pages/contacto.less`
- `src/styles/pages/testimonios.less`
- `src/styles/pages/sobre-el-pueblo.less`
- `src/styles/pages/proyectos.less`
- Otros componentes

## 📝 Reglas de Migración

### 1. Patrón de Reemplazo

**ANTES:**

```less
@media only screen and (min-width: 64em) {
  .header {
    display: flex;
  }
}
```

**DESPUÉS:**

```less
.mq-up(@bp-lg) {
  .header {
    display: flex;
  }
}
```

### 2. Breakpoints Especiales

**Mobile-first (min-width: 0em):**

- ❌ NO usar mixin
- ✅ Estilos base fuera de media query

**Breakpoints custom:**

- Si es cercano a un token, usar el token
- Si es muy específico, usar valor literal en el mixin
- Ejemplo: `81.25em` (1300px) → `.mq-up(81.25em)`

### 3. Preservar Estructura

- ✅ Mantener jerarquía de selectores
- ✅ Mantener orden de propiedades
- ✅ No cambiar valores
- ✅ Solo cambiar envoltorio de media query

## 🔍 Checklist de Verificación

### Por Cada Archivo

- [ ] Identificar todas las media queries
- [ ] Mapear a breakpoints tokens
- [ ] Aplicar mixin correspondiente
- [ ] Verificar que no cambie la especificidad
- [ ] Verificar que no aumente el nesting (max 3 niveles)

### Por Cada Lote

- [ ] Comparar CSS compilado antes/después
- [ ] Probar en 3 anchos: 360px, 1024px, 1440px
- [ ] Ejecutar `npm run lint:css`
- [ ] Documentar cambios en commit

## 📈 Métricas

### Lote 1 - Header & Footer

**Antes:**

- Media queries con valores hard-coded: 6
- Media queries con variables: 0

**Después:**

- Media queries con mixins: 4 (excluyendo base @media 0em)
- Media queries eliminadas (base): 2

**Beneficios:**

- ✅ Tokens centralizados
- ✅ Sintaxis consistente
- ✅ Más mantenible
- ✅ Mejor legibilidad

## 🚀 Siguientes Pasos

1. ✅ Migrar Lote 1 (header.less, footer.less)
2. ⏳ Verificar visualmente
3. ⏳ Migrar Lote 2 (componentes base)
4. ⏳ Migrar Lote 3 (páginas principales)
5. ⏳ Migrar Lote 4 (resto)
6. ⏳ Actualizar README con guía de uso
7. ⏳ Eliminar media queries legacy restantes

---

**Fecha inicio:** 31 de octubre de 2025
**Estado:** En progreso - Lote 1
