import type { RepositorioAgenda } from "../ports/agenda.ts";
import type { Mensageiro, RepositorioMensagens, TipoMensagem } from "../ports/mensagens.ts";
import type { Relogio } from "../ports/relogio.ts";

const HORA = 60 * 60 * 1000;

export async function avisarMarcacao(
  mensagens: RepositorioMensagens,
  mensageiro: Mensageiro,
  pedido: {
    id: string;
    nome: string;
    telefone: string;
    inicio: Date;
    telefoneDoBruno: string | undefined;
    urlDoSite: string;
  },
) {
  const quando = formatarQuando(pedido.inicio);
  await enviar(mensagens, mensageiro, {
    agendamentoId: pedido.id,
    tipo: "confirmacao",
    para: pedido.telefone,
    texto: `Base Cut: ${pedido.nome}, seu horário está confirmado para ${quando}.`,
  });
  if (!pedido.telefoneDoBruno) return;
  await enviar(mensagens, mensageiro, {
    agendamentoId: pedido.id,
    tipo: "aviso_bruno",
    para: pedido.telefoneDoBruno,
    texto: `Novo horário: ${pedido.nome}, ${quando}, ${pedido.telefone}.`,
  });
}

export async function dispararLembretes(
  agenda: RepositorioAgenda,
  mensagens: RepositorioMensagens,
  mensageiro: Mensageiro,
  relogio: Relogio,
  opcoes: { urlDoSite: string },
) {
  if (!(await mensagens.canalAtivo())) return;
  const barbeiro = await agenda.barbeiroAtivo();
  if (!barbeiro) return;
  const agora = relogio.agora();
  const linhas = await agenda.listarAgenda(barbeiro.id, agora, new Date(agora.getTime() + 26 * HORA));

  for (const linha of linhas) {
    if (linha.estado !== "confirmado") continue;
    const falta = linha.inicio.getTime() - agora.getTime();
    if (falta <= 25 * HORA && falta >= 22 * HORA) {
      await enviar(mensagens, mensageiro, {
        agendamentoId: linha.id,
        tipo: "lembrete_24h",
        para: linha.telefone,
        texto: `Base Cut: amanhã você tem horário às ${formatarHora(linha.inicio)}. Para cancelar: ${opcoes.urlDoSite}/agendamento/${linha.id}`,
      });
    }
    if (falta <= 2.5 * HORA && falta >= 1.5 * HORA) {
      await enviar(mensagens, mensageiro, {
        agendamentoId: linha.id,
        tipo: "lembrete_2h",
        para: linha.telefone,
        texto: `Base Cut: seu horário é às ${formatarHora(linha.inicio)}. Responda para avisar presença. Se não responder, o horário continua seu.`,
      });
    }
  }
}

export async function enviar(
  mensagens: RepositorioMensagens,
  mensageiro: Mensageiro,
  pedido: { agendamentoId: string; tipo: TipoMensagem; para: string; texto: string },
) {
  if (!(await mensagens.canalAtivo())) return { enviado: false as const };
  if (await mensagens.jaEnviada(pedido.agendamentoId, pedido.tipo)) return { enviado: false as const };
  const resultado = await mensageiro.enviar({ para: pedido.para, texto: pedido.texto });
  if (!resultado.ok) {
    if (resultado.banido) await mensagens.desligarCanal();
    return { enviado: false as const };
  }
  await mensagens.registrar(pedido.agendamentoId, pedido.tipo);
  return { enviado: true as const };
}

function formatarQuando(inicio: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(inicio);
}

function formatarHora(inicio: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(inicio);
}

