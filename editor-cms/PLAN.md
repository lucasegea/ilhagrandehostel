# Plan — Editor CMS para la landing (Puck + git-as-DB + Auth.js)

Goal: que el cliente edite, agregue, quite y reordene el contenido y las fotos de su landing desde `/admin`, sin tocar codigo y sin depender del desarrollador, con un sistema reusable como template entre clientes, gratis y hosteado en Vercel. El sistema es agnostico al diseno: el contenido vive separado del tema, asi se construye antes de elegir cual de las 3 propuestas queda.

Arquitectura y decisiones binding: ver `ARCHITECTURE.md` (D-101 a D-107). Alcance y seams: ver `SCOPE.md`.

Stack: Next.js (App Router) en Vercel, `@measured/puck`, `next-auth`, `@octokit/rest`, `@vercel/blob`. Sin base de datos en v1.

## Milestones y acceptance criteria

Cada AC nombra superficie + disparador + un observable verificable solo.

### M1 — Contrato de bloques + modelo de contenido (agnostico al diseno)
Resultado: existe el contrato de bloques que cubre las 3 propuestas y un `page.json` semilla del hostel.
- AC1.1 — Existe `lib/blocks.ts` que define los tipos de bloque y el esquema de props de cada uno: hero, sobre, vozes, quartos, comodidades, experiencias, calytour-destacada, calytour-tira, galeria, localizacao, reservar, footer. Verificable: cada seccion presente en las 3 propuestas tiene un tipo de bloque con sus campos.
- AC1.2 — Existe `content/ilhagrande/page.json` valido contra el contrato, con el contenido real del hostel (quartos, vozes, Calytour, WhatsApp +55 24 98156-6842). Verificable: un script `npm run validate:content` corre y sale 0; si se rompe un campo requerido, sale distinto de 0.

### M2 — Renderer publico (tema enchufable)
Resultado: la ruta publica renderiza el `page.json` a traves de un tema, y cambiar el tema cambia el look sin tocar el contenido.
- AC2.1 — Cargar `/` renderiza todos los bloques de `page.json` sin error de consola, usando los componentes del tema activo (`THEME` env). Verificable: abrir `/` muestra hero..footer; consola sin errores.
- AC2.2 — Cambiar la env `THEME` (a un segundo tema stub) cambia el render de al menos un bloque sin editar `page.json`. Verificable: con `THEME=stub` el hero usa el componente stub; el JSON no cambio. (Demuestra el desacople diseno/contenido.)

Nota: en v1 alcanza con UN tema real minimo + un tema stub para probar el swap. Implementar el tema definitivo de la propuesta elegida es trabajo posterior (fuera de este plan).

### M3 — Editor en /admin (Puck)
Resultado: en `/admin` se puede editar campos, y agregar, borrar y reordenar bloques con preview en vivo.
- AC3.1 — En `/admin`, editar un campo de un bloque (ej. titulo del hero) actualiza el preview al instante sin recargar. Verificable: tipear en el campo cambia el texto del preview.
- AC3.2 — En `/admin`, agregar un bloque desde el panel, borrarlo y reordenar dos bloques por drag refleja el cambio en el preview. Verificable: el orden/numero de bloques del preview cambia segun la accion.

### M4 — Persistencia git-as-DB
Resultado: publicar desde `/admin` commitea el `page.json` y el cambio aparece en la pagina publica tras redeploy.
- AC4.1 — Hacer un cambio en `/admin` y apretar "Publicar" llama a `/api/publish`, que crea un commit en el repo de contenido con el `page.json` nuevo. Verificable: aparece un commit nuevo con el diff del JSON.
- AC4.2 — Tras el redeploy de Vercel disparado por ese commit, `/` muestra el cambio. Verificable: el texto editado aparece en la pagina publica. (operator handoff at Phase 3: requiere observar el deploy real en Vercel.)

### M5 — Auth (Auth.js + allowlist)
Resultado: solo un email del allowlist accede al editor y al publish.
- AC5.1 — Visitar `/admin` sin sesion redirige al login. Verificable: sin cookie de sesion, no se ve el editor.
- AC5.2 — Un email fuera de `EDITOR_EMAILS` que completa el OAuth es rechazado del editor y `/api/publish` le responde 403. Verificable: login con email no-allowlisted no entra; el POST a publish da 403.
- AC5.3 — Un email del allowlist entra al editor y puede publicar. Verificable: login allowlisted ve `/admin` y su publish da 200. (operator handoff at Phase 3: requiere completar OAuth real.)

### M6 — Imagenes (Vercel Blob)
Resultado: subir una imagen en el editor la guarda, la persiste en el JSON y la renderiza en la pagina publica.
- AC6.1 — En `/admin`, el campo imagen de un bloque permite subir un archivo; `/api/upload` lo guarda en Vercel Blob y devuelve una URL que queda en el `page.json`. Verificable: tras subir, el campo muestra la URL de Blob.
- AC6.2 — Tras publicar, `/` renderiza la imagen subida desde la URL de Blob. Verificable: la imagen nueva aparece en la pagina publica. (operator handoff at Phase 3.)

### M7 — Template-izar para reuso
Resultado: un segundo cliente se levanta clonando + env, sin editar codigo.
- AC7.1 — Existe `.env.example` con todas las variables (repo de contenido, `THEME`, `EDITOR_EMAILS`, tokens de git y Blob) y un `README` con el procedimiento "clonar por cliente". Verificable: el README lista los pasos y el `.env.example` tiene cada variable que el codigo lee.
- AC7.2 — Levantar una segunda instancia (otro `page.json`, otro `THEME`, otro allowlist) por solo cambiar env produce una landing editable distinta sin tocar codigo. Verificable: dos despliegues con env distinta dan dos sitios editables independientes. (operator handoff at Phase 3.)

## Orden y dependencias

M1 -> M2 (el renderer necesita el contrato). M1 -> M3 (Puck necesita el contrato). M3 -> M4 (publish guarda lo que el editor produce). M4 + M5 antes de exponer `/admin` real. M6 puede ir en paralelo a M4/M5. M7 al final, consolida env + docs.

Total 7 milestones, dentro del tope. La implementacion del tema visual definitivo NO esta aca: depende de cual propuesta elija el usuario y se hace como follow-on (`/develop` del tema elegido contra su mockup como referencia).
