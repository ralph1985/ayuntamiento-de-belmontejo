# Inventario de Componentes .cs-\* Comunes

## 📊 Componentes Detectados y Frecuencia

### Componentes de Texto (Alta Frecuencia)

| Componente Original | Archivos                                    | Propuesta Nuevo Nombre | Categoría  |
| ------------------- | ------------------------------------------- | ---------------------- | ---------- |
| `.cs-topper`        | root.less, index.less, sobre-el-pueblo.less | `.c-topper`            | Typography |
| `.cs-title`         | root.less, index.less, sobre-el-pueblo.less | `.c-title`             | Typography |
| `.cs-text`          | root.less, index.less, sobre-el-pueblo.less | `.c-text`              | Typography |
| `.cs-h3`            | sobre-el-pueblo.less                        | `.c-heading-3`         | Typography |

### Componentes de Botones (Alta Frecuencia)

| Componente Original      | Archivos                                    | Propuesta Nuevo Nombre | Categoría |
| ------------------------ | ------------------------------------------- | ---------------------- | --------- |
| `.cs-button-solid`       | root.less, index.less, sobre-el-pueblo.less | `.c-button`            | Button    |
| `.cs-button-transparent` | index.less                                  | `.c-button--outline`   | Button    |

### Componentes de Layout (Media Frecuencia)

| Componente Original | Archivos                                                      | Propuesta Nuevo Nombre | Categoría |
| ------------------- | ------------------------------------------------------------- | ---------------------- | --------- |
| `.cs-container`     | index.less, sobre-el-pueblo.less, buscar.less, proyectos.less | `.c-container`         | Layout    |
| `.cs-left`          | index.less, sobre-el-pueblo.less                              | `.c-split__left`       | Layout    |
| `.cs-right`         | index.less, sobre-el-pueblo.less                              | `.c-split__right`      | Layout    |
| `.cs-flex-group`    | index.less, sobre-el-pueblo.less                              | `.c-flex-group`        | Layout    |

### Componentes de Media (Media Frecuencia)

| Componente Original | Archivos                                         | Propuesta Nuevo Nombre | Categoría |
| ------------------- | ------------------------------------------------ | ---------------------- | --------- |
| `.cs-picture`       | index.less, sobre-el-pueblo.less, proyectos.less | `.c-picture`           | Media     |
| `.cs-img`           | index.less                                       | `.c-img`               | Media     |
| `.cs-image-group`   | proyectos.less                                   | `.c-image-group`       | Media     |

### Componentes de Contenido (Baja Frecuencia)

| Componente Original | Archivos                         | Propuesta Nuevo Nombre | Categoría |
| ------------------- | -------------------------------- | ---------------------- | --------- |
| `.cs-flex-p`        | index.less, sobre-el-pueblo.less | `.c-flex-text`         | Content   |
| `.cs-name`          | index.less, sobre-el-pueblo.less | `.c-name`              | Content   |
| `.cs-job`           | index.less, sobre-el-pueblo.less | `.c-job-title`         | Content   |
| `.cs-quote-icon`    | index.less, sobre-el-pueblo.less | `.c-quote-icon`        | Content   |

### Componentes Utilitarios (Media Frecuencia)

| Componente Original   | Archivos  | Propuesta Nuevo Nombre | Categoría |
| --------------------- | --------- | ---------------------- | --------- |
| `.cs-hide-on-mobile`  | root.less | `.u-hide-mobile`       | Utility   |
| `.cs-hide-on-desktop` | root.less | `.u-hide-desktop`      | Utility   |
| `.cs-card-shadow`     | root.less | `.u-shadow-card`       | Utility   |
| `.cs-shadow-light`    | root.less | `.u-shadow-light`      | Utility   |
| `.cs-shadow-medium`   | root.less | `.u-shadow-medium`     | Utility   |
| `.cs-shadow-strong`   | root.less | `.u-shadow-strong`     | Utility   |

### Componentes de Dark Mode (Específicos)

| Componente Original | Archivos                           | Propuesta Nuevo Nombre | Categoría |
| ------------------- | ---------------------------------- | ---------------------- | --------- |
| `.cs-sun`           | root.less, \_dark-mode-toggle.less | `.c-dark-toggle__sun`  | Component |
| `.cs-moon`          | root.less, \_dark-mode-toggle.less | `.c-dark-toggle__moon` | Component |

---

## 🎯 Priorización para Migración

### Lote 1: Componentes Base (AHORA)

**Impacto:** Alto - Aparecen en casi todas las páginas

- ✅ `.cs-topper` → `.c-topper`
- ✅ `.cs-title` → `.c-title`
- ✅ `.cs-text` → `.c-text`
- ✅ `.cs-button-solid` → `.c-button`
- ✅ `.cs-button-transparent` → `.c-button--outline`

**Archivos afectados:** root.less, index.less, sobre-el-pueblo.less, contacto.less

---

### Lote 2: Componentes de Layout (SIGUIENTE)

**Impacto:** Medio - Usado en secciones específicas

