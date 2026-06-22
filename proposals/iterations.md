# Iterations — Ilha Grande Hostel (3 propostas)

Vuelta 1. Status: entregue para revisão do cliente. Loop devolve a direção ao usuário (escolher 1 dos 3 conceitos).

Verificação estrutural (Echo): os 3 conceitos passam — dark-mode 0 (light-only por lição 2026-06-12), fontes Fredoka+Hanken carregadas, viewport meta presente, wa.me/5524981566842 presente, logo referenciado 3x (header/footer/favicon), links para agencia.html presentes, token de marca #A0461E no :root. Sem Playwright no ambiente; screenshot fica para a revisão visual do usuário no navegador.

## Feel clauses (Section E.6) — comuns aos 3, com a voz de cada Forge

### E.1 Estados do formulário (surface cap: form + vozes; sem fetch real)
O usuário sente que o pedido foi ouvido, não rejeitado: data inválida (check-out <= check-in) para com um alerta claro; data válida desliza um "Pedido recebido!" verde inline e limpa o form, sem sair da página.

### E.2 Viewports (375px + 1280px)
A 375px tudo empilha numa coluna calma sem scroll lateral; acima de 1280px o layout respira (quartos em 3, blocos lado a lado, no conceito 3 spreads de revista assimétricos). Sente-se feito para o celular primeiro e mais rico no laptop.

### E.3 Interações ligadas
Nada parece foto morta: o hambúrguer abre/fecha de verdade (e fecha ao tocar um link), as setas das Vozes deslizam entre depoimentos PT-BR reais, as âncoras rolam suave. Cada controle responde na hora.

### E.4 Affordances
O usuário sempre vê o que é clicável e onde está: hambúrguer 48px que vira X, setas redondas 48px com aria-label, dot/contador ativo nas Vozes, e anel de foco visível ao tabular.

### E.5 Acessibilidade (AA, light-only)
Texto marrom sobre creme fica confortável de ler, terracota reservada a texto grande/bold, alvos de toque >=44px, prefers-reduced-motion silencia slides e scroll suave. Sem override de dark-mode. Legível e calmo para todos.

## Desvio documentado

- Dark-mode (E.5 do contrato genesis-spec): OMITIDO de propósito. Mockup de review é light-only (lição 2026-06-12) e a marca é creme/terracota clara. Se o produto final precisar de dark-mode, vai no componente real com variáveis de tema, não no mockup.
- Três-volumes E.1 (1/50/5000 linhas): N/A. Landing de marketing não é list-shaped (surface cap em PLAN.md).
