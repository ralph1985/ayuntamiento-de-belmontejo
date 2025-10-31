# Guía de Migración - Sistema de Tokens de Diseño ITCSS

## 📋 Tabla de Contenidos

- [Introducción](#introducción)
- [Convención de Nombres](#convención-de-nombres)
- [Estrategia de Migración](#estrategia-de-migración)
- [Uso de Tokens](#uso-de-tokens)
- [Compatibilidad con Legacy](#compatibilidad-con-legacy)
- [Ejemplos Prácticos](#ejemplos-prácticos)
- [Checklist de Migración](#checklist-de-migración)

---

## 🎯 Introducción

Este proyecto ha implementado un **sistema de tokens de diseño** basado en **ITCSS** (Inverted Triangle CSS) con **CSS Cascade Layers** para organizar los estilos de forma escalable y mantenible.

### Objetivos del Sistema de Tokens

1. ✅ **Centralizar valores de diseño** en un único lugar
2. ✅ **Facilitar tematización** (modo claro/oscuro, etc.)
3. ✅ **Mejorar consistencia** visual en todo el proyecto
4. ✅ **Mantener compatibilidad** con código existente durante la migración
5. ✅ **Preparar para el futuro** con CSS custom properties

---

## 📐 Convención de Nombres

### Prefijos de Categorías

Todas las variables siguen una **nomenclatura kebab-case** con prefijos semánticos:

| Prefijo       | Descripción                        | Ejemplo                                  |
| ------------- | ---------------------------------- | ---------------------------------------- |
| `color-`      | Colores del sistema                | `--color-primary`, `@color-text-primary` |
| `font-`       | Tipografía (familia, tamaño, peso) | `--font-size-lg`, `@font-weight-bold`    |
| `space-`      | Espaciado y padding                | `--space-md`, `@space-xl`                |
| `bp-`         | Breakpoints para media queries     | `@bp-md`, `@bp-lg`                       |
| `z-`          | Índices z para apilamiento         | `--z-modal`, `@z-dropdown`               |
| `shadow-`     | Sombras                            | `--shadow-md`, `@shadow-dark-lg`         |
| `transition-` | Transiciones y animaciones         | `--transition-base`, `@transition-fast`  |
| `radius-`     | Border radius                      | `--radius-md`, `@radius-full`            |

### Estructura de Nombres por Categoría

#### 🎨 Colores

```less
// PATRÓN: @color-{categoria}-{variante}

// Fondos
@color-bg-main @color-bg-sections
@color-bg-dark
@color-bg-medium

// Textos
@color-text-primary
@color-text-secondary
@color-text-white

// Brand
@color-primary
@color-primary-light
@color-primary-dark

@color-secondary
@color-secondary-light
@color-secondary-dark

// Acento
@color-accent
@color-accent-light
@color-accent-dark

// UI
@color-border
@color-border-dark

// Estado
@color-success
@color-warning
@color-error
@color-info;
```

#### ✍️ Tipografía

```less
// Familias
@font-family-primary @font-family-heading
@font-family-mono

// Pesos
@font-weight-regular   // 400
@font-weight-bold      // 700
@font-weight-black     // 900

// Tamaños (escala t-shirt)
@font-size-xs          // 0.75rem (12px)
@font-size-sm          // 0.875rem (14px)
@font-size-md          // 1rem (16px)
@font-size-lg          // 1.125rem (18px)
@font-size-xl          // 1.25rem (20px)
@font-size-2xl         // 1.5rem (24px)
@font-size-3xl         // 1.875rem (30px)
@font-size-4xl         // 2.25rem (36px)
@font-size-5xl         // 3rem (48px)

// Tamaños fluidos (específicos del proyecto)
@font-size-topper
@font-size-header
@font-size-body

// Line height
@line-height-tight     // 1.2
@line-height-normal    // 1.5
@line-height-relaxed   // 1.75
@line-height-loose     // 2

// Letter spacing
@letter-spacing-tight
@letter-spacing-normal
@letter-spacing-wide
@letter-spacing-wider;
```

#### 📏 Espaciado

```less
// PATRÓN: @space-{tamaño} (escala t-shirt)

@space-xs // 0.25rem (4px)
@space-sm      // 0.5rem (8px)
@space-md      // 1rem (16px)
@space-lg      // 1.5rem (24px)
@space-xl      // 2rem (32px)
@space-2xl     // 3rem (48px)
@space-3xl     // 4rem (64px)
@space-4xl     // 6rem (96px)
@space-5xl     // 8rem (128px)

// Espaciados específicos
@space-section-padding;
```

#### 📱 Breakpoints

```less
// PATRÓN: @bp-{tamaño}

@bp-xs // 0em (0px)
@bp-sm         // 30em (480px)
@bp-md         // 48em (768px)
@bp-lg         // 64em (1024px)
@bp-xl         // 80em (1280px)
@bp-2xl        // 96em (1536px);
```

---

## 🔄 Estrategia de Migración

### Principios de Migración

1. **🔒 No Breaking Changes**: El código legacy sigue funcionando sin cambios
2. **📈 Progresiva**: Migrar componente por componente, no todo a la vez
3. **🛡️ Fallbacks**: Usar siempre fallbacks de LESS mientras migramos
4. **✅ Testear**: Verificar visualmente cada cambio

### Arquitectura de Capas

```
@layer base, components, utilities, legacy;

├── base (prioridad más baja)
│   ├── settings (← tokens.less aquí)
│   ├── tools
│   ├── generic
│   └── elements
├── components
├── utilities
└── legacy (prioridad más alta) ← CSS actual protegido
```

**⚠️ IMPORTANTE**: La capa `legacy` tiene **prioridad máxima**, lo que garantiza que los estilos actuales no se rompan durante la migración.

### Flujo de Importación

```less
// main.less
@layer base {
  @import './settings/index.less'; // ← Tokens cargados aquí
  // ...
}

@layer legacy {
  @import './legacy/legacy.less'; // ← CSS actual aquí
}
```

Los tokens están disponibles **ANTES** de cargar el CSS legacy, pero gracias a las **variables de compatibilidad**, todo sigue funcionando.

---

## 🚀 Uso de Tokens

### Doble Sistema: LESS + CSS Custom Properties

Cada token existe en **dos formatos**:

```less
// 1. Variable LESS (compilación estática)
@color-primary: #285c8d;

// 2. CSS Custom Property (runtime, tematización)
:root {
  --color-primary: @color-primary;
}
```

### ¿Cuándo Usar Cada Uno?

#### Usar Variables LESS (`@variable`)

- ✅ En **mixins** y funciones LESS
- ✅ En **cálculos matemáticos** complejos
- ✅ Como **fallback** durante la migración
- ✅ Cuando necesites **valores estáticos** en compilación

```less
// Ejemplo: Mixin con variables LESS
.button-variant(@bg-color) {
  background-color: @bg-color;
  border: 1px solid darken(@bg-color, 10%);
}

.btn-primary {
  .button-variant(@color-primary);
}
```

#### Usar CSS Custom Properties (`--variable`)

- ✅ Para **tematización** (modo oscuro, multi-tema)
- ✅ En **componentes dinámicos**
- ✅ Cuando necesites **cambiar valores en runtime**
- ✅ En **código nuevo** o migrado

```less
.card {
  // CSS custom property (puede cambiar con dark mode)
  background-color: var(--color-bg-sections);
  border-color: var(--color-border);
}
```

### Estrategia Híbrida con Fallback

Durante la migración, usa **ambos** para máxima compatibilidad:

```less
.element {
  // CSS var con fallback a LESS var
  color: var(--color-primary, @color-primary);
  background: var(--color-bg-main, @color-bg-main);
  padding: var(--space-md, @space-md);
}
```

**Ventajas**:

- ✅ El navegador usa la CSS custom property (tematización funciona)
- ✅ Si falla, usa la variable LESS (compatibilidad garantizada)
- ✅ Facilita refactoring gradual

---

## 🔗 Compatibilidad con Legacy

### Variables de Compatibilidad

El archivo `_tokens.less` incluye un **mapeo de compatibilidad** para que las variables antiguas sigan funcionando:

```less
:root {
  /* Nuevos tokens */
  --color-primary: #285c8d;
  --color-bg-main: #faf9f7;

  /* Variables legacy (apuntan a nuevos tokens) */
  --primary: var(--color-primary);
  --background-main: var(--color-bg-main);
  --headerColor: var(--color-text-primary);
  --bodyTextColor: var(--color-text-secondary);
}
```

### Tabla de Mapeo

| Variable Legacy         | Variable Nueva            | Tipo       |
| ----------------------- | ------------------------- | ---------- |
| `--primary`             | `--color-primary`         | Color      |
| `--primaryLight`        | `--color-primary-light`   | Color      |
| `--secondary`           | `--color-secondary`       | Color      |
| `--accent`              | `--color-accent`          | Color      |
| `--background-main`     | `--color-bg-main`         | Color      |
| `--background-sections` | `--color-bg-sections`     | Color      |
| `--text-primary`        | `--color-text-primary`    | Color      |
| `--text-secondary`      | `--color-text-secondary`  | Color      |
| `--text-white`          | `--color-text-white`      | Color      |
| `--border-color`        | `--color-border`          | Color      |
| `--headerColor`         | `--color-text-primary`    | Color      |
| `--bodyTextColor`       | `--color-text-secondary`  | Color      |
| `--bodyTextColorWhite`  | `--color-text-white`      | Color      |
| `--topperFontSize`      | `--font-size-topper`      | Tipografía |
| `--headerFontSize`      | `--font-size-header`      | Tipografía |
| `--bodyFontSize`        | `--font-size-body`        | Tipografía |
| `--sectionPadding`      | `--space-section-padding` | Espaciado  |

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Migrar un Botón

**Antes (legacy):**

```less
.cs-button-solid {
  color: #f5f1e9;
  background-color: #285c8d;
  padding: 0 30px;
  font-size: 16px;
  transition: color 0.3s;

  &:hover {
    background-color: #b35030;
  }
}
```

**Después (con tokens + fallback):**

```less
.cs-button-solid {
  color: var(--color-text-white, @color-text-white);
  background-color: var(--color-primary, @color-primary);
  padding: 0 var(--space-xl, @space-xl);
  font-size: var(--font-size-md, @font-size-md);
  transition: color var(--transition-base, @transition-base);

  &:hover {
    background-color: var(--color-accent, @color-accent);
  }
}
```

**Ventajas**:

- ✅ Valores centralizados
- ✅ Fácil cambiar colores globalmente
- ✅ Modo oscuro funciona automáticamente
- ✅ Fallback garantiza compatibilidad

### Ejemplo 2: Migrar Media Queries con Breakpoints

**Antes:**

```less
@media only screen and (min-width: 768px) {
  .container {
    max-width: 1200px;
  }
}
```

**Después:**

```less
@media only screen and (min-width: @bp-md) {
  .container {
    max-width: 1200px;
  }
}
```

### Ejemplo 3: Migrar Espaciado

**Antes:**

```less
.section {
  padding: 60px 16px;
  margin-bottom: 32px;
}
```

**Después:**

```less
.section {
  padding: var(--space-4xl, @space-4xl) var(--space-md, @space-md);
  margin-bottom: var(--space-xl, @space-xl);
}
```

### Ejemplo 4: Usar Tokens en Nuevos Componentes

```less
// Componente completamente nuevo - usar tokens directamente
.new-card {
  background: var(--color-bg-sections);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
  transition: box-shadow var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-lg);
  }

  .card-title {
    color: var(--color-text-primary);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    margin-bottom: var(--space-sm);
  }

  .card-text {
    color: var(--color-text-secondary);
    font-size: var(--font-size-md);
    line-height: var(--line-height-normal);
  }
}
```

---

## ✅ Checklist de Migración

### Preparación (✅ Completado)

- [x] Crear estructura de carpetas ITCSS
- [x] Implementar `@layer` para control de especificidad
- [x] Crear archivo `_tokens.less` con sistema de tokens
- [x] Configurar variables de compatibilidad legacy
- [x] Importar tokens en la capa `base`
- [x] Verificar que el build no rompe

### Migración por Fases (🔄 En progreso)

#### Fase 1: Preparación y Documentación

- [x] Documentar convención de nombres
- [x] Crear guía de migración
- [ ] Identificar componentes críticos
- [ ] Crear branch de testing

#### Fase 2: Migración de Utilidades Globales

- [ ] Migrar clases de spacing (`.m-*`, `.p-*`)
- [ ] Migrar clases de texto (`.text-*`)
- [ ] Migrar clases de display/visibility
- [ ] Testear en modo claro y oscuro

#### Fase 3: Migración de Componentes Base

- [ ] Migrar botones (`.cs-button-solid`, etc.)
- [ ] Migrar tipografía (`.cs-title`, `.cs-text`, etc.)
- [ ] Migrar formularios
- [ ] Migrar cards y containers

#### Fase 4: Migración de Layouts

- [ ] Migrar header y navegación
- [ ] Migrar footer
- [ ] Migrar sidebar
- [ ] Migrar grids y wrappers

#### Fase 5: Migración de Páginas

- [ ] Migrar página de inicio
- [ ] Migrar páginas de contenido (noticias, bandos)
- [ ] Migrar páginas estáticas
- [ ] Migrar páginas de error

#### Fase 6: Refinamiento

- [ ] Eliminar duplicados
- [ ] Optimizar performance
- [ ] Reducir tamaño del archivo legacy
- [ ] Añadir tests visuales de regresión

#### Fase 7: Limpieza Final (Opcional)

- [ ] Eliminar variables legacy no usadas
- [ ] Consolidar tokens similares
- [ ] Documentar tokens custom del proyecto
- [ ] Generar styleguide visual

---

## 🛠️ Comandos Útiles

### Verificar Build

```bash
npm run build
```

### Desarrollo con Hot Reload

```bash
npm run dev
```

### Buscar Variables Legacy

```bash
# Buscar usos de variables antiguas
grep -r "var(--primary)" src/styles/
grep -r "--background-main" src/styles/
```

### Verificar Imports

```bash
# Ver estructura de imports
find src/styles -name "*.less" -exec echo {} \; -exec head -20 {} \;
```

---

## 📚 Recursos Adicionales

### ITCSS

- [ITCSS Architecture](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/)
- [CSS Cascade Layers](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)

### CSS Custom Properties

- [Using CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [CSS Variables Best Practices](https://www.smashingmagazine.com/2018/05/css-custom-properties-strategy-guide/)

### LESS

- [LESS Documentation](https://lesscss.org/)
- [LESS Functions](https://lesscss.org/functions/)

---

## 🤝 Contribuir a la Migración

### Workflow Recomendado

1. **Elegir un componente** de la checklist
2. **Crear branch** específico: `migrate/component-name`
3. **Migrar** usando tokens con fallback
4. **Testear** visual y funcionalmente
5. **Commit** con mensaje descriptivo
6. **PR** con screenshots de antes/después
7. **Review** y merge

### Convención de Commits

```
feat(tokens): migrar componente X a sistema de tokens

- Reemplazar valores duros por tokens
- Añadir fallbacks LESS
- Verificar modo oscuro
- Testear responsive
```

---

## 📞 Ayuda y Soporte

Si tienes dudas durante la migración:

1. Revisa esta guía
2. Consulta `src/styles/settings/_tokens.less` para ver tokens disponibles
3. Mira ejemplos en componentes ya migrados
4. Pregunta al equipo en el canal de desarrollo

---

**Fecha de última actualización**: 31 de octubre de 2025  
**Versión**: 1.0.0  
**Autor**: Arquitectura CSS - ITCSS
