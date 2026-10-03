---
status: superseded by ADR-0006
---

# Cliente entra com código no WhatsApp

Substituída pela ADR 0006. O código de entrada do cliente passou a sair por e-mail.

A equipe entra pelo Clerk, numa organization só da Base Cut. O cliente tem ficha própria, nascida no primeiro agendamento, e entra com um código enviado ao telefone dele pelo WhatsApp. Ele não é usuário do Clerk. Histórico e repetir o último corte usam essa ficha. O plano, quando existir, fica nessa mesma ficha.

## Considered Options

- Cliente como usuário do Clerk, com SMS, e-mail ou login social. Segunda identidade para a mesma pessoa, e o código deixaria de sair no WhatsApp.

## Consequences

- A entrada do cliente depende da mesma API de WhatsApp dos lembretes. Se o número da casa for banido, as duas caem juntas.
- Passar o cliente para o Clerk depois muda a sessão, não a ficha.
