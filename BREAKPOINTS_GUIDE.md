# Guía de Uso - Mixins de Breakpoints

## 📋 Índice

- [Introducción](#introducción)
- [Breakpoints Disponibles](#breakpoints-disponibles)
- [Mixins Principales](#mixins-principales)
- [Mixins de Utilidad](#mixins-de-utilidad)
- [Shortcuts Semánticos](#shortcuts-semánticos)
- [Ejemplos Prácticos](#ejemplos-prácticos)
- [Migración desde @media](#migración-desde-media)
- [Patrones Comunes](#patrones-comunes)
- [Reglas y Mejores Prácticas](#reglas-y-mejores-prácticas)

---

## 🎯 Introducción

Este sistema de mixins centraliza y estandariza el uso de breakpoints en el proyecto, eliminando valores hard-coded y mejorando la consistencia.

### Ubicación

```
src/styles/tools/_breakpoints.less
```

### Importación

```less
// El archivo ya está importado globalmente en tools/index.less
// Solo necesitas importarlo si trabajas en un archivo aislado:
@import '../tools/_breakpoints.less';
```

---

## 📱 Breakpoints Disponibles

Estos breakpoints están definidos en `settings/_tokens.less`:

| Variable  | Valor | Píxeles | Dispositivo    |
| --------- | ----- | ------- | -------------- |
| `@bp-xs`  | 0em   | 0px     | Mobile (base)  |
| `@bp-sm`  | 30em  | 480px   | Mobile grande  |
| `@bp-md`  | 48em  | 768px   | Tablet         |
| `@bp-lg`  | 64em  | 1024px  | Desktop        |
| `@bp-xl`  | 80em  | 1280px  | Desktop grande |
| `@bp-2xl` | 96em  | 1536px  | Desktop XL     |

### ⚠️ IMPORTANTE

**NO crear nuevos breakpoints hard-coded.**  
Usar SIEMPRE estos tokens para mantener consistencia en todo el proyecto.

---

## 🔧 Mixins Principales

### `.mq-up(@breakpoint)`

Media query para pantallas **mayores o iguales** al breakpoint (mobile-first).

```less
.component {
  // Mobile styles (base)
  padding: 1rem;

  .mq-up(@bp-md); {
    // Tablet y superior (≥ 768px)
    padding: 2rem;
  }
}
```

**Genera:**

```css
@media (min-width: 48em) {
  .component {
    padding: 2rem;
  }
}
```

---

### `.mq-down(@breakpoint)`

Media query para pantallas **menores** al breakpoint (desktop-first).

**NOTA:** Se resta automáticamente 0.0625em (1px) para evitar overlap.

```less
.component {
  display: flex;

  .mq-down(@bp-md); {
    // Solo mobile (< 768px)
    display: block;
  }
}
```

**Genera:**

```css
@media (max-width: 47.9375em) {
  /* 768px - 1px */
  .component {
    display: block;
  }
}
```

---

### `.mq-between(@min, @max)`

Media query para pantallas **entre** dos breakpoints.

```less
.component {
  .mq-between(@bp-md, @bp-lg); {
    // Solo tablet (768px - 1023px)
    font-size: 1.2rem;
  }
}
```

**Genera:**

```css
@media (min-width: 48em) and (max-width: 63.9375em) {
  .component {
    font-size: 1.2rem;
  }
}
```

---

### `.mq-only(@breakpoint)`

Media query para **UN SOLO** rango de breakpoint.

```less
.component {
  .mq-only(@bp-md); {
    // Solo tablet (768px - 1023px)
    display: grid;
  }
}
```

**Equivalencias:**

- `.mq-only(@bp-xs)` → `< 480px`
- `.mq-only(@bp-sm)` → `480px - 767px`
- `.mq-only(@bp-md)` → `768px - 1023px`
- `.mq-only(@bp-lg)` → `1024px - 1279px`
- `.mq-only(@bp-xl)` → `1280px - 1535px`
- `.mq-only(@bp-2xl)` → `≥ 1536px`

---

## 🛠️ Mixins de Utilidad

### `.mq-landscape()` / `.mq-portrait()`

Media queries para orientación de pantalla.

```less
.video {
  .mq-landscape(); {
    height: 100vh;
  }

  .mq-portrait(); {
    width: 100vw;
  }
}
```

---

### `.mq-retina()`

Media query para pantallas de alta densidad (Retina, 2x).

```less
.logo {
  background-image: url('logo.png');

  .mq-retina(); {
    background-image: url('logo@2x.png');
  }
}
```

---

### `.mq-print()`

Media query para impresión.

```less
.navigation {
  .mq-print(); {
    display: none;
  }
}
```

---

### `.mq-dark-mode()`

Media query para preferencia del sistema de modo oscuro.

**NOTA:** Esto es **adicional** al toggle manual con `body.dark-mode`.

```less
.component {
  .mq-dark-mode(); {
    background: #000;
  }
}
```

---

### `.mq-reduced-motion()`

Media query para accesibilidad - usuarios que prefieren movimiento reducido.

```less
.animation {
  transition: all 0.3s;

  .mq-reduced-motion(); {
    transition: none;  // Respeta preferencias del usuario
  }
}
```

---

## ⚡ Shortcuts Semánticos

Atajos legibles para casos comunes:

### `.mq-mobile()`

Pantallas móviles (< tablet). Equivalente a `.mq-down(@bp-md)`.

```less
.nav {
  .mq-mobile(); {
    position: fixed;
    width: 100%;
  }
}
```

---

### `.mq-tablet()`

Solo tablet (768px - 1023px). Equivalente a `.mq-only(@bp-md)`.

```less
.sidebar {
  .mq-tablet(); {
    width: 30%;
  }
}
```

---

### `.mq-tablet-up()`

Tablet y superior (≥ 768px). Equivalente a `.mq-up(@bp-md)`.

```less
.grid {
  .mq-tablet-up(); {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

### `.mq-desktop()`

Desktop y superior (≥ 1024px). Equivalente a `.mq-up(@bp-lg)`.

```less
.content {
  .mq-desktop(); {
    max-width: 1200px;
  }
}
```

---

### `.mq-desktop-only()`

Solo desktop (1024px - 1279px). Equivalente a `.mq-only(@bp-lg)`.

```less
.sidebar {
  .mq-desktop-only(); {
    width: 300px;
  }
}
```

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Mobile-first Responsive Component

```less
.card {
  // Base (mobile)
  padding: var(--space-md, @space-md);
  font-size: var(--font-size-sm, @font-size-sm);

  // Tablet y superior
  .mq-up(@bp-md); {
    padding: var(--space-lg, @space-lg);
    font-size: var(--font-size-md, @font-size-md);
  }

  // Desktop y superior
  .mq-up(@bp-lg); {
    padding: var(--space-xl, @space-xl);
    font-size: var(--font-size-lg, @font-size-lg);
  }
}
```

---

### Ejemplo 2: Grid Responsivo

```less
.grid {
  display: grid;
  gap: var(--space-md, @space-md);
  grid-template-columns: 1fr;

  .mq-up(@bp-sm); {
    grid-template-columns: repeat(2, 1fr);
  }

  .mq-up(@bp-md); {
    grid-template-columns: repeat(3, 1fr);
  }

  .mq-up(@bp-lg); {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-lg, @space-lg);
  }
}
```

---

### Ejemplo 3: Navegación Adaptativa

```less
.navigation {
  // Mobile only
  .mq-mobile(); {
    position: fixed;
    top: 0;
    width: 100%;
    height: 100vh;
    transform: translateX(-100%);

    &.active {
      transform: translateX(0);
    }
  }

  // Tablet y superior
  .mq-tablet-up(); {
    position: relative;
    transform: none;
    height: auto;
  }

  // Desktop
  .mq-desktop(); {
    display: flex;
    justify-content: space-between;
  }
}
```

---

### Ejemplo 4: Accesibilidad

```less
.animated-button {
  transition:
    transform var(--transition-base, @transition-base),
    background var(--transition-base, @transition-base);

  &:hover {
    transform: scale(1.05);
    background: var(--color-primary-light, @color-primary-light);
  }

  // Respetar preferencias de usuario
  .mq-reduced-motion(); {
    transition: none;

    &:hover {
      transform: none;
    }
  }
}
```

---

## 🔄 Migración desde @media

### Tabla de Conversión

| Media Query Original                                  | Mixin Equivalente                                        |
| ----------------------------------------------------- | -------------------------------------------------------- |
| `@media (min-width: 0em)`                             | (sin media query - estilos base)                         |
| `@media (min-width: 30em)`                            | `.mq-up(@bp-sm); { }`                                    |
| `@media (min-width: 48em)`                            | `.mq-up(@bp-md); { }` o `.mq-tablet-up(); { }`           |
| `@media (min-width: 64em)`                            | `.mq-up(@bp-lg); { }` o `.mq-desktop(); { }`             |
| `@media (min-width: 80em)`                            | `.mq-up(@bp-xl); { }`                                    |
| `@media (max-width: 47.9375rem)`                      | `.mq-down(@bp-md); { }` o `.mq-mobile(); { }`            |
| `@media (max-width: 63.9375rem)`                      | `.mq-down(@bp-lg); { }`                                  |
| `@media (min-width: 48em) and (max-width: 63.9375em)` | `.mq-between(@bp-md, @bp-lg); { }` o `.mq-tablet(); { }` |

### Proceso de Migración Paso a Paso

**1. Identificar media queries en el archivo:**

```bash
grep -n "@media" src/styles/components/header.less
```

**2. Para cada media query, aplicar conversión:**

```less
// ANTES
@media only screen and (min-width: 64rem) {
  .navigation {
    display: flex;
  }
}

// DESPUÉS
.navigation {
  .mq-up(@bp-lg); {
    display: flex;
  }
}
```

**3. Eliminar @media (min-width: 0em) innecesarios:**

```less
// ANTES
@media only screen and (min-width: 0em) {
  .component {
    padding: 1rem;
  }
}

// DESPUÉS (estilos base sin media query)
.component {
  padding: 1rem;
}
```

**4. Consolidar bloques cuando sea posible:**

```less
// ANTES
@media (min-width: 0em) {
  .card { padding: 1rem; }
}
@media (min-width: 64em) {
  .card { padding: 2rem; }
}

// DESPUÉS (un solo bloque)
.card {
  padding: 1rem;  // Base

  .mq-up(@bp-lg); {
    padding: 2rem;  // Desktop
  }
}
```

**5. Testear visualmente:**

- Verificar en mobile (< 480px)
- Verificar en tablet (768px - 1023px)
- Verificar en desktop (≥ 1024px)
- Verificar transiciones entre breakpoints

---

## 🎨 Patrones Comunes

### Patrón 1: Cambio de Flex Direction

```less
.list {
  display: flex;
  flex-direction: column;  // Mobile

  .mq-desktop(); {
    flex-direction: row;  // Desktop
  }
}
```

---

### Patrón 2: Text Alignment

```less
.text {
  text-align: center;  // Mobile

  .mq-tablet-up(); {
    text-align: left;  // Tablet+
  }
}
```

---

### Patrón 3: Spacing Progresivo

```less
.section {
  gap: var(--space-sm, @space-sm);  // Mobile

  .mq-tablet-up(); {
    gap: var(--space-md, @space-md);  // Tablet
  }

  .mq-desktop(); {
    gap: var(--space-lg, @space-lg);  // Desktop
  }
}
```

---

### Patrón 4: Full-width vs Constrained

```less
.container {
  width: 100%;  // Mobile
  padding: var(--space-md, @space-md);

  .mq-desktop(); {
    max-width: 1280px;
    margin: 0 auto;
    padding: var(--space-xl, @space-xl);
  }
}
```

---

### Patrón 5: Hide/Show por Breakpoint

```less
.mobile-menu {
  display: block;  // Visible en mobile

  .mq-desktop(); {
    display: none;  // Oculto en desktop
  }
}

.desktop-nav {
  display: none;  // Oculto en mobile

  .mq-desktop(); {
    display: flex;  // Visible en desktop
  }
}
```

---

## 📏 Reglas y Mejores Prácticas

### ✅ SÍ Hacer

1. **Usar mixins en lugar de @media hard-coded**

   ```less
   .mq-up(@bp-md); { }  // ✅ Correcto
   ```

2. **Enfoque mobile-first**

   ```less
   .component {
     padding: 1rem;  // Base (mobile)

     .mq-tablet-up(); {
       padding: 2rem;  // Tablet+
     }
   }
   ```

3. **Consolidar estilos por componente**

   ```less
   .card {
     /* Mobile */
     padding: 1rem;

     /* Tablet */
     .mq-tablet-up(); {
       padding: 2rem;
     }

     /* Desktop */
     .mq-desktop(); {
       padding: 3rem;
     }
   }
   ```

4. **Usar shortcuts semánticos cuando sea más claro**

   ```less
   .mq-mobile(); { }     // ✅ Claro
   .mq-desktop(); { }    // ✅ Claro
   ```

5. **Añadir accesibilidad**
   ```less
   .mq-reduced-motion(); {
     transition: none;
   }
   ```

---

### ❌ NO Hacer

1. **NO crear breakpoints hard-coded**

   ```less
   @media (min-width: 900px) {
   } // ❌ Incorrecto
   ```

2. **NO usar valores arbitrarios**

   ```less
   @media (min-width: 65.5rem) {
   } // ❌ Incorrecto
   ```

3. **NO duplicar estilos en múltiples archivos**

   ```less
   // header.less
   @media (min-width: 64em) {
   } // ❌ Duplicado

   // footer.less
   @media (min-width: 64em) {
   } // ❌ Duplicado

   // Usar: .mq-desktop(); en ambos
   ```

4. **NO anidar mixins innecesariamente**

   ```less
   .mq-desktop(); {
     .mq-tablet(); {  // ❌ Conflicto
       // ...
     }
   }
   ```

5. **NO ignorar @media (min-width: 0em)**

   ```less
   @media (min-width: 0em) {
     // ❌ Redundante
     .component {
       padding: 1rem;
     }
   }

   // Simplemente:
   .component {
     padding: 1rem; // ✅ Correcto
   }
   ```

---

## 🔍 Casos Especiales

### Caso 1: Breakpoint No Estándar

Si encuentras un breakpoint que NO coincide con los tokens:

```less
@media (min-width: 50rem) {
} // No es un token estándar
```

**Opciones:**

a) **Si es único y justificado**, déjalo como está y documenta:

```less
// NOTA: Breakpoint custom para este componente específico
// debido a layout particular con sidebar
@media (min-width: 50rem) {
  // ...
}
```

b) **Si se repite**, considerar añadirlo a `_tokens.less`:

```less
// En _tokens.less
@bp-custom: 50rem; // Para layout de sidebar
```

c) **Evaluar si se puede usar un breakpoint estándar cercano**:

```less
.mq-up(@bp-md); { }  // 48em (768px) - cercano a 50rem (800px)
```

---

### Caso 2: Media Queries Múltiples

Si tienes:

```less
@media (min-width: 48rem), (orientation: landscape) {
}
```

**Dividir en bloques separados:**

```less
.mq-up(@bp-md); {
  /* estilos */
}

.mq-landscape(); {
  /* estilos */
}
```

---

### Caso 3: Print Styles con Breakpoints

```less
.component {
  .mq-print(); {
    display: block;

    // Print-specific responsive
    .mq-up(@bp-md); {
      font-size: 12pt;
    }
  }
}
```

---

## 📞 Ayuda y Recursos

### Archivos de Referencia

- **Código fuente de mixins:** `src/styles/tools/_breakpoints.less`
- **Tokens de breakpoints:** `src/styles/settings/_tokens.less`
- **Ejemplos de migración:**
  - `src/styles/examples/header-migrated.less`
  - `src/styles/examples/footer-migrated.less`

### Comandos Útiles

```bash
# Buscar media queries en un archivo
grep -n "@media" src/styles/components/header.less

# Buscar media queries en todo el proyecto
grep -r "@media" src/styles/

# Contar media queries por archivo
grep -c "@media" src/styles/components/*.less
```

### Testing

```bash
# Verificar build
npm run build

# Desarrollo con hot reload
npm run dev
```

---

## ✅ Checklist de Migración

Al migrar un archivo a mixins de breakpoints:

- [ ] Importar mixins (si es necesario)
- [ ] Identificar todos los `@media` queries
- [ ] Convertir a mixins apropiados
- [ ] Eliminar `@media (min-width: 0em)` redundante
- [ ] Consolidar estilos por componente
- [ ] Aplicar mobile-first approach
- [ ] Añadir `.mq-reduced-motion()` donde sea apropiado
- [ ] Testear en todos los breakpoints
- [ ] Verificar que no hay cambios visuales
- [ ] Commit con mensaje descriptivo

---

**Versión:** 1.0.0  
**Última actualización:** 31 de octubre de 2025  
**Autor:** Arquitectura CSS - ITCSS
