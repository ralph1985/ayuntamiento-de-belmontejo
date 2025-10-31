# Arquitectura ITCSS + Tokens - Explicación Técnica

## 🏗️ Arquitectura del Sistema

### Flujo de Carga de Estilos

```
BaseLayout.astro
    ↓
import '@styles/main.less'
    ↓
main.less define @layer base, components, utilities, legacy
    ↓
┌─────────────────────────────────────────────────────────┐
│ @layer base (prioridad BAJA)                            │
│   ├── settings/index.less                               │
│   │   └── _tokens.less ← Define tokens ANTES de legacy  │
│   ├── tools/index.less (mixins)                         │
│   ├── generic/index.less (reset)                        │
│   └── elements/index.less (elementos base)              │
│                                                          │
│ @layer components                                       │
│   └── objects/index.less (layouts)                      │
│                                                          │
│ @layer utilities                                        │
│   └── utilities/index.less (helpers)                    │
│                                                          │
│ @layer legacy (prioridad ALTA)                          │
│   └── legacy/legacy.less                                │
│       ├── root.less ← CSS actual                        │
│       ├── dark.less                                     │
│       ├── markdown.less                                 │
│       └── sidebar.less                                  │
└─────────────────────────────────────────────────────────┘
```

### CSS Cascade Layers - ¿Cómo Funcionan?

```css
/* Declaración de capas (main.less) */
@layer base, components, utilities, legacy;

/* El navegador aplica CSS en este orden de prioridad: */
1. base         ← Menor prioridad (se sobrescribe fácilmente)
2. components
3. utilities
4. legacy       ← Mayor prioridad (gana sobre todas las demás)
```

**Resultado**: Aunque los tokens se cargan PRIMERO en el HTML, la capa `legacy` tiene MÁXIMA prioridad CSS, garantizando que el estilo actual no se rompa.

---

## 🎯 Estrategia de Compatibilidad

### 1. Doble Definición de Variables

```less
// En _tokens.less

// Paso 1: Definir variable LESS
@color-primary: #285c8d;

// Paso 2: Exportar a :root como CSS custom property
:root {
  --color-primary: @color-primary;
}
```

**Ventajas**:

- `@color-primary` → Compilación estática, funciona en todos los navegadores
- `--color-primary` → Runtime dinámico, permite tematización

### 2. Variables de Compatibilidad Legacy

```less
// En _tokens.less, sección de compatibilidad
:root {
  /* Nuevos tokens */
  --color-primary: #285c8d;
  --color-bg-main: #faf9f7;

  /* Variables legacy apuntan a nuevos tokens */
  --primary: var(--color-primary);
  --background-main: var(--color-bg-main);
  --headerColor: var(--color-text-primary);
}
```

**Resultado**: Código antiguo que usa `var(--primary)` sigue funcionando porque apunta al nuevo token.

### 3. Sintaxis de Fallback en Migración

```less
// Al migrar componentes, usamos:
.component {
  color: var(--color-primary, @color-primary);
  //     ^^^^^^^^^^^^^^^^^^^^^ ^^^^^^^^^^^^^^^
  //     CSS custom property    Fallback LESS
}
```

**Cómo funciona**:

1. Navegador intenta usar `var(--color-primary)` del runtime
2. Si falla (navegador antiguo), LESS ya compiló `@color-primary` como fallback
3. **Double safety**: Runtime + Compilación

---

## 🌓 Modo Oscuro - Mecánica Técnica

### Definición de Tokens Base

```less
// _tokens.less
:root {
  --color-bg-main: #faf9f7; // Modo claro por defecto
  --color-text-primary: #2e2e2e;
}
```

### Redefinición en Dark Mode

```less
// _tokens.less
body.dark-mode {
  /* Solo redefinimos los tokens que cambian */
  --color-bg-main: #1c1c1b; // Sobrescribe el valor
  --color-text-primary: #f5f1e9;

  /* Variables legacy también se actualizan */
  --background-main: var(--color-bg-main);
}
```

### Componentes Responden Automáticamente

