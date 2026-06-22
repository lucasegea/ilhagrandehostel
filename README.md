# Ilha Grande Hostel 🌴

Landing page de um hostel pé na areia na Vila do Abraão, **Ilha Grande** (Angra dos Reis, RJ).

Site estático, sem build: HTML + CSS + um pouco de JavaScript. Abra e use.

## Estrutura

```
ilhagrandehostel/
├── index.html          # página única (hero, sobre, quartos, experiências, galeria, contato)
├── assets/
│   ├── styles.css      # estilos (tema tropical, responsivo)
│   └── script.js       # menu mobile, ano do rodapé, validação do form
└── README.md
```

## Rodar localmente

É um site estático, basta abrir `index.html` no navegador. Para servir com URLs limpas:

```bash
python -m http.server 8000
# acesse http://localhost:8000
```

## Seções

- **Hero** — chamada principal + reserva
- **Sobre** — proposta do hostel
- **Quartos** — dormitório, suíte vista mar, quarto família
- **Experiências** — passeios de barco, trilhas, mergulho, noites no hostel
- **Galeria** — mosaico de fotos
- **Contato** — formulário de solicitação de reserva (demo front-end)

## Notas

- As imagens usam URLs do Unsplash como placeholder. Troque pelos arquivos reais do hostel em `assets/`.
- O formulário de reserva é apenas front-end (não envia e-mail ainda). Integre com WhatsApp, e-mail ou um backend quando for ao ar.

## Deploy

Compatível com GitHub Pages, Netlify ou Vercel sem configuração extra (raiz = `index.html`).
