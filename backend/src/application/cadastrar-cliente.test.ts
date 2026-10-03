import assert from "node:assert/strict";
import test from "node:test";
import type { Cliente, RepositorioAgenda } from "../ports/agenda.ts";
import { cadastrarCliente } from "./cadastrar-cliente.ts";

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
    async clientePorTelefone(telefone: string) {
      return fichas.find((ficha) => ficha.telefone === telefone) ?? null;
    },
    async vincularClerk(clienteId: string, clerkUserId: string) {
      const ficha = fichas.find((item) => item.id === clienteId);
      if (ficha) ficha.clerkUserId = clerkUserId;
    },
    async atualizarCliente(clienteId: string, dados: { nome?: string; email?: string | null }) {
      const ficha = fichas.find((item) => item.id === clienteId);
      if (ficha) Object.assign(ficha, dados);
    },
    async criarCliente(dados: { nome: string; telefone: string; email: string | null }) {
      const ficha: Cliente = { id: `c${fichas.length + 1}`, clerkUserId: null, ...dados };
      fichas.push(ficha);
      return ficha;
    },
  } as unknown as RepositorioAgenda & { fichas: Cliente[] };
}

const pedido = {
  clerkUserId: "user_1",
  email: "Joao@email.com",
  nome: "João",
  telefone: "(47) 99999-9999",
  consentimento: true,
};

test("sem ficha, o cadastro cria uma e liga ao usuário", async () => {
  const agenda = agendaCom([]);
  const resultado = await cadastrarCliente(agenda, pedido);
  assert.deepEqual(resultado, { ok: true, clienteId: "c1", novo: true });
  assert.deepEqual(agenda.fichas[0], {
    id: "c1",
    nome: "João",
    telefone: "47999999999",
    email: "joao@email.com",
    clerkUserId: "user_1",
  });
});

test("a ficha que nasceu na marcação, com o mesmo e-mail, é ligada e não duplicada", async () => {
  const agenda = agendaCom([
    { id: "joao", nome: "Joao", telefone: "47999999999", email: "joao@email.com", clerkUserId: null },
  ]);
  const resultado = await cadastrarCliente(agenda, pedido);
  assert.deepEqual(resultado, { ok: true, clienteId: "joao", novo: false });
  assert.equal(agenda.fichas.length, 1);
  assert.equal(agenda.fichas[0]?.clerkUserId, "user_1");
  assert.equal(agenda.fichas[0]?.nome, "João");
});

test("telefone com ficha sem e-mail ganha o e-mail do Clerk", async () => {
  const agenda = agendaCom([
    { id: "joao", nome: "João", telefone: "47999999999", email: null, clerkUserId: null },
  ]);
  const resultado = await cadastrarCliente(agenda, pedido);
  assert.deepEqual(resultado, { ok: true, clienteId: "joao", novo: false });
  assert.equal(agenda.fichas[0]?.email, "joao@email.com");
});

test("o e-mail que já está em outro telefone é recusado", async () => {
  const agenda = agendaCom([
    { id: "outro", nome: "Outro", telefone: "47988888888", email: "joao@email.com", clerkUserId: null },
  ]);
  const resultado = await cadastrarCliente(agenda, pedido);
  assert.deepEqual(resultado, { ok: false, erro: "email_de_outra_ficha" });
  assert.equal(agenda.fichas.length, 1);
});

test("o telefone que já tem ficha com outro e-mail é recusado", async () => {
  const agenda = agendaCom([
    { id: "joao", nome: "João", telefone: "47999999999", email: "antigo@email.com", clerkUserId: null },
  ]);
  const resultado = await cadastrarCliente(agenda, pedido);
  assert.deepEqual(resultado, { ok: false, erro: "telefone_de_outra_ficha" });
  assert.equal(agenda.fichas[0]?.clerkUserId, null);
});

test("sem consentimento não grava", async () => {
  const agenda = agendaCom([]);
  const resultado = await cadastrarCliente(agenda, { ...pedido, consentimento: false });
  assert.deepEqual(resultado, { ok: false, erro: "sem_consentimento" });
  assert.equal(agenda.fichas.length, 0);
});

test("quem já está ligado não cadastra de novo", async () => {
  const agenda = agendaCom([
    { id: "joao", nome: "João", telefone: "47999999999", email: "joao@email.com", clerkUserId: "user_1" },
  ]);
  const resultado = await cadastrarCliente(agenda, { ...pedido, telefone: "47900000000" });
  assert.deepEqual(resultado, { ok: true, clienteId: "joao", novo: false });
  assert.equal(agenda.fichas[0]?.telefone, "47999999999");
});