```less
// Componente usa el token
.card {
  background: var(--color-bg-main); // Sin dark mode específico
}
```

**Magia CSS**:

1. En modo claro: `--color-bg-main` = `#faf9f7`
2. `body.dark-mode` se añade → CSS redefine `--color-bg-main` = `#1c1c1b`
3. `.card` lee el nuevo valor automáticamente
4. **No necesita código adicional** en el componente

---

## 🔧 LESS vs CSS Custom Properties

### Tabla Comparativa

| Característica          | Variables LESS             | CSS Custom Properties  |
| ----------------------- | -------------------------- | ---------------------- |
| **Compilación**         | Tiempo de build            | Runtime en navegador   |
| **Tematización**        | ❌ Requiere recompilar     | ✅ Cambio dinámico     |
| **Soporte navegadores** | ✅ Todos (compila a CSS)   | ⚠️ IE11- no soporta    |
| **Cálculos**            | ✅ Funciones LESS potentes | ⚠️ Solo calc()         |
| **Scope**               | Global o local al archivo  | ✅ Respeta cascade     |
| **Inspección**          | ❌ Valores compilados      | ✅ Visible en DevTools |
| **Performance**         | ✅ CSS estático optimizado | ⚠️ Cálculo en runtime  |

### ¿Cuándo Usar Cada Una?

#### Usar Variables LESS (`@variable`)

```less
// ✅ Mixins
.button-variant(@bg-color) {
  background: @bg-color;
  border: 1px solid darken(@bg-color, 10%); // Función LESS
}

// ✅ Cálculos matemáticos
@golden-ratio: 1.618;
@sidebar-width: 300px;
@content-width: @sidebar-width * @golden-ratio;

// ✅ Breakpoints en media queries
@media (min-width: @bp-md) {
  ...;
}
```

#### Usar CSS Custom Properties (`--variable`)

```less
// ✅ Tematización
.theme-switcher {
  background: var(--color-bg-main); // Cambia con dark mode
}

// ✅ Valores dinámicos
.progress-bar {
  width: var(--progress-percentage); // Cambia con JavaScript
}

// ✅ Componentes reutilizables
.card {
  background: var(--card-bg, var(--color-bg-sections)); // Personalizable
}
```

#### Usar Ambas (Estrategia Híbrida)

```less
// ✅ Durante migración
.migrating-component {
  color: var(--color-primary, @color-primary);
  //     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //     Mejor de ambos mundos
}
```

---

## 📦 Orden de Especificidad Real

### Ejemplo Práctico

```less
// 1. Token definido en @layer base
@layer base {
  :root {
    --color-primary: #285c8d;
  }
}

// 2. Estilo legacy en @layer legacy
@layer legacy {
  .button {
    background: #ff0000; // Rojo hard-coded
  }
}

// 3. Nuevo componente en @layer components
@layer components {
  .button {
    background: var(--color-primary); // #285c8d azul
  }
}
```

**¿Qué color gana?**

```
legacy (#ff0000 rojo) GANA sobre components (#285c8d azul)
```

**Razón**: `@layer` da prioridad a `legacy` sobre `components`, sin importar el orden de carga en el HTML.

### Tabla de Precedencia

```
Prioridad CSS (menor → mayor):

1. @layer base
   - settings (tokens)      ← Aquí definimos valores
   - tools
   - generic
   - elements

2. @layer components         ← Componentes nuevos

3. @layer utilities          ← Helpers con !important opcional

4. @layer legacy             ← CSS actual (GANA SIEMPRE)

5. Inline styles             ← style="..." en HTML
6. !important               ← Último recurso
```

---

## 🎨 Importación en Componentes Astro

### Estilos Globales (BaseLayout.astro)

```typescript
// Importación TypeScript - CSS global
import '@styles/main.less';
```

Se carga en **todos** los componentes que usen `BaseLayout`.

### Estilos Scoped (Componente específico)

```astro
---
// Component.astro
---

<div class="my-component">
  <!-- contenido -->
</div>

<style lang="less">
  // Importar tokens si necesitas LESS vars
  @import '../styles/settings/_tokens.less';

  .my-component {
    // Usar CSS vars (ya disponibles globalmente)
    background: var(--color-bg-sections);

    // O usar LESS vars (necesitas @import arriba)
    padding: @space-lg;
  }
</style>
```

