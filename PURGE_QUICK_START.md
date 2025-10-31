# CSS Purge & Minify - Quick Start

## 🚀 Uso Rápido

### 1️⃣ Instalar Dependencias

```bash
npm install --save-dev @fullhuman/postcss-purgecss purgecss cssnano postcss-cli
```

### 2️⃣ Análisis (Dry-run)

```bash
npm run analyze:css
```

**Output:** `dist/purge-analysis/*.analysis.txt`

### 3️⃣ Revisar Reporte

```bash
cat dist/purge-analysis/*.analysis.txt
```

Busca:

- ✅ **Ahorro estimado** (KB y %)
- ⚠️ **Clases eliminadas** que podrían ser necesarias
- 📊 **Capas detectadas**

### 4️⃣ Optimizar (Producción)

```bash
npm run optimize:css
```

**Pipeline:**

1. Compila Astro + LESS
2. Purga CSS no usado
3. Minifica con cssnano

### 5️⃣ Verificar

```bash
npm run preview
```

Prueba especialmente:

- 🌓 Dark mode toggle
- 📱 Responsive layouts
- 🎨 Componentes dinámicos

---

## 📦 Scripts Disponibles

| Script         | Descripción                     | Uso                    |
| -------------- | ------------------------------- | ---------------------- |
| `purge:dry`    | Análisis sin modificar archivos | Antes de refactors     |
| `purge:apply`  | Aplica purgado real             | Manualmente si quieres |
| `build:css`    | Solo minifica                   | Post-build             |
| `optimize:css` | Pipeline completo (recomendado) | Pre-deploy             |
| `analyze:css`  | Build + análisis                | Review periódica       |

---

## 🛡️ Safelist - Clases Protegidas

**NUNCA se eliminan:**

```
u-*          → Todas las utilidades
c-*          → Componentes BEM
cs-*         → CodeStitch
is-*, has-*  → Estados dinámicos
data-theme   → Dark mode
dark-mode    → Legacy dark mode
astro-*      → Clases de Astro
```

---

## ⚙️ Configuración Clave

### `@layer legacy` - PROTEGIDA

```less
@layer legacy {
  /* Este CSS NUNCA se purga */
}
```

**Motivo:** Migración progresiva segura.

### Custom Safelist

```javascript
// postcss.config.cjs
safelist: {
  standard: ['mi-clase'],
  deep: [/^mi-patron-/],
  greedy: [/dynamic/],
}
```

---

## 📊 Métricas Esperadas

| Fase       | Tamaño  | Ahorro |
| ---------- | ------- | ------ |
| Original   | ~150 KB | -      |
| Purgado    | ~100 KB | -33%   |
| Minificado | ~70 KB  | -53%   |

_Nota: Depende del contenido específico del sitio._

---

## 🐛 Troubleshooting Rápido

### ❌ Clase necesaria eliminada

```javascript
// postcss.config.cjs
safelist: {
  standard: [/^mi-clase-dinamica/],
}
```

### ❌ Dark mode roto

Verifica que `/dark/` está en `safelist.greedy`.

### ❌ No reduce tamaño

La mayoría del CSS podría estar en `@layer legacy` (protegida).
**Solución:** Migra más estilos a `components`.

---

## 📚 Documentación Completa

- 📘 **[CSS_OPTIMIZATION.md](./docs/CSS_OPTIMIZATION.md)** - Guía detallada
- 📗 **[README.md](./README.md)** - Documentación principal

---

## 🔄 Flujo de Trabajo

### Desarrollo

```bash
npm run dev  # Sin optimizaciones
```

### Pre-commit (opcional)

```bash
npm run lint:css:fix
```

### Pre-deploy

```bash
npm run analyze:css      # Revisar
npm run optimize:css     # Aplicar
npm run preview          # Verificar
```

### Review mensual

```bash
npm run analyze:css
# Identificar CSS muerto
# Planear migraciones
```

---

## ✅ Checklist Pre-deploy

- [ ] Ejecutar `npm run analyze:css`
- [ ] Revisar `dist/purge-analysis/*.analysis.txt`
- [ ] Verificar que no se eliminan clases necesarias
- [ ] Ejecutar `npm run optimize:css`
- [ ] Probar `npm run preview`
- [ ] Verificar dark mode
- [ ] Verificar responsive
- [ ] Desplegar

---

## 🎯 Próximos Pasos

1. **Ahora:** `npm run analyze:css`
2. **Revisar:** Reportes en `dist/purge-analysis/`
3. **Ajustar:** Safelist si es necesario
4. **Aplicar:** `npm run optimize:css`
5. **Verificar:** `npm run preview`
6. **Documentar:** Tamaño antes/después

---

**¿Problemas?** → [CSS_OPTIMIZATION.md](./docs/CSS_OPTIMIZATION.md)
