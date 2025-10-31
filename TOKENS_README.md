# Sistema de Tokens de Diseño - ITCSS

## 🎯 Vista Rápida

Este proyecto usa un **sistema de tokens de diseño** con arquitectura **ITCSS** y **CSS Cascade Layers** para organización escalable.

### Ubicación de Archivos

```
src/styles/
├── main.less                    # Punto de entrada (importar aquí)
├── settings/
│   ├── index.less              # Importa todos los settings
│   └── _tokens.less            # ⭐ SISTEMA DE TOKENS
├── legacy/
│   └── legacy.less             # CSS actual (protegido)
└── MIGRATION_EXAMPLES.less     # Ejemplos de migración
```

---

## 🚀 Uso Rápido

### Importar en BaseLayout

```typescript
// Ya configurado en src/layouts/BaseLayout.astro
import '@styles/main.less';
```

### Usar Tokens en Componentes

```less
// ✅ Recomendado: CSS var con fallback LESS
.my-component {
  color: var(--color-primary, @color-primary);
  padding: var(--space-lg, @space-lg);
  font-size: var(--font-size-md, @font-size-md);
}

// ✅ También válido: Solo LESS var (compilación)
.my-mixin {
  background: @color-secondary;
  margin: @space-md;
}

// ✅ Perfecto: Solo CSS var (runtime, tematización)
.dynamic {
  background: var(--color-bg-sections);
  border-color: var(--color-border);
}
```

---

## 📐 Convención de Nombres

### Estructura

```
@{categoria}-{nombre}-{variante}
--{categoria}-{nombre}-{variante}
```

### Categorías Principales

| Prefijo       | Uso           | Ejemplo                                |
| ------------- | ------------- | -------------------------------------- |
| `color-`      | Colores       | `--color-primary`, `@color-text-white` |
| `font-`       | Tipografía    | `--font-size-lg`, `@font-weight-bold`  |
| `space-`      | Espaciado     | `--space-md`, `@space-xl`              |
| `bp-`         | Breakpoints   | `@bp-md`, `@bp-lg`                     |
| `shadow-`     | Sombras       | `--shadow-md`, `@shadow-dark-lg`       |
| `radius-`     | Border radius | `--radius-lg`, `@radius-full`          |
| `z-`          | Z-index       | `--z-modal`, `@z-dropdown`             |
| `transition-` | Transiciones  | `--transition-base`                    |

---

## 🎨 Tokens Disponibles

### Colores

```less
// FONDOS
@color-bg-main // #faf9f7 (blanco cálido)
@color-bg-sections        // #f0e9e1 (beige claro)
@color-bg-dark            // #1c1c1b (modo oscuro)
@color-bg-medium          // #2a2a28 (tarjetas oscuras)

// TEXTOS
@color-text-primary       // #2e2e2e (principal)
@color-text-secondary     // #6e6e6e (secundario)
@color-text-white         // #f5f1e9 (sobre oscuro)

// BRAND
@color-primary            // #285c8d (azul Cuenca)
@color-primary-light      // #5e8cc0
@color-secondary          // #6a7e49 (verde olivo)
@color-secondary-light    // #a6b381
@color-accent             // #b35030 (rojo teja)
@color-accent-light       // #e27a58

// UI
@color-border             // #ddd6ce
@color-success            // #4caf50
@color-warning            // #ff9800
@color-error              // #f44336;
```

### Tipografía

```less
// FAMILIAS
@font-family-primary //  Roboto , Arial, sans-serif
@font-family-heading      //  Roboto , Arial, sans-serif

// PESOS
@font-weight-regular      // 400
@font-weight-bold         // 700
@font-weight-black        // 900

// TAMAÑOS (escala t-shirt)
@font-size-xs             // 0.75rem (12px)
@font-size-sm             // 0.875rem (14px)
@font-size-md             // 1rem (16px)
@font-size-lg             // 1.125rem (18px)
@font-size-xl             // 1.25rem (20px)
@font-size-2xl            // 1.5rem (24px)
@font-size-3xl            // 1.875rem (30px)
@font-size-4xl            // 2.25rem (36px)
@font-size-5xl            // 3rem (48px)

// LINE HEIGHT
@line-height-tight        // 1.2
@line-height-normal       // 1.5
@line-height-relaxed      // 1.75;
```

### Espaciado

```less
@space-xs // 0.25rem (4px)
@space-sm                 // 0.5rem (8px)
@space-md                 // 1rem (16px)
@space-lg                 // 1.5rem (24px)
@space-xl                 // 2rem (32px)
@space-2xl                // 3rem (48px)
@space-3xl                // 4rem (64px)
@space-4xl                // 6rem (96px)
@space-5xl                // 8rem (128px);
```

### Breakpoints

```less
@bp-xs // 0em (0px)
@bp-sm                    // 30em (480px)
@bp-md                    // 48em (768px)
@bp-lg                    // 64em (1024px)
@bp-xl                    // 80em (1280px)
@bp-2xl                   // 96em (1536px)

// Uso en media queries
@media only screen and (min-width: @bp-md) {
  // Estilos para tablet y superior
}
```

