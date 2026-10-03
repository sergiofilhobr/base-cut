import assert from "node:assert/strict";
import test from "node:test";
import type { Produto, RepositorioCaixa } from "../ports/caixa.ts";
import { comprovante, fecharAtendimento } from "./fechar-atendimento.ts";

function caixaCom(produto: Produto) {
  let estoque = produto.estoque;
  const pagamentos: unknown[] = [];
  const caixa = {
    pagamentos,
    async produto() {
      return { ...produto, estoque };
    },
    async baixarEstoque(_id: string, quantidade: number) {
      if (estoque < quantidade) return false;
      estoque -= quantidade;
      return true;
    },
    async gravarAtendimento(dados: { totalCentavos: number; itens: unknown[] }) {
      return {
        id: "at-1",
        clienteId: "joao",
        totalCentavos: dados.totalCentavos,
        itens: dados.itens,
        descontoCentavos: 0,
        gorjetaCentavos: 0,
      };
    },
    async gravarPagamento(dados: unknown) {
      pagamentos.push(dados);
      return { id: "pg-1" };
    },
  };
  return caixa as unknown as RepositorioCaixa & { pagamentos: unknown[] };
}

test("sem estoque não fecha e não grava pagamento", async () => {
  const caixa = caixaCom({ id: "pomada", nome: "Pomada", precoCentavos: 3000, estoque: 0 });
  const resultado = await fecharAtendimento(caixa, {
    agendamentoId: null,
    clienteId: "joao",
    servicos: [],
    produtos: [{ produtoId: "pomada", quantidade: 1 }],
    descontoCentavos: 0,
    gorjetaCentavos: 0,
  });
  assert.deepEqual(resultado, { ok: false, erro: "sem_estoque" });
  assert.equal(caixa.pagamentos.length, 0);
});

test("pagamento na cadeira fica registrado e o comprovante lista o total", async () => {
  const caixa = caixaCom({ id: "pomada", nome: "Pomada", precoCentavos: 3000, estoque: 2 });
  const resultado = await fecharAtendimento(caixa, {
    agendamentoId: "ag-1",
    clienteId: "joao",
    servicos: [{ tipo: "servico", nome: "CORTE", quantidade: 1, precoCentavos: 5000 }],
    produtos: [{ produtoId: "pomada", quantidade: 1 }],
    descontoCentavos: 0,
    gorjetaCentavos: 200,
    pagamento: { meio: "dinheiro", valorCentavos: 8200 },
  });
  assert.equal(resultado.ok, true);
  if (!resultado.ok) return;
  assert.equal(resultado.atendimento.totalCentavos, 8200);
  assert.equal(caixa.pagamentos.length, 1);
  assert.match(comprovante(resultado.atendimento), /Total: 82/);
});
