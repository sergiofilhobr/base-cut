---
status: superseded by ADR-0007
---

# Cliente entra com código por e-mail

Substituída pela ADR 0007. Quem envia o código passou a ser o Clerk.

A equipe entra pelo Clerk, numa organization só da Base Cut. O cliente entra na própria ficha com um código enviado ao e-mail dele. O WhatsApp fica para avisar o corte e para a conversa do Eve. O telefone continua identificando a ficha. O cliente não é usuário do Clerk.

## Considered Options

- Código no WhatsApp, como na ADR 0004. A entrada do cliente caía junto com o número, se a Meta banisse.

## Consequences

- Um banimento do número derruba aviso e conversa. A entrada na ficha continua pelo e-mail.
- Sem e-mail na ficha, o cliente não entra sozinho.
- O envio de e-mail fica atrás de uma porta, no mesmo espírito da porta de WhatsApp.
