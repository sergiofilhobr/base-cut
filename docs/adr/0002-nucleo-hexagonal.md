# Núcleo da agenda atrás de portas

O site, o painel e o agente de WhatsApp precisam obedecer à mesma regra de horário. Decidimos arquitetura hexagonal: o núcleo não conhece Next, o banco, o WhatsApp nem o Eve. Quem grava um agendamento entra por um adaptador e passa pela mesma porta. O Postgres fica atrás de outra porta, para o ambiente local e a produção usarem bancos diferentes sem mudar a regra.

## Considered Options

- Server Actions, o painel e o agente acessando o banco direto. Mais curto no início, e a regra de conflito de horário se espalha por cada entrada.

## Consequences

- O MVP carrega portas e adaptadores a mais do que um CRUD simples.
- Trocar a API de WhatsApp, o agente ou o banco não reescreve conflito de horário, prazo de cancelamento e falta.
