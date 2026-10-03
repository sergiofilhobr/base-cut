# Lembretes por API não oficial de WhatsApp

A confirmação e o lembrete de horário saem no WhatsApp, canal onde o cliente da Base Cut já está. A API oficial da Meta exige template aprovado para mensagem iniciada pela empresa. Decidimos usar uma API não oficial para poder conversar com o cliente sem esse trâmite, aceitando o risco de a Meta banir o número.

## Considered Options

- API oficial (Meta direto ou um BSP): sem risco de ban, com template e janela de 24h para mensagem livre.
- SMS: entrega fraca no Brasil para este público.

## Consequences

- O número usado no envio pode ser banido, e a casa precisa de um plano para trocar de número.
- O envio passa por uma porta única, para o provedor poder mudar sem reescrever a agenda.
- Um agente que responde em texto livre não migra direto para a API oficial.
