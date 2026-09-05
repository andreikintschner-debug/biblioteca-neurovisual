# Biblioteca Neuro Visual — Landing Page (PT-PT)

Página de vendas de página única, **estática, responsiva e mobile-first**, para o
mercado de Portugal. Toda a copy vem do ficheiro
[`biblioteca-neuro-visual-copy-PT-PT-estrutura.md`](biblioteca-neuro-visual-copy-PT-PT-estrutura.md)
**sem alterações**.

## 🧱 Ordem dos 12 blocos (estrutura de alta conversão)

1. **Top bar** (urgência + preço + countdown) — fixa no topo
2. **Hero** (headline + CTA + "Ideal para")
3. **Dor** (grelha de dores + custo da inação ❌, com os 960 €/ano em destaque)
4. **Mecanismo** (porque resolve + 9 contadores de categorias)
5. **Prova** (números-chave + testemunhos com lightbox + autoridade da Sara)
6. **Desejo** (o "depois" ✅ + 9 benefícios + linha-ponte)
7. **Bónus** (6 cards)
8. **Oferta/Planos** (2 cards; Kit Completo em destaque)
9. **Garantia** (selo 7 dias)
10. **FAQ** (accordion)
11. **CTA final**
12. **Rodapé**

## 🗂️ Estrutura do projeto

```
Neurovisual/
├── index.html                 ← a página (toda a copy + estrutura)
├── css/styles.css             ← estilos de apoio (animações, foco, etc.)
├── js/main.js                 ← CTAs, tracking, countdown, lightbox, FAQ
├── assets/                    ← imagens (substitui os placeholders pelas reais)
│   ├── placeholder.svg        ← usado enquanto não há imagens reais
│   ├── favicon.svg
│   └── LEIA-ME-IMAGENS.txt    ← lista dos nomes de ficheiro a colocar
└── README.md
```

Não há build. É **HTML + Tailwind (via CDN) + JavaScript vanilla**.

## 🚀 Como fazer deploy

### Netlify (arrastar e largar)
1. Vai a [app.netlify.com/drop](https://app.netlify.com/drop).
2. Arrasta a pasta inteira `Neurovisual/`.
3. Fica online em segundos.

### Vercel
1. `vercel` na pasta do projeto (ou importa o repositório no painel).
2. Framework preset: **Other**. Não é preciso comando de build.

### Hostinger / alojamento tradicional
1. Envia o conteúdo da pasta para `public_html/` por FTP ou gestor de ficheiros.
2. `index.html` tem de ficar na raiz.

## ✏️ Onde editar (o essencial)

Abre o `index.html` e procura o bloco **"CONFIGURAÇÃO — ÚNICO SÍTIO PARA EDITAR"** no `<head>`:

```js
window.NEURO_CONFIG = {
  CHECKOUT_URL_BASICO: "https://pay.hotmart.com/...",   // 🔗 checkout do Kit Básico
  CHECKOUT_URL_COMPLETO: "https://pay.hotmart.com/...", // 🔗 checkout do Kit Completo
  META_PIXEL_ID: "META_PIXEL_ID",                       // 📊 ID do Meta Pixel ("" desativa)
  GA4_ID: ""                                            // 📈 ID do GA4 opcional ("" desativa)
};
```

- **CHECKOUT_URL_BASICO / CHECKOUT_URL_COMPLETO** — links de checkout de cada plano.
  O botão do Kit Básico (`data-plan="basico"`) e o do Kit Completo (`data-plan="completo"`)
  apontam para o respetivo link. Todos os outros CTAs da página fazem apenas scroll
  suave até à secção de planos. Se um link ficar vazio, o botão desse plano faz scroll
  para a secção de planos em vez de ir ao checkout.
- **META_PIXEL_ID** — substitui `META_PIXEL_ID` pelo teu ID. Enquanto estiver o
  placeholder, o pixel **não** carrega.
- **GA4_ID** — opcional; mete o teu `G-XXXXXXX`. Vazio = desativado.

### Imagens
Coloca os teus ficheiros em `assets/` com os nomes indicados em
[`assets/LEIA-ME-IMAGENS.txt`](assets/LEIA-ME-IMAGENS.txt) (ex.: `hero.webp`,
`bonus-1-jogos.webp`, `testemunho-1.webp`, `sara-instagram.webp`,
`garantia-7dias.webp`). Não é preciso mexer no código — mantém os nomes.
Recomenda-se **.webp** (qualidade ~80, < 200 KB por imagem).

## 📊 Eventos de tracking já ligados

| Evento             | Quando dispara                              |
|--------------------|---------------------------------------------|
| `PageView`         | Ao carregar a página                        |
| `ViewContent`      | Ao chegar (scroll) à secção de planos       |
| `InitiateCheckout` | Em qualquer clique num CTA / botão de compra |

(Também são enviados para o GA4, se configurado: `view_content`, `initiate_checkout`.)

## ✅ Componentes de conversão incluídos
- **Top bar** fixa no topo (urgência + ancoragem de preço) — a 1ª coisa visível.
- Barra de CTA **fixa (sticky)** no fundo em mobile.
- **Countdown** de sessão (15 min) na top bar.
- **Lightbox** para ampliar os testemunhos (rato e teclado — ESC fecha).
- **FAQ** em accordion acessível por teclado.
- Scroll suave para as âncoras.

## ♿ Acessibilidade
HTML semântico, contraste WCAG AA, `alt` descritivo em todas as imagens,
navegação por teclado no accordion e no lightbox, foco visível e respeito por
`prefers-reduced-motion`.

## ⚡ Performance
`lazy-load` nas imagens abaixo da dobra, dimensões definidas (evita saltos de
layout) e JavaScript mínimo. Para produção com Lighthouse ainda mais alto, podes
opcionalmente compilar o Tailwind em vez do CDN (ver nota no fim).

---

### Nota opcional: compilar o Tailwind (produção)
O projeto usa o Tailwind Play CDN para ser **zero-build e fácil de editar**. Se
quiseres o CSS mínimo compilado (melhor pontuação de performance), podes migrar
para Tailwind CLI/Vite mais tarde — o HTML mantém-se igual, só muda a forma como
o CSS é gerado.
