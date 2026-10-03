import {
  diaDaSemanaIso,
  horariosLivres,
  limitesDoDia,
} from "../domain/agenda/horarios-livres.ts";
import { fimDoAgendamento } from "../domain/agenda/regras.ts";
import type { Relogio } from "../ports/relogio.ts";
import type { AgendamentoGravado, RepositorioAgenda } from "../ports/agenda.ts";

export type FalhaAoMarcar =
  | "sem_barbeiro"
  | "servico_indisponivel"
  | "email_de_outra_ficha"
  | "horario_indisponivel";

export type PedidoDeAgendamento = {
  servicoIds: string[];
  inicio: Date;
  nome: string;
  telefone: string;
  email: string;
  origem: "site" | "equipe";
  barbeiroId?: string;
};

export async function marcarAgendamento(
  agenda: RepositorioAgenda,
  relogio: Relogio,
  pedido: PedidoDeAgendamento,
): Promise<{ ok: true; agendamento: AgendamentoGravado } | { ok: false; erro: FalhaAoMarcar }> {
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
  const escolhidos = pedido.servicoIds.map((id) => porId.get(id)!);
  const duracao = escolhidos.reduce((soma, servico) => soma + servico.duracaoMinutos, 0);
  const fim = fimDoAgendamento(pedido.inicio, escolhidos.map((servico) => servico.duracaoMinutos));
  const dia = diaCivil(pedido.inicio);
  const janela = limitesDoDia(dia);
  const [faixas, ocupados, bloqueios, porTelefone, porEmail] = await Promise.all([
    agenda.expediente(barbeiro.id, diaDaSemanaIso(dia)),
    agenda.ocupados(barbeiro.id, janela.inicio, janela.fim),
    agenda.indisponibilidades(barbeiro.id, janela.inicio, janela.fim),
    agenda.clientePorTelefone(pedido.telefone),
    agenda.clientePorEmail(pedido.email),
  ]);

  if (porEmail && porEmail.id !== porTelefone?.id) {
    return { ok: false, erro: "email_de_outra_ficha" };
  }

  const livres = horariosLivres({
    dia,
    duracaoMinutos: duracao,
    faixas,
    ocupados,
    indisponibilidades: bloqueios,
    agora: relogio.agora(),
    origem: pedido.origem,
  });
  if (!livres.some((horario) => horario.getTime() === pedido.inicio.getTime())) {
    return { ok: false, erro: "horario_indisponivel" };
  }

  try {
    const agendamento = await agenda.gravarAgendamento({
      barbeiroId: barbeiro.id,
      cliente: porTelefone
        ? { id: porTelefone.id }
        : { nome: pedido.nome, telefone: pedido.telefone, email: pedido.email },
      inicio: pedido.inicio,
      fim,
      origem: pedido.origem,
      itens: escolhidos.map((servico) => ({
        servicoId: servico.id,
        nome: servico.nome,
        duracaoMinutos: servico.duracaoMinutos,
        precoCentavos: servico.precoCentavos,
      })),
    });
    return { ok: true, agendamento };
  } catch (erro) {
    if (ehConflitoDeHorario(erro)) return { ok: false, erro: "horario_indisponivel" };
    throw erro;
  }
}

function diaCivil(instante: Date): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instante);
  return partes;
}

function ehConflitoDeHorario(erro: unknown): boolean {
  return (
    typeof erro === "object" &&
    erro !== null &&
    "code" in erro &&
    (erro as { code?: string }).code === "23P01"
  );
}
