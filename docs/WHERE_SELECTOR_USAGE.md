# Uso de `:where()` para Reducción de Especificidad

## 📌 Propósito

El pseudo-selector `:where()` se utiliza para **reducir la especificidad** de selectores CSS complejos, facilitando su override desde utilidades o componentes sin necesidad de incrementar artificialmente la especificidad.

## 🎯 Filosofía

- **Problema**: Selectores con ID + clases anidadas (ej: `#sbs .cs-title`) tienen especificidad muy alta (1,0,1)
- **Solución**: Envolver las clases en `:where()` → `#sbs :where(.cs-title)` reduce especificidad a (1,0,0)
- **Beneficio**: Facilita overrides desde componentes o utilidades sin usar `!important`

## 📂 Archivos Modificados

### 1. `src/styles/pages/index.less`

**Sección**: Dark mode para `#sbs` (Side by Side)

**Antes** (especificidad alta):

```less
:root[data-theme='dark'] {
  #sbs {
    .cs-left {
      &:before,
      &:after {
        background: var(--accent);
      }
    }

    .cs-title,
    .cs-text,
    .cs-h3,
    .cs-flex-p,
    .cs-name {
      color: var(--bodyTextColorWhite);
    }
    // ... más selectores
  }
}
```

**Después** (especificidad reducida):

```less
:root[data-theme='dark'] {
  #sbs :where(.cs-left) {
    &:before,
    &:after {
      background: var(--accent);
    }
  }

  #sbs :where(.cs-title),
  #sbs :where(.cs-text),
  #sbs :where(.cs-h3),
  #sbs :where(.cs-flex-p),
  #sbs :where(.cs-name) {
    color: var(--bodyTextColorWhite);
  }
  // ... más selectores
}
```

**Selectores afectados** (8 total):

- `.cs-left`
- `.cs-picture2`
- `.cs-topper`
- `.cs-title`
- `.cs-text`
- `.cs-h3`
- `.cs-flex-p`
- `.cs-name`
- `.cs-flex-group`
- `.cs-job`
- `.cs-quote-icon`

**Razón**: Estos selectores combinan un ID con múltiples clases BEM, generando especificidad 1,0,2 o superior. Al usar `:where()`, la especificidad se reduce a 1,0,0 (solo el ID cuenta), permitiendo que utilidades o componentes puedan override fácilmente.

---

### 2. `src/styles/pages/contacto.less`

**Sección**: Dark mode para `#cs-contact`

**Antes**:

```less
:root[data-theme='dark'] {
  #cs-contact {
    .cs-text,
    .cs-title {
      color: var(--bodyTextColorWhite);
    }

    .cs-topper {
      color: var(--primaryLight);
    }

    #cs-form {
      label,
      input,
      textarea {
        color: var(--bodyTextColorWhite);
      }
    }

    .cs-bg-picture {
      background-color: #000;
    }
  }
}
```

**Después**:

```less
:root[data-theme='dark'] {
  #cs-contact :where(.cs-text),
  #cs-contact :where(.cs-title) {
    color: var(--bodyTextColorWhite);
  }

  #cs-contact :where(.cs-topper) {
    color: var(--primaryLight);
  }

  #cs-contact :where(#cs-form) {
    label,
    input,
    textarea {
      color: var(--bodyTextColorWhite);
    }
  }

  #cs-contact :where(.cs-bg-picture) {
    background-color: #000;
  }
}
```

**Selectores afectados** (4 total):

- `.cs-text`
- `.cs-title`
- `.cs-topper`
- `#cs-form` (ID dentro de ID - caso especial)
- `.cs-bg-picture`

**Razón**: Formulario de contacto con selector ID anidado (`#cs-contact #cs-form`) que genera especificidad 2,0,0. Al usar `:where(#cs-form)`, reducimos a 1,0,0 del padre, facilitando overrides.

---

## 🔍 Casos de Uso Futuros

### Cuándo aplicar `:where()`:

✅ **SÍ aplicar**:

- Selectores con ID + múltiples clases anidadas
- Bloques de dark mode con alta especificidad
- Selectores en `@layer legacy` que necesitan ser flexibles
- Casos donde se prevén overrides frecuentes desde utilidades

❌ **NO aplicar**:

- Utilidades (`.u-*`) - ya tienen baja especificidad por diseño
- Componentes BEM simples (`.c-button`) - no hay problema de especificidad
- Selectores de una sola clase
- Casos donde queremos IMPEDIR overrides (estilos críticos)

### Patrón recomendado:

```less
/* Antes (especificidad 1,0,2) */
#section {
  .element {
    .child {
      color: red;
    }
  }
}

/* Después (especificidad 1,0,0) */
#section :where(.element .child) {
  color: red;
}

/* O mejor aún (separar en utilidades si es posible) */
#section .element .child {
  /* usar .u-text-primary en HTML */
}
```

---

## 📊 Impacto en Especificidad

| Selector Original       | Especificidad | Con `:where()`                  | Especificidad | Reducción |
| ----------------------- | ------------- | ------------------------------- | ------------- | --------- |
| `#sbs .cs-title`        | 1,0,1         | `#sbs :where(.cs-title)`        | 1,0,0         | -1 clase  |
| `#sbs .cs-left::before` | 1,0,2         | `#sbs :where(.cs-left)::before` | 1,0,1         | -1 clase  |
| `#cs-contact #cs-form`  | 2,0,0         | `#cs-contact :where(#cs-form)`  | 1,0,0         | -1 ID     |

---

## 🧪 Verificación

Para verificar que `:where()` funciona correctamente:

1. Inspeccionar en DevTools la especificidad calculada
2. Intentar override con utilidad `.u-text-primary` → debería funcionar
3. Verificar que estilos de dark mode siguen aplicándose correctamente
4. Confirmar que no hay regresiones visuales

---

## 📚 Referencias

- [MDN: :where()](https://developer.mozilla.org/en-US/docs/Web/CSS/:where)
- [CSS Specificity Calculator](https://specificity.keegan.st/)
- [ITCSS Architecture](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/)
