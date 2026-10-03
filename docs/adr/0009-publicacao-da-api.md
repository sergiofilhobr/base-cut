# A API publica na Fly, o Postgres na Neon

O site continua na Vercel. A Vercel não sobe a imagem Docker, e o lembrete de horário precisa de um processo que fique de pé. A API publica na Fly.io, região `gru`, com uma máquina sempre ligada. O Postgres de teste é um projeto Neon Free, sem dados de produção. O de produção é Neon Launch, pago pelo uso. O container Docker do Compose continua só no local, na porta 5434, porque 5432 e 5433 já estavam ocupadas nesta máquina.

`develop` publica a API em `basecut-api-staging` e o site em `base-cut-navy.vercel.app`. `main` publica a API em `basecut-api` e o site em `basecut.com.br`. Cada app da Fly tem o seu `DATABASE_URL`. O preview da Vercel aponta para a API de staging, nunca para o banco de produção.

## Considered Options

- VPS com Docker também em produção. Adia o corte e duplica a operação de um servidor.
- Função serverless na Vercel para a API. O processo dorme, e o lembrete de 24h e o de 2h deixam de sair na hora.

## Consequences

- São dois deploys: o site na Vercel e a API na Fly. Os dois leem o mesmo Postgres do ambiente, atrás da porta que já existe.
- Sem `FLY_API_TOKEN` no repositório, o workflow avisa e não publica. O segredo do banco fica na Fly, não no git.
- Trocar de Fly para outro processo longo não muda a regra de horário.
