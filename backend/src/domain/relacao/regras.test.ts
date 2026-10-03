import assert from "node:assert/strict";
import test from "node:test";
import {
  aplicarCupom,
  podeReceberCampanha,
  pontosDaVisita,
  proximaRecorrencia,
  relatorioCsv,
  resumirRelatorio,
} from "./regras.ts";

test("cupom reduz o total e o opt-out fica fora da campanha", () => {
  assert.deepEqual(aplicarCupom(5000, 1000), { ok: true, total: 4000 });
  assert.equal(podeReceberCampanha(false), false);
  assert.equal(podeReceberCampanha(true), true);
});

test("a visita gera um ponto a cada dez reais", () => {
  assert.equal(pontosDaVisita(8200), 8);
});

test("a recorrência cai no próximo dia da semana pedido", () => {
  const proxima = proximaRecorrencia(1, "10:00", new Date("2026-10-03T12:00:00-03:00"));
  assert.equal(proxima?.toISOString(), "2026-10-05T13:00:00.000Z");
});

test("o CSV traz faturamento, ocupação, falta, novos e recorrentes", () => {
  const csv = relatorioCsv(
    resumirRelatorio([
      { estado: "concluido", totalCentavos: 5000, clienteNovo: true },
      { estado: "falta", totalCentavos: 0, clienteNovo: false },
      { estado: "concluido", totalCentavos: 3000, clienteNovo: false },
    ]),
  );
  assert.match(csv, /faturamento_centavos,ocupados,faltas,novos,recorrentes/);
  assert.match(csv, /8000,2,1,1,2/);
});