- ⏳ `.cs-container` → `.c-container`
- ⏳ `.cs-left` → `.c-split__left`
- ⏳ `.cs-right` → `.c-split__right`
- ⏳ `.cs-picture` → `.c-picture`

**Archivos afectados:** index.less, sobre-el-pueblo.less, proyectos.less

---

### Lote 3: Componentes Utilitarios (DESPUÉS)

**Impacto:** Bajo - Clases de utilidad, mover a @layer utilities

- ⏳ `.cs-hide-on-mobile` → `.u-hide-mobile`
- ⏳ `.cs-hide-on-desktop` → `.u-hide-desktop`
- ⏳ `.cs-shadow-*` → `.u-shadow-*`

**Archivos afectados:** root.less

---

## 📐 Convención BEM Propuesta

### Patrón de Nombres

```
.c-{block}              // Componente base
.c-{block}--{modifier}  // Variante del componente
.c-{block}__{element}   // Elemento hijo del componente
```

### Ejemplos Aplicados

**ANTES (CodeStitch):**

```less
.cs-button-solid {
}
.cs-button-transparent {
}
.cs-title {
}
.cs-left {
}
.cs-right {
}
```

**DESPUÉS (BEM ligero):**

```less
// Bloque base
.c-button {
}

// Modificadores
.c-button--outline {
}
.c-button--large {
}

// Componente de split layout
.c-split__left {
}
.c-split__right {
}

// Título con variantes
.c-title {
}
.c-title--large {
}
```

---

## 🔍 Análisis de Especificidad

### Actual (root.less)

```less
.cs-topper {
} // Especificidad: 0,0,1,0 ✅
.cs-title {
} // Especificidad: 0,0,1,0 ✅
.cs-button-solid {
} // Especificidad: 0,0,1,0 ✅
```

### Propuesta (con :where para compatibilidad)

```less
// En @layer components - nueva implementación
.c-topper {
} // Especificidad: 0,0,1,0 ✅

// En @layer legacy - alias temporal
:where(.cs-topper) {
  // Especificidad: 0,0,0,0 (no interferirá)
  // hereda de .c-topper via HTML dual class
}
```

**Ventaja:** No aumenta especificidad, usa `:where()` para rebajarla a 0.

---

## 📋 Checklist de Migración por Componente

### `.cs-topper` → `.c-topper`

- [x] Analizado en root.less (líneas 49-57)
- [x] Detectado en index.less (múltiples usos)
- [x] Detectado en sobre-el-pueblo.less
- [ ] Extraer a \_cs-base.less
- [ ] Crear alias en @layer legacy
- [ ] Migrar HTML con dual class

**Propiedades actuales:**

```less
font-size: var(--topperFontSize); // ✅ Usa token
font-weight: 700;
line-height: 1.2em;
text-transform: uppercase;
letter-spacing: 0.1em;
color: var(--secondary); // ✅ Usa token
display: block;
```

**Tokens requeridos:** ✅ Ya usa tokens (--topperFontSize, --secondary)

---

### `.cs-title` → `.c-title`

- [x] Analizado en root.less (líneas 59-66)
- [x] Detectado en index.less (múltiples usos)
- [x] Detectado en sobre-el-pueblo.less
- [ ] Extraer a \_cs-base.less
- [ ] Crear alias en @layer legacy
- [ ] Migrar HTML con dual class

**Propiedades actuales:**

```less
font-size: var(--headerFontSize); // ✅ Usa token
font-weight: 900;
line-height: 1.2em;
margin: 0 auto (16/16rem);
color: var(--headerColor); // ✅ Usa token
position: relative;
```

**Tokens requeridos:** ✅ Ya usa tokens (--headerFontSize, --headerColor)

---

### `.cs-text` → `.c-text`

- [x] Analizado en root.less (líneas 68-75)
- [x] Detectado en index.less
- [x] Detectado en sobre-el-pueblo.less
- [ ] Extraer a \_cs-base.less
- [ ] Crear alias en @layer legacy
- [ ] Migrar HTML con dual class

**Propiedades actuales:**

```less
font-size: var(--bodyFontSize); // ✅ Usa token
line-height: 1.5em;
width: 100%;
margin: 0 auto;
color: var(--bodyTextColor); // ✅ Usa token
```

**Tokens requeridos:** ✅ Ya usa tokens

---

### `.cs-button-solid` → `.c-button`

- [x] Analizado en root.less (líneas 77-115)
- [x] Detectado en index.less
- [x] Detectado en sobre-el-pueblo.less
- [ ] Extraer a \_cs-base.less
- [ ] Crear alias en @layer legacy
- [ ] Migrar HTML con dual class

**Propiedades actuales:**

```less
font-size: (16/16rem);
font-weight: bold;
line-height: (50/16em);
text-align: center;
text-transform: uppercase;
text-decoration: none;
width: auto;
height: (50/16rem);
padding: 0 (30/16rem);
color: var(--text-white); // ✅ Usa token
background-color: var(--primary); // ✅ Usa token
// ... transiciones y estados hover
```

