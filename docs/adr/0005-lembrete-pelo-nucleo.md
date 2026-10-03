# Lembrete sai do núcleo

A mensagem de 24h e a de 2h são texto fixo, disparadas pelo núcleo na hora certa, pela porta de WhatsApp. O Eve só entra quando o cliente responde. Presença avisada, cancelamento e o link do site são comandos no núcleo. O núcleo recusa cancelamento quando faltam 2 horas ou menos.

## Considered Options

- O agente redige e envia o lembrete. O horário fica sem mensagem se o modelo estiver fora.

## Consequences

- O lembrete não depende do modelo.
- O agente não consegue furar o prazo de cancelamento, mesmo que a resposta peça.
