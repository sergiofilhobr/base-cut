# Ambientes local, teste e produção

O ambiente local sobe com Docker para ter Postgres à mão. O teste é um preview na Vercel com um projeto Neon no plano Free, sem cartão e sem prazo de expiração. Produção é a Vercel com Neon Launch, pago pelo uso, sem mensalidade mínima. A Vercel não roda a imagem Docker: o container fica no local.

## Considered Options

- VPS com Docker também em produção. Adia o Eve e duplica a operação de um servidor.
- Neon Free em produção. Estourar as 100 horas de compute pausa a agenda até o mês seguinte.

## Consequences

- O app roda de dois jeitos: Compose no local, Vercel fora. O banco é sempre Postgres, atrás da mesma porta.
- O teste não compartilha dados com a produção.
