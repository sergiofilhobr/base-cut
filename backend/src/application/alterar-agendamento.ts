import {
  diaDaSemanaIso,
  horariosLivres,
  limitesDoDia,
} from "../domain/agenda/horarios-livres.ts";
import { fimDoAgendamento, podeCancelarPeloCliente } from "../domain/agenda/regras.ts";
import type { AgendamentoDetalhe, RepositorioAgenda } from "../ports/agenda.ts";
import type { Relogio } from "../ports/relogio.ts";

export type FalhaAoAlterar =
  | "nao_encontrado"
  | "prazo_encerrado"
  | "estado_invalido"
  | "horario_indisponivel";

export async function cancelarPeloCliente(
  agenda: RepositorioAgenda,
  relogio: Relogio,
  pedido: { id: string; telefone: string },
): Promise<{ ok: true } | { ok: false; erro: FalhaAoAlterar }> {
  const agendamento = await carregarDoCliente(agenda, pedido);
  if (!agendamento.ok) return agendamento;
  if (!podeCancelarPeloCliente(relogio.agora(), agendamento.detalhe.inicio)) {
    return { ok: false, erro: "prazo_encerrado" };
  }
  await agenda.cancelarAgendamento(agendamento.detalhe.id, "cancelado_pelo_cliente");
  return { ok: true };
}

export async function reagendarPeloCliente(
  agenda: RepositorioAgenda,
  relogio: Relogio,
  pedido: { id: string; telefone: string; inicio: Date },
): Promise<{ ok: true; inicio: Date; fim: Date } | { ok: false; erro: FalhaAoAlterar }> {
  const agendamento = await carregarDoCliente(agenda, pedido);
  if (!agendamento.ok) return agendamento;
  if (!podeCancelarPeloCliente(relogio.agora(), agendamento.detalhe.inicio)) {
    return { ok: false, erro: "prazo_encerrado" };
  }

  const detalhe = agendamento.detalhe;
  const duracoes = detalhe.itens.map((item) => item.duracaoMinutos);
  const fim = fimDoAgendamento(pedido.inicio, duracoes);
  const dia = diaCivil(pedido.inicio);
  const janela = limitesDoDia(dia);
  const [faixas, ocupados, bloqueios] = await Promise.all([
    agenda.expediente(detalhe.barbeiroId, diaDaSemanaIso(dia)),
    agenda.ocupados(detalhe.barbeiroId, janela.inicio, janela.fim, detalhe.id),
    agenda.indisponibilidades(detalhe.barbeiroId, janela.inicio, janela.fim),
  ]);
  const livres = horariosLivres({
    dia,
    duracaoMinutos: duracoes.reduce((soma, minutos) => soma + minutos, 0),
    faixas,
    ocupados,
    indisponibilidades: bloqueios,
    agora: relogio.agora(),
    origem: "site",
  });
  if (!livres.some((horario) => horario.getTime() === pedido.inicio.getTime())) {
    return { ok: false, erro: "horario_indisponivel" };
  }

  try {
    await agenda.reagendarAgendamento(detalhe.id, pedido.inicio, fim);
  } catch (erro) {
    if (ehConflitoDeHorario(erro)) return { ok: false, erro: "horario_indisponivel" };
    throw erro;
  }
  return { ok: true, inicio: pedido.inicio, fim };
}

async function carregarDoCliente(
  agenda: RepositorioAgenda,
  pedido: { id: string; telefone: string },
): Promise<{ ok: true; detalhe: AgendamentoDetalhe } | { ok: false; erro: FalhaAoAlterar }> {
  const detalhe = await agenda.buscarAgendamento(pedido.id);
  if (!detalhe || detalhe.telefone !== pedido.telefone) return { ok: false, erro: "nao_encontrado" };
  if (detalhe.estado !== "confirmado") return { ok: false, erro: "estado_invalido" };
  return { ok: true, detalhe };
}

function diaCivil(instante: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instante);
}

function ehConflitoDeHorario(erro: unknown): boolean {
  return (
    typeof erro === "object" &&
    erro !== null &&
    "code" in erro &&
    (erro as { code?: string }).code === "23P01"
  );
}
