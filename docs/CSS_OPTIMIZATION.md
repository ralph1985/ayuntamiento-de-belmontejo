# Optimización de CSS - Guía Completa

## 🎯 Objetivo

Este proyecto implementa un sistema de **poda y minificado selectivo de CSS** que:

1. **Elimina clases CSS no usadas** (PurgeCSS)
2. **Protege la capa `@layer legacy`** para evitar romper estilos existentes
3. **Minifica el CSS final** (cssnano + autoprefixer)
4. **Proporciona análisis detallado** antes de aplicar cambios

---

## 📦 Dependencias Instaladas

```bash
npm install --save-dev @fullhuman/postcss-purgecss purgecss cssnano postcss-cli
```

### Herramientas

- **PurgeCSS**: Elimina CSS no usado analizando los archivos fuente
- **cssnano**: Minifica CSS (optimiza colores, combina reglas, etc.)
- **autoprefixer**: Añade prefijos de navegador automáticamente
- **postcss-cli**: Ejecuta PostCSS desde línea de comandos

---

## 🏗️ Arquitectura CSS

El proyecto usa **ITCSS con CSS Cascade Layers**:

```less
@layer base, components, utilities, legacy;

@layer base {
  /* Variables, reset, elementos base */
}
@layer components {
  /* Componentes reutilizables */
}
@layer utilities {
  /* Utilidades atómicas: u-flex, u-mt-sm */
}
@layer legacy {
  /* Código existente - NO SE PURGA */
}
```

### ¿Por qué NO purgar `@layer legacy`?

- Contiene estilos heredados que pueden no estar completamente documentados
- Evita romper estilos durante la migración progresiva a componentes BEM
- Se purgará en futuras iteraciones cuando todo esté migrado a components

---

## 🚀 Scripts Disponibles

### 1. Análisis (Dry-run)

**Recomendado ejecutar ANTES de cualquier refactor grande**

```bash
npm run purge:dry
```

**¿Qué hace?**

- Ejecuta un análisis **sin modificar archivos**
- Genera reportes en `dist/purge-analysis/`
- Muestra qué CSS se eliminaría y cuánto espacio se ahorraría

**Salida:**

```
dist/purge-analysis/
  ├── main.abc123.analysis.txt  # Reporte detallado
  └── rejected.css               # CSS que se eliminaría
```

**Cuándo usar:**

- Antes de un gran refactor de componentes
- Para identificar CSS muerto
- Para validar que no se eliminan clases necesarias

---

### 2. Aplicar Purgado

```bash
npm run purge:apply
```

**¿Qué hace?**

- Ejecuta PurgeCSS y **MODIFICA** los archivos CSS en `dist/`
- Protege `@layer legacy` completamente
- Aplica safelist de clases protegidas

**⚠️ IMPORTANTE:**

- Solo afecta archivos en `dist/` (no modifica código fuente)
- Ejecuta `npm run build` primero para regenerar desde cero

---

### 3. Minificar CSS

```bash
npm run build:css
```

**¿Qué hace?**

- Minifica CSS con cssnano (solo en producción)
- Aplica autoprefixer para compatibilidad de navegadores
- NO purga clases (solo comprime)

**Optimizaciones aplicadas:**

- Elimina comentarios
- Optimiza colores: `#ffffff` → `#fff`
- Combina reglas duplicadas
- Minifica selectores y media queries

---

### 4. Pipeline Completo (Recomendado para Producción)

```bash
npm run optimize:css
```

**Pipeline:**

1. `npm run build` - Compila Astro + LESS
2. `npm run purge:apply` - Elimina CSS no usado
3. `npm run build:css` - Minifica resultado final

**Resultado:**

- CSS optimizado en `dist/_astro/*.css`
- Tamaño reducido ~30-50% (estimado)

---

### 5. Análisis Completo

```bash
npm run analyze:css
```

**¿Qué hace?**

- Compila el proyecto
- Genera análisis sin modificar archivos
- Perfecto para CI/CD o revisión periódica

---

## 🛡️ Safelist - Clases Protegidas

El sistema **NUNCA eliminará** estas clases:

### Patrones Estándar

```javascript
/^data-theme/     // data-theme="dark"
/^dark-mode$/     // body.dark-mode (legacy)
/^is-/            // is-active, is-open, is-visible
/^has-/           // has-error, has-warning
/^js-/            // js-menu-toggle (hooks de JS)
/^astro-/         // Clases generadas por Astro
```

### Patrones Deep (incluye descendientes)

```javascript
/^u-/   // Todas las utilidades: u-flex, u-mt-sm, u-grid-cols-2
/^c-/   // Componentes BEM: c-card, c-button
/^cs-/  // CodeStitch: cs-topper, cs-title, cs-button
```

### Patrones Greedy (búsqueda agresiva)

```javascript
/dark/        // *dark* - Protege dark mode
/theme/       // *theme* - Protege temas
/transition/  // View Transitions de Astro
/cookie/      // Cookie consent
```

---

## 🔧 Configuración

### PostCSS (`postcss.config.cjs`)

```javascript
// PurgeCSS solo se activa con PURGE_CSS=true
const isPurgeEnabled = process.env.PURGE_CSS === 'true';

// cssnano solo en producción
const isProduction = process.env.NODE_ENV === 'production';
```

### PurgeCSS Custom (`purgecss.config.js`)

Configuración standalone para dry-runs con CLI de PurgeCSS.

### Script Node.js (`scripts/purge-css.js`)

**Funcionalidad avanzada:**

