import assert from "node:assert/strict";
import test from "node:test";
import type { Cliente, RepositorioAgenda } from "../ports/agenda.ts";
import { excluirFicha, exportarFicha } from "./lgpd.ts";

function agendaCom(inicial: Cliente) {
  let ficha = { ...inicial };
  const eventos: string[] = [];
  const agenda = {
    ficha: () => ficha,
    async clientePorTelefone(telefone: string) {
      return ficha.telefone === telefone ? ficha : null;
    },
    async historicoDoCliente() {
      return [];
    },
    async atualizarCliente() {},
    async agendamentosDoCliente() {
      return [
        {
          id: "ag-1",
          inicio: new Date("2026-10-05T15:00:00-03:00"),
          fim: new Date("2026-10-05T15:45:00-03:00"),
          estado: "confirmado" as const,
        },
      ];
    },
    async listarAuditoria() {
      return eventos.map((acao) => ({
        acao,
        ator: "cliente:47999999999",
        em: new Date("2026-10-01T12:00:00-03:00"),
        agendamentoId: null,
      }));
    },
    async registrarAuditoria(dados: { acao: string }) {
      eventos.push(dados.acao);
    },
    async anonimizarCliente(id: string) {
      ficha = {
        ...ficha,
        nome: "Excluído",
        telefone: `excluido-${id}`,
        email: null,
        clerkUserId: null,
      };
    },
  };
  return agenda as unknown as RepositorioAgenda & { ficha: () => Cliente };
}

const joao: Cliente = {
  id: "joao",
  nome: "João",
  telefone: "47999999999",
  email: "joao@email.com",
  clerkUserId: null,
};

test("exportar devolve a ficha e o histórico", async () => {
  const agenda = agendaCom(joao);
  const resultado = await exportarFicha(agenda, {
    telefone: "47999999999",
    email: "joao@email.com",
  });
  assert.equal(resultado.ok, true);
  if (!resultado.ok) return;
  assert.equal(resultado.ficha.nome, "João");
  assert.equal(resultado.ficha.agendamentos.length, 1);
});

test("excluir anonimiza a ficha e registra quem pediu", async () => {
  const agenda = agendaCom(joao);
  const resultado = await excluirFicha(agenda, {
    telefone: "47999999999",
    email: "joao@email.com",
  });
  assert.deepEqual(resultado, { ok: true });
  assert.equal(agenda.ficha().nome, "Excluído");
  assert.equal(agenda.ficha().email, null);
  assert.match(agenda.ficha().telefone, /^excluido-/);
});
