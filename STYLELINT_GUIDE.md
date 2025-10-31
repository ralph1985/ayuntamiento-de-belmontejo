# Guía de Stylelint - Ayuntamiento de Belmontejo

## 📋 Resumen

Este proyecto usa **Stylelint** para mantener la calidad y consistencia del código CSS/LESS siguiendo la arquitectura ITCSS.

## 🚀 Comandos Rápidos

```bash
# Verificar estilos (muestra warnings)
npm run lint:css

# Auto-corregir problemas de formato
npm run lint:css:fix

# Lintear todo (JS + CSS)
npm run lint && npm run lint:css
```

## ⚙️ Configuración Actual

### Modo "Warning" (No Bloquea PRs)

Actualmente Stylelint está configurado con `"defaultSeverity": "warning"`:

- ✅ **No bloquea commits** ni pull requests
- ⚠️ **Muestra advertencias** para mejorar el código
- 📝 **Recomendado:** Ejecutar antes de cada commit
- 🎯 **Objetivo:** Limpiar gradualmente el código existente

### Reglas Principales

#### 1. **Nomenclatura BEM Ligera**

```less
// ✅ BIEN
.card {
}
.card__header {
}
.card__header--large {
}
.news-article {
}
.news-article__title {
}

// ❌ MAL
.cardHeader {
} // camelCase
.Card {
} // PascalCase
.card_header {
} // snake_case con un solo guion bajo
```

#### 2. **Máximo 3 Niveles de Anidación**

```less
// ✅ BIEN (2 niveles)
.card {
  .card__header {
    .card__title {
      color: red;
    }
  }
}

// ⚠️ WARNING (4 niveles - demasiado profundo)
.card {
  .card__header {
    .card__title {
      .card__icon {
        // 4to nivel
        color: red;
      }
    }
  }
}

// ✅ SOLUCIÓN - Aplanar jerarquía
.card {
}
.card__header {
}
.card__title {
}
.card__icon {
  color: red;
}
```

#### 3. **Sin Nombres de Colores**

```less
// ❌ MAL
color: red;
background: white;

// ✅ BIEN
color: #ff0000;
color: var(--color-primary);
background: #ffffff;
background: var(--color-bg-main);
```

#### 4. **Sin IDs como Selectores**

```less
// ❌ MAL
#header {
  color: blue;
}

// ✅ BIEN
.header {
  color: var(--color-primary);
}

// ✅ BIEN - IDs para anclas, pero usa clases para estilos
#hero-section {
  // OK para scroll-anchor
  // Sin estilos aquí
}

.hero-section {
  // Estilos con clase
  padding: 2rem;
}
```

#### 5. **Orden de Propiedades**

```less
.component {
  // 1. Custom properties primero
  --local-color: #333;

  // 2. Variables LESS
  @local-spacing: 1rem;

  // 3. @includes
  .mixin-example();

  // 4. Propiedades
  display: block;
  color: var(--local-color);

  // 5. Media queries
  @media (min-width: 768px) {
    display: flex;
  }

  // 6. Selectores anidados
  &:hover {
    opacity: 0.8;
  }

  .nested-element {
    margin: 1rem;
  }
}
```

## 🔄 Workflow Recomendado

### Antes de Commit

```bash
# 1. Hacer cambios en archivos .less
# 2. Ejecutar linter
npm run lint:css

# 3. Si hay warnings simples, auto-corregir
npm run lint:css:fix

# 4. Revisar cambios
git diff

# 5. Commit
git add .
git commit -m "feat: actualizar estilos"
```

### En Pull Requests

1. El workflow de GitHub Actions ejecuta automáticamente `npm run lint:css`
2. **Por ahora NO falla** el PR aunque haya warnings
3. Se añade un comentario si hay problemas
4. **Recomendado:** Corregir warnings antes de mergear

## 📊 Estado de Migración

### Archivos Prioritarios (Ya Migrados)

- ✅ `src/styles/settings/_tokens.less`
- ✅ `src/styles/components/_header.less`
- ✅ `src/styles/components/_footer.less`
- ✅ `src/styles/layouts/news-post-layout.less`
- ✅ `src/styles/layouts/bando-post-layout.less`

### Pendientes de Revisar

- ⏳ `src/styles/pages/index.less`
- ⏳ `src/styles/pages/contacto.less`
- ⏳ `src/styles/components/_cs-base.less`
- ⏳ `src/styles/components/cta.less`
- ⏳ `src/styles/components/faq.less`

## 🎯 Roadmap

### Fase 1: Warming Up (ACTUAL)

- [x] Configurar Stylelint con `defaultSeverity: "warning"`
- [x] Añadir workflow CI no-bloqueante
- [x] Documentar reglas principales
- [ ] Limpiar warnings en archivos prioritarios
- [ ] Formar al equipo en convenciones

### Fase 2: Enforcement (PRÓXIMO)

- [ ] Cambiar a `defaultSeverity: "error"`
- [ ] Modificar CI para que falle en errores
- [ ] Añadir pre-commit hook con Husky
- [ ] Migrar todos los archivos pendientes

### Fase 3: Optimización (FUTURO)

- [ ] Añadir reglas custom específicas del proyecto
- [ ] Configurar property-order específico
- [ ] Integrar con editor (VS Code settings)

## 🛠️ Integración con VS Code

Para tener feedback en tiempo real, instala la extensión:

**Stylelint** (`stylelint.vscode-stylelint`)

Configuración recomendada (`.vscode/settings.json`):

```json
{
  "stylelint.validate": ["css", "less"],
  "editor.codeActionsOnSave": {
    "source.fixAll.stylelint": true
  }
}
```

## 🆘 Troubleshooting

### "Unknown rule" o "Cannot find module"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### "Parsing error" en archivos LESS

Verifica que `.stylelintrc.json` tenga:

```json
{
  "customSyntax": "postcss-less"
}
```

### Demasiados warnings en archivo legacy

Opción 1: Corregir gradualmente
Opción 2: Añadir comentario de desactivación temporal:

```less
/* stylelint-disable */
.legacy-code {
  // código antiguo
}
/* stylelint-enable */
```

## 📚 Referencias

- [Stylelint Documentation](https://stylelint.io/)
- [LESS Syntax](https://lesscss.org/)
- [BEM Methodology](https://getbem.com/)
- [ITCSS Architecture](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/)

---

**Última actualización:** 31 de octubre de 2025
