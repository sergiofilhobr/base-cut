import assert from "node:assert/strict";
import test from "node:test";
import { totalDoAtendimento } from "./total.ts";

test("fecha com serviço, produto, desconto e gorjeta", () => {
  const resultado = totalDoAtendimento(
    [
      { tipo: "servico", nome: "CORTE", quantidade: 1, precoCentavos: 5000 },
      { tipo: "produto", nome: "Pomada", quantidade: 2, precoCentavos: 3000 },
    ],
    1000,
    500,
  );
  assert.deepEqual(resultado, { ok: true, total: 10500 });
});

test("desconto maior que a conta não fecha", () => {
  const resultado = totalDoAtendimento(
    [{ tipo: "servico", nome: "CORTE", quantidade: 1, precoCentavos: 5000 }],
    6000,
    0,
  );
  assert.deepEqual(resultado, { ok: false, erro: "valor_invalido" });
});
