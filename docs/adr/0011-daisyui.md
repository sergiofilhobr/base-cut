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

## Na prática

O `/app` usa o daisy assim. O site institucional fica de fora.

- Header do Shell: `navbar` + `menu menu-horizontal`. Abaixo de `sm`, `drawer`. O tema claro/escuro fica no `navbar-end`, visível nos dois tamanhos. A régua de 2px em tinta do `design.md` continua na barra: o fio do daisy é 1px, e a casa pede a laje.
- Linhas da agenda, da equipe e do cliente: `list` / `list-row`. Ações da linha em `join`.
- Dia / semana: `tabs tabs-box`. Horários livres do reagendamento: `btn` em `join`.
- Cancelar horário e excluir ficha: `modal` (`<dialog>`). Sucesso segue silencioso; falha segue `alert`.
- Expediente: `table` com `toggle` por dia. Casa: `fieldset` por bloco; equipe, produtos e inscritos da corrida em `table`.
- Listas carregando: `skeleton`. Portão "só a equipe" e "só o cliente": `alert`.
- `btn` e `modal-box` levam `shadow-none`. Ninguém edita `--color-base-*` direto.
