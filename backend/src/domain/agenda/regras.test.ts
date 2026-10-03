import assert from "node:assert/strict";
import test from "node:test";
import {
  fimDoAgendamento,
  ocupaAgenda,
  podeCancelarPeloCliente,
} from "./regras.ts";

test("só confirmado ocupa a agenda", () => {
  assert.equal(ocupaAgenda("confirmado"), true);
  assert.equal(ocupaAgenda("cancelado_pelo_cliente"), false);
  assert.equal(ocupaAgenda("falta"), false);
});

test("cliente cancela com mais de 2 horas", () => {
  const inicio = new Date("2026-10-03T15:00:00-03:00");
  const faltandoMaisDeDuasHoras = new Date("2026-10-03T12:59:00-03:00");
  const emExatasDuasHoras = new Date("2026-10-03T13:00:00-03:00");

  assert.equal(podeCancelarPeloCliente(faltandoMaisDeDuasHoras, inicio), true);
  assert.equal(podeCancelarPeloCliente(emExatasDuasHoras, inicio), false);
});

test("o fim é a soma das durações", () => {
  const inicio = new Date("2026-10-03T15:00:00-03:00");
  const fim = fimDoAgendamento(inicio, [45, 20]);
  assert.equal(fim.toISOString(), "2026-10-03T19:05:00.000Z");
});
