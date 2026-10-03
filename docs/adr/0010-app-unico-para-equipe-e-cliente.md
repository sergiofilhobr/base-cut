# Um app em /app para a equipe e o cliente, e o cliente se cadastra nele

O site vira aplicação. Tudo o que pede sessão mora em `/app`: a equipe entra e vê o painel (Hoje, Agenda, Expediente, Casa); o cliente entra e vê a própria agenda (Horários, Marcar, Ficha). O header do app carrega as seções do papel de quem entrou. `/painel` e `/conta` só redirecionam para lá.

O cliente passa a nascer no app, não só na marcação: entra no Clerk, e a primeira tela pede nome, telefone e consentimento (`POST /api/conta/cadastrar`). O telefone continua identificando a ficha; o e-mail do Clerk entra nela e pertence a uma só. Uma ficha que nasceu numa marcação anterior é ligada, não duplicada.

O Booksy sai de vez: some o destino alternativo do link de agenda, a importação do CSV e a configuração `agendamento_publico`. O único destino de marcação é `/agendar`, e o cliente logado marca em `/app/marcar` sem digitar os dados.

Para desenvolver sem chave do Clerk existe um adaptador local de autenticação (`AUTH_LOCAL=1` na API, `NEXT_PUBLIC_AUTH_LOCAL=1` no site). O token é o papel. Ele só liga quando não há `CLERK_SECRET_KEY` e nunca em produção. O Clerk de verdade roda na instância de desenvolvimento (`pk_test_` / `sk_test_`) até o corte.

## Considered Options

- Manter `/painel` (equipe) e `/conta` (cliente) separados. Dois chromes, duas entradas, o mesmo Clerk por trás.
- Cadastro só pela marcação, como na ADR 0007. Quem quisesse ver a agenda antes de marcar não tinha como entrar.
- Verificar o Clerk no front com middleware. Não é necessário: a API valida o token em toda rota, e o site só carrega o `ClerkProvider` sob `/app`.

## Consequences

- `GET /api/eu` é a única pergunta que o front faz para saber quem entrou. Equipe recebe o papel; cliente recebe a ficha, ou a falta dela.
- As rotas `/api/conta/*` operam pela sessão, sem telefone no corpo. As rotas públicas de `/api/agendamentos/:id` continuam para o link do WhatsApp.
- O adaptador local é um atalho de desenvolvimento, não um segundo login. Em produção ele não existe.
