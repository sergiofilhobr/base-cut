import type { Cobrancas, RepositorioCaixa } from "../ports/caixa.ts";

export async function cobrarSinal(
  caixa: RepositorioCaixa,
  cobrancas: Cobrancas,
  pedido: {
    agendamentoId: string;
    clienteId: string;
    valorCentavos: number;
    meio: "pix" | "cartao";
  },
) {
  if (pedido.valorCentavos <= 0) return { ok: false as const, erro: "valor_invalido" as const };
  const cobranca = await cobrancas.criar({
    valorCentavos: pedido.valorCentavos,
    meio: pedido.meio,
    descricao: `Sinal Base Cut ${pedido.agendamentoId}`,
  });
  const pagamento = await caixa.gravarPagamento({
    atendimentoId: null,
    agendamentoId: pedido.agendamentoId,
    clienteId: pedido.clienteId,
    meio: pedido.meio,
    valorCentavos: pedido.valorCentavos,
    situacao: cobranca.situacao,
    origem: "sinal",
    provedorId: cobranca.provedorId,
  });
  return { ok: true as const, pagamentoId: pagamento.id, provedorId: cobranca.provedorId };
}
