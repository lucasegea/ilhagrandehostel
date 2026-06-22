# Plan — Ilha Grande Hostel landing (3 propostas)

Goal: produzir 3 mockups de landing page, autocontidos e abríveis no navegador, com 3 conceitos/estruturas distintos (cada um com estética própria dentro do manual de marca), para o cliente escolher uma direção antes de qualquer desenvolvimento.

Stack do mockup: HTML + CSS vanilla, light-mode explícito, mobile-first. Sem build. Cada conceito é uma pasta autocontida.

## Marca (igual nas 3)

- Display: Fredoka. Texto: Hanken Grotesk (Google Fonts).
- Paleta: terracota `#A0461E`, creme `#FBFBDF`, areias `#ECEBD9` / `#E6DEC6`, tinta marrom `#3B2418`, texto `#5C4232`, neutros `#7A5A44` `#9A8268` `#8A7560`, acentos verde-selva `#2F5135`, teal `#2C6E72`, âmbar `#C9893F`.
- Logo: `assets/logo-hostel.jpg` (cabana terracota).
- Idioma: português (BR).

## Conteúdo comum (presente nos 3, em ordem/estética distinta)

- Hostel: hero, sobre/comunidade, quartos, comodidades, experiências, galeria, localização, reservar/contato.
- Vozes (depoimentos): bloco de opiniões reais com estrelas + selo de origem (Booking / Google). Hostel e agência têm o seu.
- Calytour (agência): UMA seção destacada com CTA forte para a mini-landing `agencia.html` E uma tira/faixa integrada entre seções. Serviços: translados, passeios na Ilha, RJ, Angra e Búzios, excursões e atividades (mergulho). WhatsApp +55 24 98156-6842.
- `agencia.html`: mini-landing da Calytour, MUITO enxuta (estética definitiva a definir depois), com hero, serviços, vozes da agência e CTA WhatsApp. Linkada a partir da landing do hostel (a ponte é clicável).

## Os 3 conceitos

### Conceito 1 — "A Casa na Ilha" (comunidade primeiro / rústico-quente)
Narrativa: o hostel como casa e comunidade. Ordem: Hero -> A Casa (sobre/comunidade) -> Vozes (cedo, porque as opiniões importam) -> Quartos -> Comodidades -> Experiências (com tira Calytour) -> Calytour (seção destacada) -> Galeria -> Localização -> Reservar.
Estética: rústico-quente. Madeira, terracota densa, cantos bem arredondados, fotos cálidas, sensação de abraço.

### Conceito 2 — "Viva a Ilha" (experiência primeiro / tropical-fresco)
Narrativa: a aventura da ilha primeiro; o hostel é seu basecamp e a Calytour é o motor dos passeios. Ordem: Hero (caminho duplo: Hospede-se / Planeje seus passeios) -> Experiências/Passeios (protagonista) -> Calytour (seção destacada, cedo) -> Quartos (basecamp) -> Comodidades -> Vozes -> Galeria -> Localização -> Reservar. Tira Calytour reaparece.
Estética: tropical-fresco. Mais verde-selva + teal, ar, cards de tour, energia moderna.

### Conceito 3 — "Ilha Grande, sem pressa" (lugar primeiro / editorial-minimal)
Narrativa: a ilha e uma narrativa calma. Ordem: Hero editorial -> A Ilha/Localização (lugar primeiro, mapa) -> Sobre o hostel -> Quartos -> Vozes (pull-quotes) -> Experiências -> Calytour (o braço de viagens) + tira -> Galeria -> Reservar.
Estética: editorial-minimal. Muito creme, tipografia grande, muito espaço em branco, terracota como acento pontual, look revista/boutique.

## Acceptance criteria (verificáveis por conceito)

- AC1 — Abrir `proposals/conceito-N/index.html` no navegador renderiza a landing completa do hostel, sem erro de console, com a fonte Fredoka nos títulos e Hanken Grotesk no texto.
- AC2 — A paleta usada é a do manual (terracota/creme/areia/marrom + acentos). Nenhum azul/cinza fora da paleta. Verificável inspecionando `styles.css` (variáveis :root batem com a lista acima).
- AC3 — O logo `assets/logo-hostel.jpg` aparece no header e no footer.
- AC4 — Existe um bloco "Vozes/Depoimentos" com no mínimo 3 opiniões em PT-BR realistas (não lorem), cada uma com nota em estrelas e selo de origem (Booking ou Google).
- AC5 — Existe UMA seção Calytour destacada com CTA visível que navega para `agencia.html` (operator handoff ao clicar) E uma tira/faixa Calytour integrada em outra parte da página.
- AC6 — `proposals/conceito-N/agencia.html` abre uma mini-landing da Calytour com: hero, lista de serviços (translados, passeios Ilha/RJ/Angra/Búzios, mergulho), bloco de vozes da agência, e CTA WhatsApp para +55 24 98156-6842 (link `https://wa.me/5524981566842`).
- AC7 — Responsivo: a `index.html` abre em 375px (mobile) por padrão sem overflow horizontal e re-flui para >=1280px (desktop).
- AC8 — Interações ligadas (DOM real, estado local): menu mobile abre/fecha; carrossel de vozes avança/volta; formulário de reserva valida datas (check-out > check-in) e mostra estado de sucesso. Cada uma com seu affordance visível (hambúrguer, setas, foco/erro).
- AC9 — A ordem das seções de cada conceito corresponde à narrativa descrita acima (os 3 são estruturalmente distintos, não a mesma página repintada).
- AC10 — Existe `proposals/index.html` (seletor) que linka às 3 propostas para comparar lado a lado.

## Out of scope

- Backend real, envio de formulário/e-mail, integração real com Booking/Google (as vozes são fixtures realistas; a coleta automática é trabalho futuro).
- Estética definitiva da mini-landing Calytour (placeholder on-brand; o cliente define depois).
- Reserva real / motor de disponibilidade / pagamentos.
- Conteúdo final (fotos reais do hostel e copy aprovado): usa placeholders Unsplash + copy de proposta.
- SEO técnico, analytics, deploy.
- i18n: só PT-BR.

## Open seams (com default)

- Nome/identidade visual final da Calytour. Default: usar "Calytour" + paleta on-brand do hostel como ponte provisória. Razão: a estética da agência se define depois.
- Fonte das vozes (Booking vs Google vs ambos). Default: mostrar ambos os selos com fixtures. Razão: ilustra a intenção sem comprometer integração.
- Quartos/preços reais. Default: 3 tipos (dormitório, suíte casal, quarto família) com preços ilustrativos. Razão: estrutura > números nesta fase.
- WhatsApp como canal único de reserva vs formulário. Default: ambos (form visual + botão WhatsApp). Razão: o cliente usa WhatsApp na agência.

## Surface cap (escape documentado do piso E.1)

A landing é uma superfície de marketing, NÃO list-shaped. O mandato de três volumes (1/50/5000 linhas) não se aplica. As únicas superfícies com estado são: (a) formulário de reserva -> estados default/erro-validação/sucesso ligados; (b) bloco de vozes -> populado realista. Loading/erro 500/403 completos ficam fora por não haver fetch real. Dark-mode (E.5) intencionalmente OMITIDO: mockup de review é light-only por lição 2026-06-12.
