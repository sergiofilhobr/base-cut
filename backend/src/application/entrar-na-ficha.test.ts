import assert from "node:assert/strict";
import test from "node:test";
import type { Cliente, RepositorioAgenda } from "../ports/agenda.ts";
import { entrarNaFicha } from "./entrar-na-ficha.ts";

function agendaCom(inicial: Cliente[]) {
  const fichas = inicial.map((ficha) => ({ ...ficha }));
  return {
    fichas,
    async clientePorClerk(clerkUserId: string) {
      return fichas.find((ficha) => ficha.clerkUserId === clerkUserId) ?? null;
    },
    async clientePorEmail(email: string) {
      return fichas.find((ficha) => ficha.email === email) ?? null;
    },
    async vincularClerk(clienteId: string, clerkUserId: string) {
      const ficha = fichas.find((item) => item.id === clienteId);
      if (ficha) ficha.clerkUserId = clerkUserId;
    },
  } as unknown as RepositorioAgenda & { fichas: Cliente[] };
}

const joao: Cliente = {
  id: "joao",
  nome: "João",
  telefone: "47999999999",
  email: "joao@email.com",
  clerkUserId: null,
};

test("a primeira entrada liga o usuário do Clerk à ficha do e-mail", async () => {
  const agenda = agendaCom([joao]);
  const resultado = await entrarNaFicha(agenda, {
    clerkUserId: "user_1",
    email: "Joao@email.com",
  });
  assert.deepEqual(resultado, { ok: true, clienteId: "joao" });
  assert.equal(agenda.fichas[0]?.clerkUserId, "user_1");
});

test("quem não tem ficha não vira cliente", async () => {
  const agenda = agendaCom([]);
  const resultado = await entrarNaFicha(agenda, {
    clerkUserId: "user_2",
    email: "novo@email.com",
  });
  assert.deepEqual(resultado, { ok: false, erro: "ficha_inexistente" });
  assert.equal(agenda.fichas.length, 0);
});

test("a segunda entrada acha a ficha pelo usuário, sem criar outra", async () => {
  const agenda = agendaCom([{ ...joao, clerkUserId: "user_1" }]);
  const resultado = await entrarNaFicha(agenda, {
    clerkUserId: "user_1",
    email: "joao@email.com",
  });
  assert.deepEqual(resultado, { ok: true, clienteId: "joao" });
  assert.equal(agenda.fichas.length, 1);
});
