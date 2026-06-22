# Brief técnico compartido (los 3 Forge lo leen)

## Decisiones binding (Atlas)

- **D-001 — Autocontención total.** Cada conceito é uma pasta independente: próprio `index.html`, próprio `styles.css`, próprio `agencia.html`, próprio `assets/logo-hostel.jpg` (já copiado). NADA de CSS compartilhado por import. Razão: o cliente abre uma pasta só (file://) e vê a proposta completa; dá pra enviar um conceito isolado.
- **D-002 — Calytour é placeholder on-brand.** A mini-landing `agencia.html` usa a paleta do hostel como ponte provisória, com um aviso discreto "identidade visual da Calytour a definir". Não sobre-investir: é mini.
- **D-003 — Light-only.** Proibido `@media (prefers-color-scheme: dark)` (lição 2026-06-12). Forçar fundo creme sempre.
- **D-004 — Sem build, sem deps.** HTML + CSS vanilla + um `<script>` inline mínimo por página (menu, carrossel, validação do form). Sem frameworks.

## Tokens de marca (cole em :root, idêntico nos 3)

```css
:root{
  --terracota:#A0461E; --terracota-esc:#8A3A18;
  --creme:#FBFBDF; --areia:#ECEBD9; --areia-2:#E6DEC6;
  --tinta:#3B2418; --texto:#5C4232;
  --n1:#7A5A44; --n2:#9A8268; --n3:#8A7560;
  --verde:#2F5135; --teal:#2C6E72; --ambar:#C9893F;
  --branco:#FFFDF2;
}
```

Fontes (no `<head>`):
```html
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
```
Fredoka -> títulos/marca. Hanken Grotesk -> texto. Favicon: `assets/logo-hostel.jpg`.

## Conteúdo Calytour (agência) — usar tal cual

- Nome: **Calytour** — Travel Company.
- Tagline: "Ajudamos a planejar sua viagem."
- Serviços (com ícone): 🚘 Translados | 🚤 Passeios na Ilha, RJ, Angra e Búzios | 🤿 Mergulho e excursões | 🛏️ Parceria com o Ilha Grande Hostel.
- WhatsApp: +55 24 98156-6842 -> `https://wa.me/5524981566842`.
- Seção destacada na landing: bloco próprio com CTA "Conheça a Calytour ->" que abre `agencia.html`. MAIS uma tira/faixa fina integrada noutra parte ("Também planejamos seus passeios. Calytour ->").

## Vozes / Depoimentos (fixtures realistas PT-BR, NÃO lorem)

Bloco com >=3 cards, cada um: texto, nome + cidade, nota em estrelas (★), selo de origem (Booking.com ou Google). Ex (variar por conceito, podem inventar mais no mesmo tom):

- "Acordar com o som do mar e tomar café com gente do mundo todo. Volto com certeza." — Mariana S., São Paulo. ★★★★★ · Google
- "O pessoal organizou nosso passeio de barco pela Calytour, foi impecável. Lopes Mendes é surreal." — Thiago R., Belo Horizonte. ★★★★★ · Booking.com
- "Quartos limpos, localização perfeita pertinho da Vila. Melhor custo-benefício de Abraão." — Camila e Pedro, Curitiba. ★★★★☆ · Booking.com
- "Equipe nota 10, cuidaram de translado e mergulho. Já quero voltar." — Lucas F., Niterói. ★★★★★ · Google

A mini-landing da Calytour tem o SEU próprio bloco de 2-3 vozes focadas em passeios/translados.

## Conteúdo hostel

- Local: Vila do Abraão, Ilha Grande — Angra dos Reis, RJ. Sem carros, 2 min da praia, entrada das trilhas.
- Quartos (ilustrativos): Dormitório compartilhado (R$ 90/noite), Suíte Casal Vista Mar (R$ 320/noite), Quarto Família até 4 (R$ 260/noite).
- Comodidades: café da manhã caseiro, cozinha compartilhada, Wi-Fi rápido, recepção bilíngue, rede/varanda, fogueira na praia.
- Experiências: passeio de barco (Lagoa Azul/Verde), trilha a Lopes Mendes, mergulho/snorkel, noites com música.

## Imagens (placeholder)

Usar Unsplash via URL direta (tema praia/ilha/hostel tropical), ex:
`https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?auto=format&fit=crop&w=1600&q=70` (praia),
`https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=70`,
`https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=800&q=70`,
`https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=800&q=70`,
`https://images.unsplash.com/photo-1535262412227-85541e910204?auto=format&fit=crop&w=1200&q=70`,
`https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=70` (quarto),
`https://images.unsplash.com/photo-1551918120-9739cb430c6d?auto=format&fit=crop&w=800&q=70` (barco/mar).
Cada `<img>` com `alt` descritivo. Pode repetir/variar.

## Piso técnico (todos os conceitos)

- **Mobile-first 375px** sem overflow horizontal; **desktop >=1280px** melhora o layout. `<meta viewport>` presente.
- **Interações ligadas (DOM real, estado local):** (1) menu mobile hambúrguer abre/fecha; (2) carrossel de vozes com setas prev/next (botões >=44px, com aria-label); (3) formulário de reserva: campos nome/email/check-in/check-out/hóspedes; ao enviar valida check-out > check-in (alerta) e mostra mensagem de sucesso inline; (4) âncoras com scroll suave. Cada interativo com foco visível (`:focus-visible`).
- **Acessibilidade:** contraste AA (texto marrom `--tinta`/`--texto` sobre creme; terracota só em texto grande ou com peso), `:focus-visible` em tudo, alvos toque >=44px, `@media (prefers-reduced-motion: reduce)` desliga animações. SEM dark-mode.
- **Zero console.error.** HTML válido, sem libs externas além das Google Fonts.
- Rodapé com logo, ©, links sociais placeholder e link para a Calytour.

## Saída de cada Forge

Escrever em `proposals/conceito-N/`: `index.html`, `styles.css`, `agencia.html`. (O logo já está em `assets/`.) Reportar 1 parágrafo: o que construiu, a ordem das seções, e UMA "feel clause" por linha do piso (estados do form, viewports, interações ligadas, affordances, a11y) — o que o usuário SENTE quando funciona.
