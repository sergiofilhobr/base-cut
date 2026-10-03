import { podeCancelarPeloCliente } from "../domain/agenda/regras.ts";
import type { RepositorioAgenda } from "../ports/agenda.ts";
import type { Interpretador } from "../ports/interpretador.ts";
import type { Mensageiro, RepositorioMensagens } from "../ports/mensagens.ts";
import type { Relogio } from "../ports/relogio.ts";

export async function responderLembrete(
  agenda: RepositorioAgenda,
  mensagens: RepositorioMensagens,
  mensageiro: Mensageiro,
  interpretador: Interpretador,
  relogio: Relogio,
  pedido: { telefone: string; texto: string; urlDoSite: string },
): Promise<{ intencao: string; resposta: string | null }> {
  const intencao = await interpretador.interpretar(pedido.texto);
  const agendamento = await agenda.proximoConfirmado(pedido.telefone, relogio.agora());
  if (!agendamento) {
    return {
      intencao,
      resposta: await falar(mensagens, mensageiro, pedido.telefone, null),
    };
  }

  if (intencao === "presenca") {
    await agenda.marcarPresenca(agendamento.id, relogio.agora());
    return {
      intencao,
      resposta: await falar(
        mensagens,
        mensageiro,
        pedido.telefone,
        "Base Cut: presença anotada. O horário continua o mesmo.",
      ),
    };
  }

  if (intencao === "cancelar") {
    if (!podeCancelarPeloCliente(relogio.agora(), agendamento.inicio)) {
      return {
        intencao,
        resposta: await falar(
          mensagens,
          mensageiro,
          pedido.telefone,
          "Base Cut: faltam 2 horas ou menos. O horário continua seu.",
        ),
      };
    }
    await agenda.cancelarAgendamento(agendamento.id, "cancelado_pelo_cliente");
    return {
      intencao,
      resposta: await falar(mensagens, mensageiro, pedido.telefone, "Base Cut: horário cancelado."),
    };
  }

  if (intencao === "outro_horario") {
    return {
      intencao,
      resposta: await falar(
        mensagens,
        mensageiro,
        pedido.telefone,
        `Para outro horário: ${pedido.urlDoSite}/agendar`,
      ),
    };
  }

  return {
    intencao,
    resposta: await falar(
      mensagens,
      mensageiro,
      pedido.telefone,
      `Não entendi. Para outro horário: ${pedido.urlDoSite}/agendar`,
    ),
  };
}

async function falar(
  mensagens: RepositorioMensagens,
  mensageiro: Mensageiro,
  telefone: string,
  texto: string | null,
) {
  if (!texto || !(await mensagens.canalAtivo())) return null;
  const resultado = await mensageiro.enviar({ para: telefone, texto });
  if (!resultado.ok && resultado.banido) await mensagens.desligarCanal();
  if (!resultado.ok) return null;
  return texto;
}
