import { totalDoAtendimento, type ItemDeConta } from "../domain/caixa/total.ts";
import type { RepositorioCaixa } from "../ports/caixa.ts";

export async function fecharAtendimento(
  caixa: RepositorioCaixa,
  pedido: {
    agendamentoId: string | null;
    clienteId: string;
    servicos: ItemDeConta[];
    produtos: Array<{ produtoId: string; quantidade: number }>;
    descontoCentavos: number;
    gorjetaCentavos: number;
    pagamento?: { meio: "pix" | "cartao" | "dinheiro" | "vale"; valorCentavos: number } | null;
  },
) {
  const itens = [...pedido.servicos];
  for (const pedidoProduto of pedido.produtos) {
    const produto = await caixa.produto(pedidoProduto.produtoId);
    if (!produto || produto.estoque < pedidoProduto.quantidade) {
      return { ok: false as const, erro: "sem_estoque" as const };
    }
    itens.push({
      tipo: "produto",
      nome: produto.nome,
      quantidade: pedidoProduto.quantidade,
      precoCentavos: produto.precoCentavos,
      referenciaId: produto.id,
    });
  }

  const total = totalDoAtendimento(itens, pedido.descontoCentavos, pedido.gorjetaCentavos);
  if (!total.ok) return total;

  for (const item of itens) {
    if (item.tipo !== "produto" || !item.referenciaId) continue;
    const baixou = await caixa.baixarEstoque(item.referenciaId, item.quantidade);
    if (!baixou) return { ok: false as const, erro: "sem_estoque" as const };
  }

  const atendimento = await caixa.gravarAtendimento({
    agendamentoId: pedido.agendamentoId,
    clienteId: pedido.clienteId,
    descontoCentavos: pedido.descontoCentavos,
    gorjetaCentavos: pedido.gorjetaCentavos,
    totalCentavos: total.total,
    itens,
  });

  if (pedido.pagamento) {
    if (pedido.pagamento.meio === "vale") {
      return { ok: false as const, erro: "vale_no_pagamento" as const };
    }
    await caixa.gravarPagamento({
      atendimentoId: atendimento.id,
      agendamentoId: pedido.agendamentoId,
      clienteId: pedido.clienteId,
      meio: pedido.pagamento.meio,
      valorCentavos: pedido.pagamento.valorCentavos,
      situacao: "pago",
      origem: "cadeira",
      provedorId: null,
    });
  }

  return { ok: true as const, atendimento };
}

export function comprovante(atendimento: {
  id: string;
  totalCentavos: number;
  descontoCentavos: number;
  gorjetaCentavos: number;
  itens: ItemDeConta[];
}) {
  const linhas = atendimento.itens.map(
    (item) => `${item.quantidade} ${item.nome} — ${(item.precoCentavos * item.quantidade) / 100}`,
  );
  return [
    "Base Cut",
    ...linhas,
    `Desconto: ${atendimento.descontoCentavos / 100}`,
    `Gorjeta: ${atendimento.gorjetaCentavos / 100}`,
    `Total: ${atendimento.totalCentavos / 100}`,
    atendimento.id,
  ].join("\n");
}
