import assert from "node:assert/strict";
import test from "node:test";
import { lerCsvBooksy } from "./booksy.ts";

test("lê nome, telefone e e-mail do CSV do Booksy", () => {
  const csv = ["name,phone,email", "Ana,(47) 99999-0001,ana@email.com", "Sem fone,abc,"].join("\n");
  const linhas = lerCsvBooksy(csv);
  assert.equal(linhas.length, 1);
  assert.deepEqual(linhas[0], {
    nome: "Ana",
    telefone: "47999990001",
    email: "ana@email.com",
  });
});
