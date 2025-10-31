# 📚 Índice de Documentación - Sistema de Tokens ITCSS

> Navega rápidamente a la documentación que necesitas

---

## 🚀 Por Dónde Empezar

### Si eres nuevo en el proyecto:

1. **[TOKENS_SUMMARY.md](./TOKENS_SUMMARY.md)** - Resumen ejecutivo de 5 minutos
2. **[TOKENS_README.md](./TOKENS_README.md)** - Guía rápida de uso diario

### Si vas a desarrollar/migrar código:

1. **[TOKENS_README.md](./TOKENS_README.md)** - Referencia rápida de tokens
2. **[MIGRATION_EXAMPLES.less](./src/styles/MIGRATION_EXAMPLES.less)** - Ejemplos de código
3. **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Guía paso a paso

### Si necesitas entender la arquitectura:

1. **[ARCHITECTURE_EXPLAINED.md](./ARCHITECTURE_EXPLAINED.md)** - Explicación técnica completa

---

## 📄 Documentos Disponibles

| Documento                                                           | Descripción                             | Cuándo Usarlo                        |
| ------------------------------------------------------------------- | --------------------------------------- | ------------------------------------ |
| **[README.md](./README.md)**                                        | Documentación general del proyecto      | Información del proyecto completo    |
| **[INDEX.md](./INDEX.md)**                                          | Índice maestro de documentación         | Navegación y búsqueda de docs        |
| **[TOKENS_SUMMARY.md](./TOKENS_SUMMARY.md)**                        | Resumen ejecutivo del sistema de tokens | Vista rápida, overview para managers |
| **[TOKENS_README.md](./TOKENS_README.md)**                          | Guía rápida y referencia de tokens      | Uso diario, consulta de tokens       |
| **[BREAKPOINTS_GUIDE.md](./BREAKPOINTS_GUIDE.md)**                  | Guía de mixins de breakpoints           | Uso de media queries con mixins      |
| **[ID_MIGRATION_GUIDE.md](./ID_MIGRATION_GUIDE.md)**                | 🆕 Migración de selectores ID a clases  | Reducir especificidad CSS            |
| **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)**                      | Guía detallada de migración de tokens   | Al migrar componentes legacy         |
| **[ARCHITECTURE_EXPLAINED.md](./ARCHITECTURE_EXPLAINED.md)**        | Explicación técnica profunda            | Entender funcionamiento interno      |
| **[MIGRATION_EXAMPLES.less](./src/styles/MIGRATION_EXAMPLES.less)** | Ejemplos prácticos de código            | Referencia de patrones de código     |
| **[\_tokens.less](./src/styles/settings/_tokens.less)**             | Archivo fuente de tokens                | Ver/editar tokens disponibles        |
| **[\_breakpoints.less](./src/styles/tools/_breakpoints.less)**      | Mixins de breakpoints                   | Código fuente de mixins              |

---

## 🎯 Guías por Caso de Uso

### "Quiero crear un componente nuevo"

→ **[TOKENS_README.md](./TOKENS_README.md)** - Sección "Uso Rápido"  
→ **[MIGRATION_EXAMPLES.less](./src/styles/MIGRATION_EXAMPLES.less)** - Ejemplo "Card Component"

### "Quiero migrar un componente existente"

→ **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Sección "Estrategia de Migración"  
→ **[MIGRATION_EXAMPLES.less](./src/styles/MIGRATION_EXAMPLES.less)** - Comparación "Antes vs Después"

### "¿Qué tokens están disponibles?"

→ **[TOKENS_README.md](./TOKENS_README.md)** - Sección "Tokens Disponibles"  
→ **[\_tokens.less](./src/styles/settings/_tokens.less)** - Código fuente completo

### "¿Cómo funciona el modo oscuro?"

→ **[ARCHITECTURE_EXPLAINED.md](./ARCHITECTURE_EXPLAINED.md)** - Sección "Modo Oscuro"  
→ **[\_tokens.less](./src/styles/settings/_tokens.less)** - Ver `body.dark-mode`

### "¿Por qué usar var(--token, @token)?"

→ **[ARCHITECTURE_EXPLAINED.md](./ARCHITECTURE_EXPLAINED.md)** - Sección "LESS vs CSS Custom Properties"  
→ **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Sección "Uso de Tokens"

