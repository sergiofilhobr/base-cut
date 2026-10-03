import {
  diaDaSemanaIso,
  horariosLivres,
  limitesDoDia,
} from "../domain/agenda/horarios-livres.ts";
import { fimDoAgendamento } from "../domain/agenda/regras.ts";
import type { ItemAgendamento, RepositorioAgenda } from "../ports/agenda.ts";
import type { Relogio } from "../ports/relogio.ts";

export type FalhaDaEquipe = "nao_encontrado" | "estado_invalido" | "horario_indisponivel" | "servico_indisponivel";

export async function moverPelaEquipe(
  agenda: RepositorioAgenda,
  relogio: Relogio,
  pedido: { id: string; inicio: Date },
): Promise<{ ok: true; inicio: Date; fim: Date } | { ok: false; erro: FalhaDaEquipe }> {
  const detalhe = await agenda.buscarAgendamento(pedido.id);
  if (!detalhe) return { ok: false, erro: "nao_encontrado" };
  if (detalhe.estado !== "confirmado") return { ok: false, erro: "estado_invalido" };

  const duracoes = detalhe.itens.map((item) => item.duracaoMinutos);
  const fim = fimDoAgendamento(pedido.inicio, duracoes);
  const cabe = await cabeNoExpediente(agenda, relogio, {
    barbeiroId: detalhe.barbeiroId,
    inicio: pedido.inicio,
    duracaoMinutos: duracoes.reduce((soma, minutos) => soma + minutos, 0),
    excetoId: detalhe.id,
  });
  if (!cabe) return { ok: false, erro: "horario_indisponivel" };

  try {
    await agenda.reagendarAgendamento(detalhe.id, pedido.inicio, fim);
  } catch (erro) {
    if (ehConflito(erro)) return { ok: false, erro: "horario_indisponivel" };
    throw erro;
  }
  return { ok: true, inicio: pedido.inicio, fim };
}

export async function alterarServicosPelaEquipe(
  agenda: RepositorioAgenda,
  relogio: Relogio,
  pedido: { id: string; servicoIds: string[] },
): Promise<{ ok: true; fim: Date } | { ok: false; erro: FalhaDaEquipe }> {
  const detalhe = await agenda.buscarAgendamento(pedido.id);
  if (!detalhe) return { ok: false, erro: "nao_encontrado" };
  if (detalhe.estado !== "confirmado") return { ok: false, erro: "estado_invalido" };

  const unicos = [...new Set(pedido.servicoIds)];
  const servicos = await agenda.servicosPorIds(unicos);
  if (servicos.length !== unicos.length || servicos.some((servico) => !servico.ativo)) {
    return { ok: false, erro: "servico_indisponivel" };
  }
  const porId = new Map(servicos.map((servico) => [servico.id, servico]));
  const escolhidos = pedido.servicoIds.map((id) => porId.get(id)!);
  const itens: ItemAgendamento[] = escolhidos.map((servico) => ({
    servicoId: servico.id,
    nome: servico.nome,
    duracaoMinutos: servico.duracaoMinutos,
    precoCentavos: servico.precoCentavos,
  }));
  const duracao = itens.reduce((soma, item) => soma + item.duracaoMinutos, 0);
  const fim = fimDoAgendamento(detalhe.inicio, itens.map((item) => item.duracaoMinutos));
  const cabe = await cabeNoExpediente(agenda, relogio, {
    barbeiroId: detalhe.barbeiroId,
    inicio: detalhe.inicio,
    duracaoMinutos: duracao,
    excetoId: detalhe.id,
  });
  if (!cabe) return { ok: false, erro: "horario_indisponivel" };
  await agenda.substituirItens(detalhe.id, itens, fim);
  return { ok: true, fim };
}

async function cabeNoExpediente(
  agenda: RepositorioAgenda,
  relogio: Relogio,
  pedido: { barbeiroId: string; inicio: Date; duracaoMinutos: number; excetoId: string },
) {
  const dia = diaCivil(pedido.inicio);
  const janela = limitesDoDia(dia);
  const [faixas, ocupados, bloqueios] = await Promise.all([
    agenda.expediente(pedido.barbeiroId, diaDaSemanaIso(dia)),
    agenda.ocupados(pedido.barbeiroId, janela.inicio, janela.fim, pedido.excetoId),
    agenda.indisponibilidades(pedido.barbeiroId, janela.inicio, janela.fim),
  ]);
  return horariosLivres({
    dia,
    duracaoMinutos: pedido.duracaoMinutos,
    faixas,
    ocupados,
    indisponibilidades: bloqueios,
    agora: relogio.agora(),
    origem: "equipe",
  }).some((horario) => horario.getTime() === pedido.inicio.getTime());
}

function diaCivil(instante: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instante);
}

function ehConflito(erro: unknown): boolean {
  return typeof erro === "object" && erro !== null && "code" in erro && (erro as { code?: string }).code === "23P01";
}