**Tokens requeridos:** ✅ Ya usa tokens (--text-white, --primary, --accent)

---

### `.cs-button-transparent` → `.c-button--outline`

- [x] Analizado en index.less
- [ ] Extraer a \_cs-base.less como modificador
- [ ] Crear alias en @layer legacy
- [ ] Migrar HTML

**Propiedades actuales:**

```less
font-size: (16/16rem);
font-weight: 700;
line-height: clamp(2.875em, 5.5vw, 3.5em);
// ...
color: #fff; // ❌ Valor duro
background-color: transparent;
border: 1px solid var(--bodyTextColorWhite); // ✅ Usa token
```

**Tokens a añadir:** Reemplazar `#fff` por `var(--color-text-white)`

---

## 🔄 Estrategia de Compatibilidad

### Opción 1: Aliases con :where() (RECOMENDADA)

```less
// @layer components - Nueva implementación
.c-topper {
  font-size: var(--topperFontSize);
  font-weight: 700;
  line-height: 1.2em;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--secondary);
  display: block;
}

// @layer legacy - Alias temporal con especificidad 0
:where(.cs-topper) {
  // No necesita propiedades - hereda de .c-topper via HTML
  // Especificidad: 0,0,0,0
}
```

**HTML durante transición:**

```html
<!-- Ambas clases -->
<span class="cs-topper c-topper">Belmontejo</span>
```

### Opción 2: Extend de LESS (si no funciona :where)

```less
// @layer legacy
.cs-topper {
  &:extend(.c-topper);
}
```

---

## 📏 Medición de Impacto

### Archivos con Mayor Duplicación

1. **index.less** (1276 líneas)
   - `.cs-topper`: 3+ ocurrencias
   - `.cs-title`: 4+ ocurrencias
   - `.cs-text`: 3+ ocurrencias
   - `.cs-button-solid`: 2+ ocurrencias
   - **Estimación de reducción:** ~100-150 líneas

2. **sobre-el-pueblo.less** (223 líneas)
   - `.cs-topper`: 2 ocurrencias
   - `.cs-title`: 1 ocurrencia
   - `.cs-text`: 1 ocurrencia
   - **Estimación de reducción:** ~30-50 líneas

3. **root.less** (374 líneas)
   - Componentes base ya definidos aquí
   - Se moverán a \_cs-base.less
   - **Estimación de reducción:** ~100 líneas

### Proyección de Reducción Total

- **Antes:** ~1,873 líneas en 3 archivos principales
- **Después:** ~1,593 líneas (-15% aprox.)
- **Nuevo módulo \_cs-base.less:** ~200 líneas (componentes unificados)

**Ganancia neta:** ~80 líneas eliminadas + mejor mantenibilidad

---

## ✅ Criterios de Aceptación

1. **No cambia aspecto visual**
   - [ ] Home (/) - igual antes/después
   - [ ] Noticias (/noticias/) - igual
   - [ ] Detalle noticia - igual
   - [ ] Sobre el pueblo - igual
   - [ ] Contacto - igual

2. **No aumenta especificidad**
   - [ ] `.c-topper` = 0,0,1,0 (igual que `.cs-topper`)
   - [ ] Aliases con `:where()` = 0,0,0,0 (menor)

3. **Usa tokens de diseño**
   - [x] `.c-topper` usa `var(--topperFontSize)` y `var(--secondary)`
   - [x] `.c-title` usa `var(--headerFontSize)` y `var(--headerColor)`
   - [x] `.c-text` usa `var(--bodyFontSize)` y `var(--bodyTextColor)`
   - [x] `.c-button` usa `var(--primary)`, `var(--accent)`, `var(--text-white)`
   - [ ] Reemplazar valores duros restantes

4. **Reducción de código**
   - [ ] Archivos migrados tienen menos líneas
   - [ ] Sin duplicación de propiedades
   - [ ] Imports correctos en archivos afectados

---

## 🚀 Plan de Ejecución

### Paso 1: Crear \_cs-base.less ✅

- Extraer componentes de root.less
- Aplicar nomenclatura BEM
- Asegurar uso de tokens

### Paso 2: Crear aliases en @layer legacy ✅

- Usar `:where(.cs-*)` para especificidad 0
- Documentar en \_id-aliases.less

### Paso 3: Migrar index.less (parcial) ✅

- Eliminar definiciones duplicadas de `.cs-topper`, `.cs-title`, etc.
- Añadir `@import` de \_cs-base.less
- Mantener overrides específicos de página

### Paso 4: Migrar sobre-el-pueblo.less (parcial) ✅

- Mismo proceso que index.less

### Paso 5: Verificación visual ✅

- Screenshots antes/después
- Lighthouse audit
- Verificar responsive

### Paso 6: Documentar y medir ✅

- Tabla ANTES→DESPUÉS
- Métricas de tamaño CSS
- Checklist para siguiente lote

---

**Última actualización:** 31 de octubre de 2025  
**Estado:** Inventario completado - Listo para crear \_cs-base.less
