import assert from "node:assert/strict";
import test from "node:test";
import type { Cliente, RepositorioAgenda } from "../../ports/agenda.ts";
import type { Autenticacao } from "../../ports/autenticacao.ts";
import type { Banco } from "../../ports/banco.ts";
import type { Cobrancas, RepositorioCaixa } from "../../ports/caixa.ts";
import type { Mensageiro, RepositorioMensagens } from "../../ports/mensagens.ts";
import type { Interpretador } from "../../ports/interpretador.ts";
import { criarAplicacao } from "./app.ts";
import type { RepositorioCasa } from "../persistencia/casa-postgres.ts";
import type { RepositorioRelacao } from "../persistencia/relacao-postgres.ts";

const ana: Cliente = {
  id: "ana",
  nome: "Ana",
  telefone: "47911111111",
  email: "ana@email.com",
  clerkUserId: "user-a",
};
const bia: Cliente = {
  id: "bia",
  nome: "Bia",
  telefone: "47922222222",
  email: "bia@email.com",
  clerkUserId: "user-b",
};

function cenario() {
  const anonimizados: string[] = [];
  const optIns: Array<{ id: string; optIn: boolean }> = [];
  const agenda = {
    async clientePorClerk(userId: string) {
      if (userId === ana.clerkUserId) return ana;
      if (userId === bia.clerkUserId) return bia;
      return null;
    },
    async agendamentosDoCliente(id: string) {
      return [{ id: `ag-${id}`, inicio: new Date("2026-10-06T15:00:00Z"), fim: new Date("2026-10-06T15:45:00Z"), estado: "confirmado" as const }];
    },
    async listarAuditoria() {
      return [];
    },
    async registrarAuditoria() {},
    async anonimizarCliente(id: string) {
      anonimizados.push(id);
    },
  } as unknown as RepositorioAgenda;
  const relacao = {
    async definirOptIn(id: string, optIn: boolean) {
      optIns.push({ id, optIn });
    },
  } as unknown as RepositorioRelacao;
  const autenticacao: Autenticacao = {
    async membro() {
      return null;
    },
    async cliente(authorization) {
      if (authorization === "Bearer a") return { userId: "user-a", email: ana.email ?? "" };
      if (authorization === "Bearer b") return { userId: "user-b", email: bia.email ?? "" };
      return null;
    },
  };
  const mensagens: RepositorioMensagens = {
    async canalAtivo() {
      return false;
    },
    async desligarCanal() {},
    async jaEnviada() {
      return false;
    },
    async registrar() {},
  };
  const mensageiro: Mensageiro = {
    async enviar() {
      return { ok: true };
    },
  };
  const interpretador: Interpretador = {
    async interpretar() {
      return "desconhecida";
    },
  };
  const app = criarAplicacao({
    banco: {} as Banco,
    relogio: { agora: () => new Date("2026-10-06T12:00:00Z") },
    agenda,
    autenticacao,
    mensagens,
    mensageiro,
    interpretador,
    telefoneDoBruno: undefined,
    urlDoSite: "http://localhost:3000",
    caixa: {} as RepositorioCaixa,
    cobrancas: {} as Cobrancas,
    relacao,
    casa: {} as RepositorioCasa,
    urlGoogle: "https://example.test",
  });
  return { app, anonimizados, optIns };
}

test("sem sessão, telefone e e-mail não exportam nem excluem", async () => {
  const { app, anonimizados } = cenario();
  const corpo = JSON.stringify({ telefone: ana.telefone, email: ana.email });
  const exportar = await app.request("/api/privacidade/exportar", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: corpo,
  });
  const excluir = await app.request("/api/privacidade/excluir", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: corpo,
  });
  assert.equal(exportar.status, 401);
  assert.equal(excluir.status, 401);
  assert.deepEqual(anonimizados, []);
});

test("a sessão da Ana exporta só a ficha da Ana", async () => {
  const { app } = cenario();
  const resposta = await app.request("/api/privacidade/exportar", {
    method: "POST",
    headers: { authorization: "Bearer a", "content-type": "application/json" },
    body: JSON.stringify({ telefone: bia.telefone, email: bia.email }),
  });
  assert.equal(resposta.status, 200);
  const ficha = (await resposta.json()) as { nome: string; telefone: string };
  assert.equal(ficha.nome, "Ana");
  assert.equal(ficha.telefone, ana.telefone);
});

test("a sessão da Ana não muda o opt-in da Bia", async () => {
  const { app, optIns } = cenario();
  const alheio = await app.request("/api/clientes/bia/marketing", {
    method: "POST",
    headers: { authorization: "Bearer a", "content-type": "application/json" },
    body: JSON.stringify({ optIn: false }),
  });
  const proprio = await app.request("/api/clientes/ana/marketing", {
    method: "POST",
    headers: { authorization: "Bearer a", "content-type": "application/json" },
    body: JSON.stringify({ optIn: false }),
  });
  assert.equal(alheio.status, 401);
  assert.equal(proprio.status, 200);
  assert.deepEqual(optIns, [{ id: "ana", optIn: false }]);
});
