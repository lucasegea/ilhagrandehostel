# Architecture note — Editor CMS (Atlas)

Sistema para que el cliente edite/agregue/quite contenido y fotos de su landing, sin que el desarrollador sea el cuello de botella. Reusable como template entre clientes. Gratis para siempre, hosteado en Vercel.

Decidido en conversacion con el usuario: Puck + git-as-DB + Auth.js. Esta nota fija las decisiones binding. Cualquier codigo que las contradiga esta mal, no la decision.

## Principio rector: contenido desacoplado del diseno

El usuario aun no eligio cual de las 3 propuestas de diseno queda. El sistema se construye HOY sin esa decision porque el contenido y el diseno viven en capas separadas.

- **Contenido** = un JSON de pagina: lista ordenada de bloques tipados. Estable, agnostico al diseno.
- **Diseno** = un tema: un set de componentes React que implementan el mismo contrato de bloques + tokens (colores/fuentes). Elegir una propuesta = elegir un tema.

Cambiar de diseno = cambiar los componentes de render. El JSON de contenido, el editor, la persistencia y la auth NO cambian.

## Decisiones (binding)

- **D-101 Modelo de contenido basado en bloques.** Una pagina es `{ root, content: [ { type, props } ] }` (formato Puck). Los TIPOS de bloque y el ESQUEMA de props de cada uno son el contrato estable. Ej: `hero` = `{ eyebrow, titulo, subtitulo, imagem, ctas[] }`; `vozes` = `{ titulo, items: [{ texto, autor, cidade, nota, origem }] }`. El contrato cubre todas las secciones de las 3 propuestas (hero, sobre, vozes, quartos, comodidades, experiencias, calytour-destacada, calytour-tira, galeria, localizacao, reservar, footer).

- **D-102 Diseno = tema intercambiable.** Cada propuesta (1/2/3 y futuras) es un tema: componentes que reciben las props del bloque y un set de tokens. La eleccion de tema es una env var (`THEME=conceito-2`). El mismo `page.json` renderiza con cualquier tema. Implementar un tema concreto es trabajo posterior (cuando el usuario elija), fuera de este plan.

- **D-103 Puck como editor, dentro de la app.** `@measured/puck` es un paquete npm, no un servicio. Vive en `/admin` de la MISMA app Next en Vercel. La pagina publica usa el `<Render>` de Puck (o un render propio) sobre la misma config. Sin hosting aparte, sin cuenta de Puck, sin SaaS con tope.

- **D-104 Persistencia git-as-DB.** El `page.json` vive en el repo (`content/<site>/page.json`). Publicar = una route serverless `/api/publish` commitea el JSON via GitHub API (Octokit) con un PAT fine-grained en env var. El commit dispara redeploy de Vercel y queda live en ~30-60s. Versionado y revertible por git, sin base de datos. Alternativa DB-backed (publish instantaneo) considerada y DIFERIDA detras de la misma interfaz de persistencia (`loadPage()/savePage()`), para poder cambiar el backend despues sin tocar bloques. Rechazada en v1 porque reintroduce el problema de suspension/costo y las ediciones de una landing son poco frecuentes.

- **D-105 Auth con Auth.js (NextAuth) + allowlist de emails.** `/admin` y `/api/publish` protegidos. Login OAuth (Google por defecto). Un allowlist de emails en env var (`EDITOR_EMAILS`) define quien es editor. Sesion JWT, sin base de datos. Sin tope de usuarios: lo define el allowlist.

- **D-106 Imagenes via Vercel Blob (free tier).** El campo imagen de Puck sube a un handler `/api/upload` que guarda en Vercel Blob y devuelve la URL, persistida en el JSON. Evita el bloat del repo y el techo de 100MB de un CMS hosteado. Cloudinary como alternativa intercambiable. Imagenes chicas/estaticas pueden commitearse al repo.

- **D-107 Template multi-cliente.** Todo el sistema es un repo template. Por cliente: clonar, setear env (repo destino del contenido, `THEME`, `EDITOR_EMAILS`, token de Blob, PAT de git) y deploy a Vercel. Sin tier SaaS por cliente. Difieren el `page.json`, el tema y las env; el codigo es compartido.

## Stack

Next.js (App Router) en Vercel. `@measured/puck`. `next-auth` (Auth.js). `@octokit/rest` para el commit. `@vercel/blob` para imagenes. Sin base de datos en v1.

Por que Next y no Astro: Puck es React-first, Auth.js y las routes serverless de publish/upload son nativas de Next/Vercel. Astro exigiria islands React + mas pegamento para el editor. Los 3 mockups actuales son HTML estatico y se reimplementan como componentes React por tema: son la referencia visual, no el codigo final.

## Alcance del add/remove de secciones

El usuario dijo "luego vemos lo de sumar o quitar secciones". Puck da agregar/quitar/reordenar INSTANCIAS de los tipos de bloque existentes de fabrica (casi no se puede no tenerlo). Eso entra en v1. Lo que NO entra: inventar TIPOS de bloque nuevos en runtime (eso pide que un dev agregue componente + esquema). El cliente reordena, agrega y borra secciones de los tipos ya definidos; crear un tipo nuevo es trabajo de dev.