### "¿Cómo se organizan las capas CSS?"

→ **[ARCHITECTURE_EXPLAINED.md](./ARCHITECTURE_EXPLAINED.md)** - Sección "Arquitectura del Sistema"  
→ **[TOKENS_SUMMARY.md](./TOKENS_SUMMARY.md)** - Diagrama visual

### "¿Qué convención de nombres usar?"

→ **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Sección "Convención de Nombres"  
→ **[TOKENS_README.md](./TOKENS_README.md)** - Tabla de categorías

### "¿Cómo usar breakpoints responsivos?" 🆕

→ **[BREAKPOINTS_GUIDE.md](./BREAKPOINTS_GUIDE.md)** - Guía completa de mixins  
→ **[\_breakpoints.less](./src/styles/tools/_breakpoints.less)** - Código fuente

### "¿Cómo migrar @media queries a mixins?" 🆕

→ **[BREAKPOINTS_GUIDE.md](./BREAKPOINTS_GUIDE.md)** - Sección "Migración desde @media"  
→ **[examples/header-migrated.less](./src/styles/examples/header-migrated.less)** - Ejemplo práctico

### "¿Cómo reducir especificidad CSS (IDs → clases)?" 🆕

→ **[ID_MIGRATION_GUIDE.md](./ID_MIGRATION_GUIDE.md)** - Guía completa de migración  
→ **[src/styles/components/](./src/styles/components/)** - Componentes migrados  
→ **[src/styles/legacy/\_id-aliases.less](./src/styles/legacy/_id-aliases.less)** - Aliases temporales

---

## 🗂️ Estructura de Archivos

```
ayuntamiento-de-belmontejo/
│
├── 📄 README.md                     ← Documentación general del proyecto
├── 📄 INDEX.md                      ← Este archivo (índice de docs)
│
├── 📘 TOKENS_README.md              ← Guía rápida (EMPEZAR AQUÍ)
├── 📙 TOKENS_SUMMARY.md             ← Resumen ejecutivo
├── 📗 MIGRATION_GUIDE.md            ← Guía detallada de migración
├── 📕 ARCHITECTURE_EXPLAINED.md     ← Explicación técnica profunda
│
└── src/styles/
    ├── 📄 main.less                 ← Punto de entrada
    ├── 📄 MIGRATION_EXAMPLES.less   ← Ejemplos de código
    │
    ├── settings/
    │   ├── index.less
    │   └── ⭐ _tokens.less          ← Sistema de tokens (código fuente)
    │
    ├── tools/
    ├── generic/
    ├── elements/
    ├── objects/
    ├── components/
    ├── utilities/
    │
    └── legacy/
        └── legacy.less              ← CSS actual protegido
```

---

## 🔍 Búsqueda Rápida de Información

### Tokens y Variables

| Busco                    | Documento          | Sección                 |
| ------------------------ | ------------------ | ----------------------- |
| Lista completa de tokens | TOKENS_README.md   | "Tokens Disponibles"    |
| Código fuente de tokens  | \_tokens.less      | Todo el archivo         |
| Cómo usar tokens         | TOKENS_README.md   | "Uso Rápido"            |
| Variables legacy         | TOKENS_README.md   | "Variables Legacy"      |
| Convención de nombres    | MIGRATION_GUIDE.md | "Convención de Nombres" |

### Arquitectura y Funcionamiento

| Busco                | Documento                 | Sección                  |
| -------------------- | ------------------------- | ------------------------ |
| Cómo funciona @layer | ARCHITECTURE_EXPLAINED.md | "CSS Cascade Layers"     |
| Orden de carga       | ARCHITECTURE_EXPLAINED.md | "Flujo de Carga"         |
| Especificidad CSS    | ARCHITECTURE_EXPLAINED.md | "Orden de Especificidad" |
| Modo oscuro técnico  | ARCHITECTURE_EXPLAINED.md | "Modo Oscuro - Mecánica" |
| Performance          | ARCHITECTURE_EXPLAINED.md | "Performance"            |

### Migración

