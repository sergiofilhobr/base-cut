# Design — Base Cut Barbearia

Sistema de design travado para este app. Toda página lê este arquivo antes de
emitir código. Não regenere por página — estenda ou emende este arquivo quando o
sistema precisar crescer.

## Genre

**editorial** — barbearia de bairro com identidade tipográfica forte. Sem sinais
de SaaS, atmospheric ou playful no brief.

## Macrostructure family

- **Marketing pages:** Marquee Hero — `/`. Varia: tratamento do enunciado.
- **Content pages:** Catalogue — `/servicos`, `/contato`, `/galeria`. Varia: densidade da lista.
- **Statement pages:** Manifesto — `/sobre`.
- **Variante declarada:** `/run-club` usa um deck de capítulos em carrossel,
  herdado do material impresso do Base Run. É a única página que foge das
  famílias acima, e foge de propósito: a DNA veio do deck da marca.

## Theme

Neutros quentes, **sem acento cromático**. Os valores invertem entre claro e
escuro, então nenhum componente usa variante `dark:` para cor.

| Token | Claro | Escuro |
|---|---|---|
| `--paper` | `#f2efe6` | `#1a1917` |
| `--surface` | `#ece7d9` | `#232220` |
| `--ink` | `#1a1917` | `#f2efe6` |
| `--muted` | `#5f5d58` | `#8f8d85` |
| `--rule` | `#d8d3c6` | `#34332f` |

> Desvio do formato padrão do hallmark: os valores estão em hex, não OKLCH,
> porque é o que já vive em `app/globals.css`. Documentar o real vale mais que
> documentar o canônico.

Contraste verificado: texto principal **15.3:1**, apoio **5.7:1** (claro) e
**5.3:1** (escuro).

**Não existe cor de destaque.** O acento dourado `#c9a96e` foi removido do
projeto. Ênfase se carrega com peso, caixa ou cinza — nunca com cor.

## Typography

- **Display:** Archivo, peso 900, `font-style: normal`, caixa alta, `tracking -0.02em`, `leading 0.88`
- **Body:** Inter, peso 400
- **Mono:** JetBrains Mono, peso 400 — rótulos, dados e o colophon

Títulos são sempre romanos. Itálico só como ênfase dentro de parágrafo corrido.

## Spacing

Escala de 4pt via Tailwind. Seções **não** compartilham o mesmo padding: o ritmo
vertical varia de propósito entre as famílias (ver *Per-page allowances*).

## Motion

- Sem fade-on-scroll universal. **Uma** entrada orquestrada, só no hero da home.
- O resto do conteúdo simplesmente está lá.
- Anima apenas `transform` e `opacity`. Nunca `transition-all`.
- Sem `hover:scale-*`. Hover carrega um sinal só — cor ou sublinhado, não os dois.
- `prefers-reduced-motion: reduce` colapsa para opacidade ≤150ms.
- Exceções declaradas (pedido do cliente): a cascata das avaliações em
  `/contato` ao entrar na dobra, e o tilt 3D do theme switch no hover — ambos
  colapsam com `prefers-reduced-motion`.

## Microinteractions stance

- Sucesso silencioso. Toast só para falha.
- Foco visível instantâneo — nunca com transição.
- Autoplay só no carrossel do `/run-club`: botão de pausa visível, hold em
  hover/focus, desligado com `prefers-reduced-motion` (WCAG 2.2.2).

## CTA voice

- **Primário:** retângulo sólido, sem raio, tinta sobre papel invertido, rótulo
  em mono caixa alta com `tracking 0.2em`, `whitespace-nowrap`.
- **Secundário:** texto com régua inferior de 1px, sem caixa.
- Sem pílulas arredondadas, sem sombra, sem gradiente.

## Componentes de chrome

- **Nav:** N7 Brutal slab — full-width, borda inferior de 2px, wordmark e links
  em caixa alta tracked, sem raio, sem sombra, sem `backdrop-blur`. Abaixo de
  `sm` os links migram para um `MobileDrawer` (painel lateral, mola do
  react-spring) — não sobra largura pro slab completo sem apertar tudo.
- **Footer:** Ft4 Dense colophon — bloco denso em mono com endereço, horário e
  créditos. Sem colunas de links, sem fileira de ícones sociais.

## Per-page allowances

- Marketing e Statement **podem** usar tipografia em escala de display.
- Content pages são tipografia e régua — sem cards, sem ícones decorativos.
- Enriquecimento de hero: nenhum. O hero é tipográfico.
- O mapa do Google (`/contato`) entra em `grayscale`: o cromático dele não é
  da paleta. Slots de foto e de avaliação usam moldura tracejada + rótulo mono
  "a inserir" até o material real chegar.

## What pages MUST share

- O wordmark `BASE CUT`.
- A ausência de acento cromático.
- O par Archivo + Inter + JetBrains Mono.
- A voz de CTA (retângulo sólido, mono caixa alta).
- Nav N7 e footer Ft4.
- O barber pole: grande no canto do main **só na home**; nas demais rotas,
  versão mini no header ao lado do wordmark (visível a partir de `lg`).
- Altura mínima de viewport: o `main` sempre preenche o espaço entre nav e footer.

## What pages MAY differ on

- A macrostructure, dentro da família do tipo de página.
- O ritmo vertical e o alinhamento.
- A densidade da lista, nas content pages.
