# Exclusión de @layer legacy - Documentación Técnica

## 🎯 Objetivo

El script `scripts/purge-css.js` **debe proteger completamente** la capa `@layer legacy` durante el purgado de CSS, asegurando que NO se elimine ningún estilo heredado durante la migración progresiva a componentes BEM.

---

## 🔍 Cómo Funciona

### 1. Detección de Capas

El script analiza el CSS compilado y detecta bloques `@layer`:

```javascript
const layerRegex = /@layer\s+(base|components|utilities|legacy)\s*\{/g;
```

**Algoritmo:**

1. Busca todos los `@layer` en el CSS
2. Cuenta llaves `{` y `}` para encontrar el cierre de cada bloque
3. Extrae el contenido de cada capa

**Resultado:**

```javascript
{
  base: '/* CSS de @layer base */',
  components: '/* CSS de @layer components */',
  utilities: '/* CSS de @layer utilities */',
  legacy: '/* CSS de @layer legacy */',
  other: '/* CSS fuera de layers */'
}
```

---

### 2. Separación Selectiva

Solo se purgan estas capas:

```javascript
const cssToPurge =
  layers.base + layers.components + layers.utilities + layers.other;
```

**NO SE INCLUYE:** `layers.legacy`

---

### 3. Purgado

PurgeCSS se ejecuta SOLO sobre el CSS a purgar:

```javascript
const purgeCSSResult = await new PurgeCSS().purge({
  content: ['./src/**/*.{astro,tsx,jsx,ts,js,html}', './public/**/*.html'],
  css: [{ raw: cssToPurge }], // ← Sin layers.legacy
  safelist: CONFIG.safelist,
});
```

---

### 4. Reconstrucción

El CSS final se reconstruye añadiendo `legacy` al final:

```javascript
const finalCSS =
  purgedCSS +
  '\n\n' +
  (layers.legacy ? `@layer legacy {\n${layers.legacy}\n}` : '');
```

**Output:**

```css
/* CSS purgado de base, components, utilities */

@layer legacy {
  /* CSS legacy COMPLETO, sin purgar */
}
```

---

## 📊 Ejemplo de Ejecución

### Entrada (CSS compilado)

```css
@layer base {
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
  }
}

@layer components {
  .c-card {
    padding: 1rem;
  }
  .c-unused {
    color: red;
  } /* NO usada */
}

@layer legacy {
  #old-component {
    background: blue;
  }
  .legacy-unused {
    margin: 10px;
  }
}
```

### Procesamiento

1. **Detección:**
   - `layers.base` = `* { box-sizing... } body { margin... }`
   - `layers.components` = `.c-card { padding... } .c-unused { color... }`
   - `layers.legacy` = `#old-component { background... } .legacy-unused { margin... }`

2. **Purgado:**
   - CSS a purgar: `base + components`
   - PurgeCSS analiza y encuentra:
     - `.c-card` → Usada ✅
     - `.c-unused` → NO usada ❌ (eliminar)

3. **Reconstrucción:**

   ```css
   @layer base {
     * {
       box-sizing: border-box;
     }
     body {
       margin: 0;
     }
   }

   @layer components {
     .c-card {
       padding: 1rem;
     }
     /* .c-unused eliminada */
   }

   @layer legacy {
     #old-component {
       background: blue;
     }
     .legacy-unused {
       margin: 10px;
     }
     /* ✅ TODO preservado */
   }
   ```

---

## 🛡️ Garantías de Seguridad

### ✅ Garantizado

- **100% de `@layer legacy` se preserva** (sin análisis)
- Clases no usadas en `base`, `components`, `utilities` se eliminan
- Safelist protege utilidades y componentes críticos
- Dry-run permite revisar antes de aplicar

### ⚠️ Advertencias

- Si el CSS está **pre-compilado sin @layer**, el script lo detecta y alerta
- En ese caso, aplica purgado a TODO el CSS (con safelist)
- Recomendación: Siempre compilar desde LESS con capas intactas

