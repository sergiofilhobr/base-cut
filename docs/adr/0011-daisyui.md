# daisyUI como biblioteca de componentes

O app usa daisyUI 5 sobre o Tailwind v4, com `themes: false`. As variáveis de tema do daisy (`--color-base-*`, `--color-primary`, raios, borda, profundidade) são definidas no `globals.css` a partir dos cinco tokens do `design.md`, nos dois modos. Raio zero, profundidade zero, sem ruído, e todos os papéis semânticos (info, success, warning, error) apontam para a tinta: a paleta continua sem acento cromático.

O site institucional não muda. O daisy veste o que é aplicação: `/app`, o fluxo de marcação e os componentes em `app/app/ui/`.

## Considered Options

- shadcn/ui, o padrão do workspace. Componente por cópia, já tinha as dependências no projeto. Descartado por decisão de produto: a casa não quer manter componentes copiados.
- Componentes próprios, sem biblioteca. Era o estado anterior; poucos e suficientes, mas cada tela nova recomeçava do zero.

## Consequences

- `@radix-ui/react-slot` e `class-variance-authority` saem. `clsx` e `tailwind-merge` ficam.
- O tema do daisy é derivado: muda-se o token no bloco do `design.md`, o daisy acompanha. Ninguém edita `--color-base-100` direto.
- Componente do daisy que trouxer raio, sombra ou cor própria é sobrescrito na classe, nunca aceito como vem.
