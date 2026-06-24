# Scope — Editor CMS para la landing

## In scope

- Modelo de contenido basado en bloques, agnostico al diseno (contrato de bloques + `page.json` semilla del hostel).
- Renderer publico que pinta el `page.json` a traves de un tema enchufable, con prueba del swap de tema (tema real minimo + tema stub).
- Editor en `/admin` con Puck: editar campos, agregar, borrar y reordenar instancias de los bloques existentes, con preview en vivo.
- Persistencia git-as-DB: publish commitea el `page.json`; redeploy de Vercel lo pone live.
- Auth con Auth.js + allowlist de emails sobre `/admin` y `/api/publish`.
- Subida de imagenes a Vercel Blob, persistida en el JSON y renderizada en publico.
- Template-izacion: env-driven, `.env.example` + README para clonar por cliente.

## Out of scope

- Implementacion del tema visual definitivo de la propuesta elegida (1, 2 o 3). Depende de una decision que el usuario aun no tomo; se hace como follow-on una vez elegida, con el mockup como referencia.
- Inventar TIPOS de bloque nuevos en runtime (pide componente + esquema nuevos: trabajo de dev, no del cliente).
- Persistencia DB-backed con publish instantaneo (sin rebuild). Diferida detras de la interfaz `loadPage()/savePage()`; se puede sumar despues sin tocar bloques.
- Edicion colaborativa concurrente / resolucion de conflictos mas alla de "ultimo commit gana" (limite asumido de git-as-DB).
- Motor de reservas real, disponibilidad, pagos.
- i18n / edicion multi-idioma del contenido (solo PT-BR).
- SEO tecnico avanzado, analytics, A/B testing.
- Workflow de borradores/aprobacion (branch + PR). Default v1 = commit directo a la rama de contenido que autodeploya.

Out of scope declarado explicitamente. No vacio.

## Open seams (con default)

- **Persistencia: git-as-DB vs DB.** Default: git-as-DB. Razon: gratis, sin suspension, ediciones poco frecuentes. La interfaz `loadPage/savePage` deja la puerta abierta a DB despues.
- **Framework: Next vs Astro.** Default: Next.js (App Router). Razon: Puck, Auth.js y las routes de publish/upload son nativas de Next/Vercel; Astro pediria mas pegamento.
- **Proveedor OAuth: Google vs GitHub.** Default: Google. Razon: el cliente del hostel tiene Gmail; GitHub es de dev. Allowlist por email igual en ambos.
- **Imagenes: Vercel Blob vs Cloudinary vs repo.** Default: Vercel Blob. Razon: free tier, nativo de Vercel, sin techo de 100MB ni bloat del repo.
- **Modelo de publish: commit directo vs branch+PR.** Default: commit directo a la rama de contenido. Razon: lo mas simple; revert por git si hace falta.
- **Donde vive el contenido: mismo repo del sitio vs repo de contenido aparte.** Default: mismo repo, carpeta `content/`. Razon: un solo deploy, menos piezas. Repo aparte queda como opcion si un cliente lo pide.
- **Tema en v1: cual de las 3 propuestas se implementa primero como tema real.** Default: ninguno definitivo; un tema real minimo (suficiente para AC2.1) + un stub para probar el swap. Razon: el plan es agnostico al diseno; el tema definitivo es follow-on.

## Surface cap / Phase 3 (mockup)

Phase 3 (mockup HTML) SE SALTEA. Razon: la UI del editor es la de Puck (componente de terceros, no una superficie que disenamos), y el aspecto visual de la pagina publica ya esta cubierto por los 3 mockups de diseno en `proposals/`. La validacion de este sistema es un POC funcional via `/develop`, no un mockup estatico. Varios AC son de credencial/deploy reales y van marcados `(operator handoff at Phase 3)` para que se verifiquen a mano, no en headless.

## Deferred to next run

- Tema visual definitivo de la propuesta elegida.
- Persistencia DB-backed opcional.
- Workflow de borradores (branch + PR + preview deploy).
