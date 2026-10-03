# Clerk envia o código do cliente

A equipe é member da organization Base Cut no Clerk. O cliente também autentica no Clerk, e o Clerk envia o código para o e-mail dele. Ele não é member dessa organization. O telefone continua identificando a ficha. O WhatsApp fica para avisar o corte e para a conversa do Eve.

## Considered Options

- Porta de e-mail própria (Resend) e o cliente fora do Clerk, como na ADR 0006. Dois sistemas de login para manter.
- Cliente como member da organization. Ele passaria a ter o mesmo espaço da equipe.

## Consequences

- Banir o número do WhatsApp derruba o aviso do corte. A entrada na ficha continua no Clerk.
- A marcação pede nome, telefone e e-mail, e o agendamento grava sem esperar o código. O usuário do Clerk nasce na primeira entrada, ligado à ficha pelo e-mail que já estava nela.
- Se o telefone já tem ficha, o agendamento entra nela e o e-mail guardado não muda sozinho.
- Um e-mail pertence a uma só ficha. A marcação não grava com um e-mail que já está em outro telefone.
- Não há porta de e-mail no MVP. O código é do Clerk.
