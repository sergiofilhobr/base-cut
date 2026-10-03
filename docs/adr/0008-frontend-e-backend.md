# Frontend e backend em pastas separadas

O site e o núcleo da agenda são processos diferentes. O Next.js do site fica em `frontend/`. A regra de horário, o Postgres e a API ficam em `backend/`, em portas e adaptadores. No local, o Docker sobe o Postgres e o backend. O frontend roda ao lado, para o site continuar com recarga rápida. Em produção o site segue na Vercel. Onde o processo da API publica fica para o dia de abrir o agendamento fora da máquina local.

## Considered Options

- Tudo dentro do Next, com a API em route handlers. Um deploy só, e o núcleo ficaria preso ao framework do site.

## Consequences

- São dois `package.json` e dois processos.
- O Eve e o site chamam a API. Nenhum dos dois fala com o banco.
- Publicar a API ainda não tem hospedagem definida. O container existe para o ambiente local.