- Detecta automáticamente `@layer` blocks en el CSS compilado
- Protege `@layer legacy` completamente
- Genera análisis detallados con métricas de ahorro
- Valida que `dist/_astro/` existe antes de procesar

---

## 📊 Métricas Esperadas

### Antes de Optimizar

```
dist/_astro/main.abc123.css: ~150 KB
```

### Después de Purgar

```
Purgado: ~100 KB (-33%)
```

### Después de Minificar

```
Final: ~70 KB (-53% total)
```

**Nota:** Los números exactos dependen del contenido del sitio.

---

## 🔍 Cómo Revisar el Análisis

Después de `npm run purge:dry`:

### 1. Abrir Reporte

```bash
cat dist/purge-analysis/main.abc123.analysis.txt
```

### 2. Revisar Métricas

```
Tamaño original: 150.23 KB
CSS purgado: 100.45 KB
Tamaño final (con legacy): 120.78 KB
Ahorro: 49.78 KB (33.14%)
```

### 3. Verificar CSS Eliminado

```
CSS ELIMINADO (muestra):
.clase-no-usada { color: red; }
.otro-selector-muerto { margin: 10px; }
```

### 4. Validar Clases Importantes

**Si ves una clase necesaria en "CSS ELIMINADO":**

1. Añádela a la safelist en `postcss.config.cjs`
2. O usa un patrón en `purgecss.config.js`
3. Vuelve a ejecutar `npm run purge:dry`

---

## 📝 Ampliar la Safelist

### Caso 1: Proteger clase específica

```javascript
// postcss.config.cjs
safelist: {
  standard: [
    'mi-clase-especial',
    /^otro-patron-/,
  ],
}
```

### Caso 2: Proteger familia de clases

```javascript
// postcss.config.cjs
safelist: {
  deep: [
    /^mis-componentes-/,  // mis-componentes-card, mis-componentes-button
  ],
}
```

### Caso 3: Proteger clases dinámicas de JS

```javascript
// postcss.config.cjs
safelist: {
  greedy: [
    /modal/,     // Protege todo lo relacionado con modals
    /dropdown/,  // Protege dropdowns
  ],
}
```

---

## 🐛 Troubleshooting

### ❌ Error: "No se encontró dist/\_astro/"

**Solución:**

```bash
npm run build  # Compila Astro primero
npm run purge:dry
```

### ❌ Clase necesaria eliminada

**Ejemplo:** `.my-dynamic-class` generada por JS desaparece.

**Solución:**

```javascript
// postcss.config.cjs
safelist: {
  standard: [/^my-dynamic-/],
}
```

### ❌ Dark mode roto después de purgar

**Síntoma:** El modo oscuro no funciona correctamente.

**Causa:** Alguna clase de dark mode fue eliminada.

**Solución:** Verifica la safelist:

```javascript
safelist: {
  greedy: [
    /dark/,  // Ya está, pero verifica
  ],
}
```

### ❌ El purgado no reduce el tamaño

**Causa:** La mayoría del CSS está en `@layer legacy` (protegida).

**Solución:**

1. Migra más estilos a `@layer components`
2. Revisa `src/styles/legacy/` y mueve lo posible a `components/`
3. Vuelve a ejecutar análisis

---

## 🎓 Mejores Prácticas

### 1. Ejecuta `purge:dry` Regularmente

```bash
# Cada viernes (review semanal)
npm run analyze:css
```

### 2. Antes de Grandes Refactors

```bash
# Antes
npm run purge:dry

# Refactor code...

# Después
npm run purge:dry
# Compara resultados
```

### 3. En CI/CD (Opcional)

```yaml
# .github/workflows/ci.yml
- name: Analyze CSS Size
  run: npm run analyze:css
```

### 4. Migración Progresiva

```
Paso 1: Migrar componente de legacy a components
Paso 2: npm run purge:dry
Paso 3: Verificar que todo funciona
Paso 4: Repeat
```

---

## 📚 Recursos Adicionales

- [PurgeCSS Docs](https://purgecss.com/)
- [cssnano Optimizations](https://cssnano.co/docs/optimisations/)
- [ITCSS Architecture](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/)
- [CSS Cascade Layers](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)

---

## 🔄 Flujo de Trabajo Recomendado

### Desarrollo Diario

```bash
npm run dev  # Sin optimizaciones
```

### Antes de Commit (opcional)

```bash
npm run lint:css:fix
npm run format:write
```

### Pre-deploy / Producción

```bash
npm run optimize:css  # Pipeline completo
npm run preview       # Verificar en local
# Deploy
```

### Review Mensual

```bash
npm run analyze:css
# Revisar dist/purge-analysis/
# Identificar CSS muerto
# Planear migraciones
```

---

## ⚙️ Variables de Entorno

```bash
# Habilitar purgado en postcss.config.cjs
PURGE_CSS=true npm run build:css

# Forzar minificación (producción)
NODE_ENV=production npm run build:css
```

---

## 🎯 Próximos Pasos

1. **Ejecuta análisis inicial:**

   ```bash
   npm run analyze:css
   ```

2. **Revisa el reporte** en `dist/purge-analysis/`

3. **Ajusta safelist** si es necesario

4. **Aplica optimización:**

   ```bash
   npm run optimize:css
   ```

5. **Verifica el sitio:**

   ```bash
   npm run preview
   ```

6. **Documenta tus resultados** (tamaño antes/después)

---

## 📞 Contacto

Si encuentras problemas o tienes sugerencias, revisa:

- `docs/WHERE_MIGRATION_COMPLETE.md` - Migración de especificidad
- `docs/UTILITIES_WHERE_SUMMARY.md` - Utilidades CSS
- `README.md` - Documentación principal del proyecto