### Otros

```less
// SOMBRAS
@shadow-sm, @shadow-md, @shadow-lg, @shadow-xl
@shadow-dark-md, @shadow-dark-lg (para modo oscuro)

// BORDER RADIUS
@radius-sm                // 0.125rem (2px)
@radius-md                // 0.25rem (4px)
@radius-lg                // 0.5rem (8px)
@radius-xl                // 1rem (16px)
@radius-full              // 9999px (círculo)

// TRANSICIONES
@transition-fast          // 0.15s
@transition-base          // 0.3s
@transition-slow          // 0.5s

// Z-INDEX
@z-base, @z-dropdown, @z-sticky, @z-fixed
@z-modal, @z-tooltip;
```

---

## 🔧 Ejemplos Comunes

### Botón con Tokens

```less
.btn {
  background: var(--color-primary, @color-primary);
  color: var(--color-text-white, @color-text-white);
  padding: var(--space-sm, @space-sm) var(--space-lg, @space-lg);
  font-size: var(--font-size-md, @font-size-md);
  font-weight: var(--font-weight-bold, @font-weight-bold);
  border-radius: var(--radius-md, @radius-md);
  transition: background var(--transition-base, @transition-base);

  &:hover {
    background: var(--color-accent, @color-accent);
  }
}
```

### Card Component

```less
.card {
  background: var(--color-bg-sections, @color-bg-sections);
  border: 1px solid var(--color-border, @color-border);
  border-radius: var(--radius-lg, @radius-lg);
  padding: var(--space-lg, @space-lg);
  box-shadow: var(--shadow-md, @shadow-md);

  &:hover {
    box-shadow: var(--shadow-lg, @shadow-lg);
  }
}
```

### Grid Responsivo

```less
.grid {
  display: grid;
  gap: var(--space-md, @space-md);

  @media (min-width: @bp-md) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: @bp-lg) {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-xl, @space-xl);
  }
}
```

---

## 🔄 Variables Legacy (Compatibilidad)

Las variables antiguas siguen funcionando gracias al mapeo automático:

| Legacy              | Nuevo Token              |
| ------------------- | ------------------------ |
| `--primary`         | `--color-primary`        |
| `--background-main` | `--color-bg-main`        |
| `--text-primary`    | `--color-text-primary`   |
| `--headerColor`     | `--color-text-primary`   |
| `--bodyTextColor`   | `--color-text-secondary` |

**No necesitas cambiar código legacy inmediatamente** - todo sigue funcionando.

---

## 🌓 Modo Oscuro

El modo oscuro funciona **automáticamente** con los tokens:

```less
// Solo defines una vez
.card {
  background: var(--color-bg-sections);
  color: var(--color-text-primary);
}

// Los tokens cambian automáticamente en dark mode
// No necesitas escribir:
// body.dark-mode .card { ... } ✅ Ya está hecho
```

---

## 📚 Documentación Completa

- **Guía de Migración**: `/MIGRATION_GUIDE.md` - Guía detallada paso a paso
- **Ejemplos de Código**: `/src/styles/MIGRATION_EXAMPLES.less` - Ejemplos prácticos
- **Archivo de Tokens**: `/src/styles/settings/_tokens.less` - Todos los tokens disponibles

---

## ✅ Checklist Rápida

Cuando crees un nuevo componente:

- [ ] Usa tokens en lugar de valores hard-coded
- [ ] Usa sintaxis `var(--token, @token)` para fallback
- [ ] Verifica en modo claro y oscuro
- [ ] Testea en diferentes breakpoints
- [ ] Usa tokens semánticos (`--color-primary` vs `--color-blue`)

---

## 🤝 Contribuir

### Añadir un Nuevo Token

1. Edita `src/styles/settings/_tokens.less`
2. Añade la variable LESS: `@new-token: value;`
3. Expórtala a `:root`: `--new-token: @new-token;`
4. Documenta su uso en comentarios
5. Actualiza esta guía si es necesario

### Migrar un Componente

1. Consulta `/MIGRATION_GUIDE.md`
2. Revisa ejemplos en `/src/styles/MIGRATION_EXAMPLES.less`
3. Usa tokens con fallback
4. Testea visualmente
5. Commit con mensaje descriptivo

---

## 🔍 FAQ

**¿Por qué usar `var(--token, @token)`?**

- CSS var permite tematización runtime (modo oscuro)
- LESS var es fallback compilado (compatibilidad)
- Best of both worlds

**¿Puedo usar solo variables LESS?**

- Sí, pero pierdes tematización dinámica
- Recomendado solo para mixins y cálculos

**¿Puedo usar solo CSS vars?**

- Sí, en código nuevo está perfecto
- Para migraciones, mejor usar fallback

**¿Qué pasa si no existe el token que necesito?**

- Añádelo a `_tokens.less` siguiendo la convención
- Si es muy específico, usa valor directo en el componente

---

**Versión**: 1.0.0  
**Última actualización**: 31 de octubre de 2025
