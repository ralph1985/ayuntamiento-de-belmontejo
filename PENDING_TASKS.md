# Tareas pendientes — Web municipal Ayuntamiento de Belmontejo

## Cumplido

- Privacidad: página informativa creada en `src/pages/politica-de-privacidad.astro` con responsable, finalidades, legitimación, cesiones, derechos y canal de reclamaciones actualizado en noviembre de 2025.
- Cookies: banner de consentimiento granular y carga de GA/Sentry solo con consentimiento; IP anonimizada en GA. Página específica existente: `src/pages/politica-de-cookies.astro`.
- SEO: `@astrojs/sitemap` activo y `robots.txt` bloquea `/admin`; Open Graph y `canonical` en el layout.
- Sede electrónica: enlace en footer data (`src/data/footerServices.json`).
- CMS: Decap CMS con OAuth y menú condicionado por `PUBLIC_ADMIN_MENU`. Robots bloquea `/admin`.
- Contacto: formulario en `src/pages/contacto.astro` con backend `/api/contacto.json`, reCAPTCHA + Resend, validación server-side y casilla obligatoria de aceptación con cláusula informativa visible bajo el botón.

## Pendiente (organizado por tipo e importancia)

### Legal y cumplimiento institucional

- **Alta** Aviso Legal: página base creada en `src/pages/aviso-legal.astro`, pero quedan por completar/validar los datos oficiales (titular, CIF definitivo, datos registrales/DIR3, horario, sede electrónica, DPD y fecha de última actualización). Revisar con la documentación municipal antes de publicar.
- **Alta** Validar el CIF indicado (actualmente `P1603400A`) en la nueva política de privacidad y actualizarlo según la documentación oficial del Ayuntamiento.
- **Alta** Revisión jurídica: el Ayuntamiento/asesoría legal (o IA supervisada) debe revisar con calma el texto completo de la Política de Privacidad para asegurar que cubre todos los tratamientos y obligaciones reales.
- **Alta** Enlaces “transparencia y contratación”: añadir en el footer links visibles al Portal de Transparencia (propio o autonómico), al Perfil del contratante (Plataforma de Contratación del Sector Público) y a un buzón de quejas/sugerencias o procedimiento de accesibilidad.

### Accesibilidad y experiencia de usuario

- **Alta** Declaración de Accesibilidad: no hay página ni enlace en footer. Requerida por RD 1112/2018 (estado de conformidad, contenidos no accesibles, procedimiento de comunicación/quejas y reclamación, fecha última revisión).
- **Alta** Accesibilidad práctica: asegurar foco y trampa de foco en el modal de cookies; revisar contraste y orden de tabulación; establecer pautas para PDFs accesibles (etiquetados, texto seleccionable, contraste, estructura).
- **Media** Redes sociales: los enlaces de Facebook e Instagram no se abren en Chrome iOS (posible bloqueo por esquema `intent://` o `target="_blank"`). Reproducir el bug en un dispositivo real, revisar atributos `rel` y usar URLs HTTPS limpias que funcionen en WebView móviles.

### Atención ciudadana y formularios

- **Media** Remitente Resend: dar de alta un remitente oficial con dominio `@belmontejo.es` en Resend y actualizar `contact.formSender` desde Decap CMS para dejar de usar `onboarding@resend.dev`.
- **Media** Antiabuso del formulario de contacto: añadir medidas específicas de captcha, rate limiting y logging básico para detectar automatización y abuso incluso tras añadir el backend.

### Seguridad y operaciones

- **Alta** Seguridad: cabeceras HTTP (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP/COEP) no configuradas. En Vercel se pueden aplicar vía middleware de Astro o `vercel.json` (headers).

### SEO y analítica

- **Alta** Sitemap/robots: `public/robots.txt:37` contiene dominio fijo de Vercel. Mantenerlo sincronizado con el dominio final o generarlo dinámicamente.
- **Media** Datos estructurados: validar los nuevos `GovernmentOrganization` y `NewsArticle` con la Rich Results Test y ajustar `client.domain`/`astro.config.mjs` cuando se confirme el dominio final para que las URLs del schema sean definitivas.
- **Media** Google Analytics: cuando tengamos el dominio definitivo hay que migrar la propiedad de GA (ajustar `measurementId`, dominios de referencia y filtros de tráfico interno) y revisar consentimiento/carga diferida para que los datos históricos no queden fragmentados.
- **Media** SEO avanzado: además del sitemap, revisar Core Web Vitals, etiquetar imágenes con `alt`, añadir `lang`, ajustar títulos/meta por sección y evaluar datos estructurados adicionales (`BreadcrumbList`, `FAQ`). Preparar checklist antes del lanzamiento del dominio final.

### QA y mantenimiento técnico

- **Alta** Tests unitarios: ampliar la cobertura de componentes críticos (cards de bandos, layout, formularios) con Vitest y testing-library para asegurar estados de carga, errores y accesibilidad básica.
- **Alta** Tests de integración: definir una suite que cubra flujos completos (p. ej., creación/edición de bandos vía CMS mock + render en frontend) y servicios como `fetch-bandos.js`, de modo que validemos la integración entre scripts, contenido y UI más allá de los e2e visuales.
- **Alta** Revisar tipados TypeScript: auditar componentes, scripts y configuración para asegurar tipados estrictos (comprobar/activar `strict` en `tsconfig`, añadir tipos en layouts, scripts y endpoints y documentar las convenciones en el repo).
- **Media** Dependencias npm: crear una rutina trimestral para revisar qué paquetes pueden actualizarse (todas las versiones están fijadas). Documentar en `PENDING_TASKS.md` o un changelog interno qué versión tenía cada paquete y cuál se sube, y apoyarse en Codex/Dependabot para automatizar PRs.

## Bug detectado

- Canonical/OG con dominio duplicado. En `src/layouts/BaseLayout.astro` se usaba `https://${client.domain}`, pero el archivo de datos incluía el protocolo y la barra final. Resultado: URL mal formada.
  - **Actualización:** la configuración vive ahora en `src/data/contact-info.json` y el layout utiliza directamente `contactInfo.entity.domain`, por lo que el problema queda resuelto.

## Sugerencias adicionales

- Añadir en el footer enlaces directos a: Aviso Legal, Privacidad, Accesibilidad, Transparencia, Perfil del Contratante, Gestión de cookies.
- Incluir `/.well-known/security.txt` con contacto de seguridad.
- Considerar Matomo/on‑prem para analítica si se prefiere evitar GA.

---

### Propuesta de siguientes pasos (accionables)

1. Crear páginas legales: `src/pages/aviso-legal.astro`, `src/pages/politica-de-privacidad.astro`, `src/pages/accesibilidad.astro` con contenido base conforme a normativa.
2. Corregir el bug del dominio en `BaseLayout`/`client.json` (ver sección “Bug detectado”).
3. Actualizar `src/components/layout/Footer.astro` para incluir enlaces a Aviso Legal, Privacidad, Accesibilidad, Transparencia, Perfil del contratante y “Gestionar cookies”.
4. Añadir API para formulario de contacto con consentimiento, antispam y almacenamiento/entrega (email). Añadir casilla de aceptación y cláusula informativa.
5. Añadir cabeceras de seguridad vía middleware de Astro o `vercel.json`.
6. Revisar `robots.txt`/sitemap para que reflejen el dominio final.
7. Incorporar JSON‑LD para organización y artículos.
