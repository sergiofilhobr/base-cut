# Base Cut

Sistema de agenda e gestão da Base Cut Barbearia, em Itajaí. Existe para a casa operar os horários dos próprios clientes, no lugar de uma plataforma de terceiros.

## Language

### Pessoas

**Cliente**:
Pessoa identificada por um telefone, com ficha permanente e histórico, que não opera o painel. O e-mail só serve para entrar nessa ficha; telefone e e-mail pertencem a uma só, e trocar o número não move os agendamentos.
_Avoid_: membro, usuário, conta

**Barbeiro**:
Pessoa que realiza os serviços e tem agenda própria. A casa começa com um, o Bruno.
_Avoid_: profissional, member

**Plano**:
Contrato recorrente entre um cliente e a casa, como o mensal de cortes.
_Avoid_: pacote, assinatura, mensalidade

**Equipe**:
Quem opera o painel da Base Cut. O cliente não faz parte da equipe. O Bruno é equipe e barbeiro ao mesmo tempo.
_Avoid_: membro, staff, organização

### Agenda

**Serviço**:
Item fechado do catálogo, com nome, duração e preço próprios. "Corte + Barba" é um serviço, não a soma de corte e barba.
_Avoid_: combo, pacote, procedimento

**Agendamento**:
Reserva de um intervalo contínuo na agenda de um barbeiro para um ou mais serviços, sempre de um cliente com telefone. A visita inteira, no MVP, é este agendamento, criado no site ou pela equipe.
_Avoid_: atendimento, visita, encaixe, walk-in, reserva

**Confirmado**:
Estado do agendamento no momento em que é gravado. O intervalo já pertence àquele cliente.
_Avoid_: pendente, reservado

**Presença avisada**:
Registro de que o cliente respondeu ao lembrete dizendo que vai. Não muda o estado do agendamento e não libera o horário.
_Avoid_: confirmação

**Falta**:
Agendamento em que o cliente não compareceu. Só a equipe registra.
_Avoid_: no-show

**Cancelamento pelo cliente**:
Encerramento do agendamento feito pelo próprio cliente, só enquanto falta mais do que o prazo (hoje, 2 horas) para o início.
_Avoid_: desmarcação

**Cancelamento pela casa**:
Encerramento do agendamento feito pela equipe, a qualquer momento.
_Avoid_: cancelamento

**Concluído**:
Agendamento que a equipe encerrou porque o cliente foi atendido. Não acontece sozinho quando o horário passa.
_Avoid_: finalizado, checkout

**Item do agendamento**:
Serviço dentro de um agendamento, com nome, duração e preço do momento em que entrou.
_Avoid_: linha, snapshot

**Expediente**:
Faixas recorrentes da semana em que o barbeiro atende. Um dia pode ter mais de uma faixa.
_Avoid_: jornada

**Indisponibilidade**:
Intervalo em que o barbeiro não recebe agendamento, por cima do expediente. Pausa, folga, férias e trava pontual são motivos, não entidades à parte.
_Avoid_: bloqueio, folga
