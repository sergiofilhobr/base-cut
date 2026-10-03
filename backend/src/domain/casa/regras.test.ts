import assert from "node:assert/strict";
import test from "node:test";
import { cabeNaLista, papelDe, servicosVisiveis, valorDoRepasse } from "./regras.ts";

test("admin, barbeiro e recepção têm papel; o resto continua membro", () => {
  assert.equal(papelDe("org:admin"), "admin");
  assert.equal(papelDe("org:barbeiro"), "barbeiro");
  assert.equal(papelDe("org:recepcao"), "recepcao");
  assert.equal(papelDe("org:member"), "membro");
});

test("o repasse é a parte do faturamento e a lista para quando enche", () => {
  assert.deepEqual(valorDoRepasse(10000, 40), { ok: true, centavos: 4000 });
  assert.equal(cabeNaLista(8, 8), false);
  assert.equal(cabeNaLista(7, 8), true);
});

test("sem serviço ligado o barbeiro oferece o catálogo inteiro", () => {
  const todos = [{ id: "corte" }, { id: "barba" }];
  assert.deepEqual(servicosVisiveis(todos, []), todos);
  assert.deepEqual(servicosVisiveis(todos, ["barba"]), [{ id: "barba" }]);
});
