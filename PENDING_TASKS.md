# Tareas pendientes — Web municipal Ayuntamiento de Belmontejo

## Cumplido

- Privacidad: página informativa creada en `src/pages/politica-de-privacidad.astro` con responsable, finalidades, legitimación, cesiones, derechos y canal de reclamaciones actualizado en noviembre de 2025.
- Cookies: banner de consentimiento granular y carga de GA/Sentry solo con consentimiento; IP anonimizada en GA. Página específica existente: `src/pages/politica-de-cookies.astro`.
- SEO: `@astrojs/sitemap` activo y `robots.txt` bloquea `/admin`; Open Graph y `canonical` en el layout.
- Sede electrónica: enlace en footer data (`src/data/footerServices.json`).
- CMS: Decap CMS con OAuth y menú condicionado por `PUBLIC_ADMIN_MENU`. Robots bloquea `/admin`.

## Pendiente/importante (Administración pública en España)

- Aviso Legal: no hay página. Necesaria por LSSI-CE (titular, CIF, contacto, condiciones de uso, propiedad intelectual, responsabilidades).
- Validar el CIF indicado (actualmente `P1603400A`) en la nueva política de privacidad y actualizarlo según la documentación oficial del Ayuntamiento.
- Revisión jurídica: el Ayuntamiento/asesoría legal (o IA supervisada) debe revisar con calma el texto completo de la Política de Privacidad para asegurar que cubre todos los tratamientos y obligaciones reales.
- Declaración de Accesibilidad: no hay página ni enlace en footer. Requerida por RD 1112/2018 (estado de conformidad, contenidos no accesibles, procedimiento de comunicación/quejas y reclamación, fecha última revisión).
- Enlaces “transparencia y contratación”: añadir en el footer links visibles a:
  - Portal de Transparencia (propio o autonómico).
  - Perfil del contratante (Plataforma de Contratación del Sector Público).
  - Buzón de quejas y sugerencias / Procedimiento de accesibilidad (si no se gestiona en Sede).
- Contacto y formularios:
  - El formulario en `src/pages/contacto.astro` no tiene backend ni consentimiento explícito. Añadir:
    - Casilla obligatoria de aceptación con enlace a la privacidad.
    - Protección antispam (hCaptcha/Turnstile) y validación server-side.
    - Envío vía API (email o proveedor con contrato de encargo).
    - Cláusula informativa corta bajo el botón (responsable, finalidad, derechos).
- Seguridad: cabeceras HTTP de seguridad no configuradas (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP/COEP). En Vercel se pueden aplicar vía middleware de Astro o `vercel.json` (headers).
- Sitemap/robots: `public/robots.txt:37` contiene dominio fijo de Vercel. Mantenerlo sincronizado con el dominio final o generarlo dinámicamente.
- Accesibilidad práctica:
  - Asegurar foco y trampa de foco en el modal de cookies; revisar contraste y orden de tabulación.
  - PDF/Documentos: si se publican documentos, establecer pautas para PDFs accesibles (etiquetados, texto seleccionable, contraste, estructura).
- Datos estructurados: validar los nuevos `GovernmentOrganization` y `NewsArticle` con la Rich Results Test y ajustar `client.domain`/`astro.config.mjs` cuando se confirme el dominio final para que las URLs del schema sean definitivas.

## Bug detectado

- Canonical/OG con dominio duplicado. En `src/layouts/BaseLayout.astro` se usa `https://${client.domain}`, pero `src/data/client.json` ya trae `https://` y `/`. Resultado: URL mal formada.
  - Ajustes sugeridos:
    - O bien cambiar `client.domain` a solo host sin protocolo ni slash (por ejemplo, `ayuntamiento-de-belmontejo.vercel.app`) en `src/data/client.json:1`.
    - O bien en `BaseLayout` usar directamente `client.domain` sin prefijar `https://` en:
      - `src/layouts/BaseLayout.astro:35` (`<link rel="canonical" ...>`)
      - `src/layouts/BaseLayout.astro:49` (`og:url`)

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
