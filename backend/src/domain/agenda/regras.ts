export const PRAZO_CANCELAMENTO_MINUTOS = 120;
export const ANTECEDENCIA_MINIMA_MINUTOS = 60;
export const ANTECEDENCIA_MAXIMA_DIAS = 30;

export type EstadoAgendamento =
  | "confirmado"
  | "concluido"
  | "cancelado_pelo_cliente"
  | "cancelado_pela_casa"
  | "falta";

/** Só um agendamento confirmado ocupa o intervalo. Cancelado libera na hora. */
export function ocupaAgenda(estado: EstadoAgendamento): boolean {
  return estado === "confirmado";
}

/** O cliente cancela enquanto faltam mais do que o prazo para o início. */
export function podeCancelarPeloCliente(
  agora: Date,
  inicio: Date,
  prazoMinutos = PRAZO_CANCELAMENTO_MINUTOS,
): boolean {
  return inicio.getTime() - agora.getTime() > prazoMinutos * 60 * 1000;
}

export function fimDoAgendamento(inicio: Date, duracoesMinutos: number[]): Date {
  const total = duracoesMinutos.reduce((soma, minutos) => soma + minutos, 0);
  return new Date(inicio.getTime() + total * 60 * 1000);
}
