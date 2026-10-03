import type { Cobrancas } from "../../ports/caixa.ts";

/** Sem token, o sinal fica pendente na casa. Com Mercado Pago, abre a cobrança. */
export function criarCobrancas(token: string | undefined): Cobrancas {
  return {
    async criar(pedido) {
      if (!token) return { provedorId: `local-${pedido.meio}`, situacao: "pendente" };
      const resposta = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
          "x-idempotency-key": `${pedido.descricao}-${pedido.valorCentavos}`,
        },
        body: JSON.stringify({
          transaction_amount: pedido.valorCentavos / 100,
          description: pedido.descricao,
          payment_method_id: pedido.meio === "pix" ? "pix" : "visa",
        }),
      });
      if (!resposta.ok) return { provedorId: `local-${pedido.meio}`, situacao: "pendente" };
      const dados = (await resposta.json()) as { id?: number | string };
      return { provedorId: String(dados.id ?? `mp-${pedido.meio}`), situacao: "pendente" };
    },
  };
}