---

## 🧪 Validación

### Prueba Manual

```bash
# 1. Compilar proyecto
npm run build

# 2. Ejecutar dry-run
npm run purge:dry

# 3. Revisar análisis
cat dist/purge-analysis/*.analysis.txt
```

**Verificar:**

```
Capas detectadas:
- Base: ✓
- Components: ✓
- Utilities: ✓
- Legacy: ✓ (protegida)
```

### Verificación de Output

```bash
# Buscar @layer legacy en el CSS final
grep -A 5 "@layer legacy" dist/_astro/*.css
```

Debe mostrar:

```css
@layer legacy {
  /* Contenido completo de legacy */
}
```

---

## 🔧 Ajustes Avanzados

### Caso 1: Purgar Legacy Selectivamente

**NO RECOMENDADO**, pero si quieres purgar legacy:

```javascript
// scripts/purge-css.js (línea ~200)
const cssToPurge =
  layers.base + layers.components + layers.utilities + layers.legacy;
//                                                                       ^^^^^^^^^^^^
```

### Caso 2: Proteger Otras Capas

```javascript
// Ejemplo: Proteger también components
const cssToPurge = layers.base + layers.utilities;
const protected = layers.components + layers.legacy;
const finalCSS = purgedCSS + '\n\n' + protected;
```

---

## 📈 Métricas de Protección

### Con @layer legacy protegida

| Capa       | Tamaño  | Purgado | Protegido |
| ---------- | ------- | ------- | --------- |
| base       | ~10 KB  | ✂️ 5%   | -         |
| components | ~30 KB  | ✂️ 40%  | -         |
| utilities  | ~5 KB   | ✂️ 10%  | -         |
| **legacy** | ~80 KB  | -       | ✅ 100%   |
| **Total**  | ~125 KB | ~15 KB  | ~80 KB    |

**Ahorro real:** ~12% (solo en capas no protegidas)

### Sin @layer legacy (futuro)

| Capa       | Tamaño  | Purgado | Ahorro  |
| ---------- | ------- | ------- | ------- |
| base       | ~10 KB  | ✂️ 5%   | -       |
| components | ~110 KB | ✂️ 45%  | ~50 KB  |
| utilities  | ~5 KB   | ✂️ 10%  | -       |
| legacy     | 0 KB    | -       | -       |
| **Total**  | ~125 KB | ~55 KB  | **44%** |

---

## 🎓 Lecciones Aprendidas

### Por qué NO purgar legacy (ahora)

1. **Migración Progresiva:** Legacy contiene código crítico en uso
2. **Riesgo de Rotura:** Sin mapeo completo, podríamos eliminar estilos necesarios
3. **Refactor Seguro:** Permite migrar componente por componente
4. **Análisis Futuro:** Cuando legacy esté vacío, se purgará automáticamente

### Estrategia de Migración

```
Fase 1 (ACTUAL): Proteger legacy ✅
├── Migrar componentes uno a uno
├── Testear exhaustivamente
└── Reducir tamaño de legacy gradualmente

Fase 2 (FUTURO): Legacy vacío
├── Todo migrado a components
├── Purgar all layers
└── Máximo ahorro (~40-50%)
```

---

## 📚 Referencias

- Script: `scripts/purge-css.js`
- Config: `postcss.config.cjs`
- Config standalone: `purgecss.config.js`
- Docs: `docs/CSS_OPTIMIZATION.md`

---

## ✅ Checklist de Validación

Antes de cada release, verificar:

- [ ] `@layer legacy` presente en CSS compilado
- [ ] Dry-run muestra "Legacy: ✓ (protegida)"
- [ ] CSS final contiene `@layer legacy { ... }`
- [ ] Tamaño de legacy sin cambios después de purge
- [ ] Dark mode funciona (usa legacy)
- [ ] Componentes críticos intactos

---

**Última actualización:** 31 Octubre 2025
**Versión:** 1.0
**Autor:** Sistema de Optimización CSS