| Busco              | Documento               | Sección                     |
| ------------------ | ----------------------- | --------------------------- |
| Pasos de migración | MIGRATION_GUIDE.md      | "Estrategia de Migración"   |
| Ejemplos de código | MIGRATION_EXAMPLES.less | Todo el archivo             |
| Checklist          | MIGRATION_GUIDE.md      | "Checklist de Migración"    |
| Antes vs Después   | MIGRATION_EXAMPLES.less | Comparaciones               |
| Compatibilidad     | MIGRATION_GUIDE.md      | "Compatibilidad con Legacy" |

### Guías Prácticas

| Busco                  | Documento               | Sección                   |
| ---------------------- | ----------------------- | ------------------------- |
| Crear componente nuevo | TOKENS_README.md        | "Ejemplos Comunes"        |
| Usar breakpoints       | TOKENS_README.md        | "Ejemplos Comunes - Grid" |
| Hacer botón            | MIGRATION_EXAMPLES.less | "Button Component"        |
| Hacer card             | MIGRATION_EXAMPLES.less | "Card Component"          |
| Utilities              | MIGRATION_EXAMPLES.less | "Utilidades con Tokens"   |

---

## 📖 Glosario de Términos

| Término            | Significado                                                  | Más Info                  |
| ------------------ | ------------------------------------------------------------ | ------------------------- |
| **ITCSS**          | Inverted Triangle CSS - Metodología de organización CSS      | ARCHITECTURE_EXPLAINED.md |
| **@layer**         | CSS Cascade Layers - Control de especificidad CSS            | ARCHITECTURE_EXPLAINED.md |
| **Token**          | Variable de diseño reutilizable                              | TOKENS_README.md          |
| **LESS var**       | Variable LESS (@variable) compilada en build                 | ARCHITECTURE_EXPLAINED.md |
| **CSS var**        | CSS Custom Property (--variable) dinámica en runtime         | ARCHITECTURE_EXPLAINED.md |
| **Fallback**       | Valor alternativo si falla el primero                        | MIGRATION_GUIDE.md        |
| **Legacy**         | Código CSS actual antes de tokens                            | ARCHITECTURE_EXPLAINED.md |
| **Semantic token** | Token con nombre semántico (--color-primary vs --color-blue) | MIGRATION_GUIDE.md        |

---

## ⚡ Comandos Rápidos

```bash
# Ver estructura del proyecto
tree -L 2 src/styles/

# Buscar uso de tokens
grep -r "var(--color-" src/

# Buscar variables LESS
grep -r "@color-" src/

# Buscar imports
find src/styles -name "*.less" | xargs grep "@import"

# Contar tokens definidos
grep -c "^@[a-z]" src/styles/settings/_tokens.less

# Verificar build
npm run build

# Desarrollo
npm run dev
```

---

## 🆘 Ayuda y Soporte

### Problemas Comunes

1. **"El token no funciona"**  
   → Ver ARCHITECTURE_EXPLAINED.md - "Debugging y Troubleshooting"

2. **"No sé qué token usar"**  
   → Ver TOKENS_README.md - "Tokens Disponibles"  
   → Consultar \_tokens.less

3. **"El CSS legacy se sobrescribe"**  
   → Ver ARCHITECTURE_EXPLAINED.md - "Orden de Especificidad"

4. **"Variables LESS no disponibles"**  
   → Asegúrate de importar: `@import '../settings/_tokens.less'`

5. **"Build falla"**  
   → Verifica sintaxis LESS  
   → Revisa imports circulares

---

## 📞 Contacto

Para dudas o sugerencias sobre el sistema de tokens:

1. Revisa primero la documentación correspondiente
2. Consulta los ejemplos en MIGRATION_EXAMPLES.less
3. Pregunta en el canal de desarrollo del equipo

---

## 📝 Mantenimiento de Documentación

### Al Añadir un Nuevo Token

- [ ] Añadir a `_tokens.less`
- [ ] Documentar en comentario
- [ ] Actualizar TOKENS_README.md si es una nueva categoría
- [ ] Añadir ejemplo en MIGRATION_EXAMPLES.less si es relevante

### Al Crear Nueva Documentación

- [ ] Añadir a este índice
- [ ] Actualizar sección correspondiente
- [ ] Añadir enlaces cruzados
- [ ] Actualizar tabla de contenidos

---

**Última actualización**: 31 de octubre de 2025  
**Versión**: 1.0.0  
**Mantenido por**: Equipo de Arquitectura CSS