### Estilos Inline (Astro `<style>`)

```astro
<style>
  /* Puede usar CSS vars (ya cargadas) */
  .local-class {
    color: var(--color-primary);
  }

  /* NO puede usar LESS vars sin @import */
  .error {
    margin: @space-md; /* ❌ Error: @space-md no definido */
  }
</style>

<style lang="less">
  @import '../styles/settings/_tokens.less';

  /* Ahora sí puede usar LESS vars */
  .works {
    margin: @space-md; /* ✅ Funciona */
  }
</style>
```

---

## 🔍 Debugging y Troubleshooting

### Ver Tokens Aplicados en DevTools

```javascript
// Console del navegador
getComputedStyle(document.documentElement).getPropertyValue('--color-primary')
// Output: " #285c8d"

// Listar todos los tokens
[...document.styleSheets]
  .flatMap(sheet => [...sheet.cssRules])
  .filter(rule => rule.selectorText === ':root')
  .flatMap(rule => [...rule.style])
  .filter(prop => prop.startsWith('--'))
```

### Verificar Qué Capa Gana

```javascript
// Ver orden de capas
document.querySelector('style').sheet.cssRules;
// Buscar @layer declarations
```

### Problemas Comunes

#### Problema: "El token no aplica"

```less
// ❌ Problema
.component {
  color: var(--color-primray); // Typo en el nombre
}

// ✅ Solución
.component {
  color: var(--color-primary, @color-primary); // Nombre correcto + fallback
}
```

#### Problema: "CSS legacy no se sobrescribe"

```less
// ❌ Problema: Intentar sobrescribir desde @layer base
@layer base {
  .legacy-button {
    background: blue; // No gana sobre legacy
  }
}

// ✅ Solución 1: Modificar en @layer legacy
@layer legacy {
  .legacy-button {
    background: blue; // Gana porque está en legacy
  }
}

// ✅ Solución 2: Usar !important (último recurso)
.legacy-button {
  background: blue !important;
}
```

#### Problema: "Variables LESS no disponibles"

```less
// ❌ Problema: No importaste tokens
.component {
  margin: @space-md; // Error: variable no definida
}

// ✅ Solución: Importar tokens
@import '../settings/_tokens.less';

.component {
  margin: @space-md; // Ahora funciona
}
```

---

## 📊 Performance

### Tamaño del Bundle

```
Antes (solo legacy):
root.less: ~15KB
dark.less: ~8KB
Total: ~23KB

Después (con tokens):
_tokens.less: ~12KB (nuevo)
root.less: ~15KB (sin cambios)
dark.less: ~8KB (sin cambios)
Total: ~35KB

Incremento: +12KB (~52% más)
```

**¿Vale la pena?**
✅ Sí, porque:

- Centralización de valores
- Tematización sin código duplicado
- Escalabilidad a largo plazo
- Eventual reducción al migrar legacy

### Optimización

```less
// ❌ No hagas esto en producción
:root {
  --color-primary: #285c8d;
  --color-primary-hover: #1e4569;
  --color-primary-active: #1e4569;
  --color-primary-disabled: rgba(40, 92, 141, 0.5);
  // ... 100+ variables específicas
}

// ✅ Mejor: Tokens base + cálculos
:root {
  --color-primary: #285c8d;
}

.button {
  background: var(--color-primary);
  &:hover {
    filter: brightness(0.9); // Cálculo en runtime
  }
}
```

---

## 🚀 Roadmap de Migración

### Fase Actual

✅ Tokens definidos  
✅ Legacy protegido  
✅ Sistema funcionando sin breaking changes

### Próximos Pasos

1. Migrar utilidades globales a `@layer utilities`
2. Migrar componentes comunes a `@layer components`
3. Reducir tamaño de `@layer legacy`
4. Eventualmente eliminar legacy

---

**Documento técnico** | Versión 1.0.0 | 31 de octubre de 2025
