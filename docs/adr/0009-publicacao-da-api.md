# A API roda em Docker, o site na Vercel

O site continua na Vercel. A Vercel não sobe a imagem Docker, e o lembrete de horário precisa de um processo que fique de pé. Esse processo é o container da API.

Por agora o container sobe só na máquina de teste, com `docker compose up --build`. O Postgres desse teste é o serviço `postgres` do mesmo compose, na porta 5434 do host. A Z-API entra pelas variáveis `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN` e `ZAPI_CLIENT_TOKEN`. Sem elas, a API sobe e não envia WhatsApp.

`develop` publica o site em `base-cut-navy.vercel.app`. `main` publica o site em `basecut.com.br`. Nenhum dos dois publica a API.

## Considered Options

- Fly.io. Servia para um processo longo, mas o teste gratuito acaba em duas horas de máquina ligada e a conta nova não tem cota mensal. Fica de fora.
- VPS com o mesmo compose, mais adiante. O arquivo local é o que sobe lá. Não entra neste passo.
- Função serverless na Vercel para a API. O processo dorme, e o lembrete de 24h e o de 2h deixam de sair na hora.

## Consequences

- O workflow não pede `FLY_API_TOKEN` e não publica a API.
- No teste local, `NODE_ENV=development` e `AUTH_LOCAL=1` enquanto não houver `CLERK_SECRET_KEY`.
- A Z-API consegue receber o que a API envia. A resposta do cliente no WhatsApp só chega quando o webhook `POST /api/whatsapp/entrada` estiver num endereço público. Localhost não recebe esse webhook.
