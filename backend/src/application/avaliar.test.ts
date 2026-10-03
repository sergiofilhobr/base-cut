import assert from "node:assert/strict";
import test from "node:test";
import { avaliacaoNova } from "./avaliar.ts";

test("a avaliação nasce sem publicar", () => {
  const resultado = avaliacaoNova({ nota: 5, texto: "Corte certo." });
  assert.equal(resultado.ok, true);
  if (!resultado.ok) return;
  assert.equal(resultado.avaliacao.publicada, false);
});
