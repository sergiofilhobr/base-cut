import {
  diaDaSemanaIso,
  horariosLivres,
  limitesDoDia,
} from "../domain/agenda/horarios-livres.ts";
import type { Relogio } from "../ports/relogio.ts";
import type { RepositorioAgenda } from "../ports/agenda.ts";

export async function listarHorarios(
  agenda: RepositorioAgenda,
  relogio: Relogio,
  pedido: { dia: string; servicoIds: string[]; barbeiroId?: string },
): Promise<
  | { ok: true; duracaoMinutos: number; horarios: Date[] }
  | { ok: false; erro: "sem_barbeiro" | "servico_indisponivel" }
> {
  const barbeiro = pedido.barbeiroId
    ? await agenda.barbeiroPorId(pedido.barbeiroId)
    : await agenda.barbeiroAtivo();
  if (!barbeiro) return { ok: false, erro: "sem_barbeiro" };

  const unicos = [...new Set(pedido.servicoIds)];
  const servicos = await agenda.servicosPorIds(unicos);
  if (servicos.length !== unicos.length || servicos.some((servico) => !servico.ativo)) {
    return { ok: false, erro: "servico_indisponivel" };
  }

  const porId = new Map(servicos.map((servico) => [servico.id, servico]));
  const duracaoMinutos = pedido.servicoIds.reduce(
    (soma, id) => soma + porId.get(id)!.duracaoMinutos,
    0,
  );
  const janela = limitesDoDia(pedido.dia);
  const [faixas, ocupados, bloqueios] = await Promise.all([
    agenda.expediente(barbeiro.id, diaDaSemanaIso(pedido.dia)),
    agenda.ocupados(barbeiro.id, janela.inicio, janela.fim),
    agenda.indisponibilidades(barbeiro.id, janela.inicio, janela.fim),
  ]);

  return {
    ok: true,
    duracaoMinutos,
    horarios: horariosLivres({
      dia: pedido.dia,
      duracaoMinutos,
      faixas,
      ocupados,
      indisponibilidades: bloqueios,
      agora: relogio.agora(),
      origem: "site",
    }),
  };
}
