import assert from "node:assert/strict";
import test from "node:test";
import type { Faixa, Intervalo } from "../domain/agenda/horarios-livres.ts";
import type {
  AgendamentoGravado,
  Cliente,
  NovoAgendamento,
  RepositorioAgenda,
  Servico,
} from "../ports/agenda.ts";
import type { Relogio } from "../ports/relogio.ts";
import { marcarAgendamento } from "./marcar-agendamento.ts";

const corte: Servico = {
  id: "corte",
  nome: "CORTE",
  duracaoMinutos: 45,
  precoCentavos: 5000,
  ativo: true,
};

function relogioFixo(agora: string): Relogio {
  return { agora: () => new Date(agora) };
}

function agendaFalsa(inicial?: { clientes?: Cliente[] }): RepositorioAgenda & {
  gravados: NovoAgendamento[];
} {
  const clientes = [...(inicial?.clientes ?? [])];
  const gravados: NovoAgendamento[] = [];
  const faixas: Faixa[] = [{ inicio: "09:00", fim: "18:00" }];

  return {
    gravados,
    async barbeiroAtivo() {
      return { id: "bruno", nome: "Bruno" };
    },
    async barbeiroPorId(id) {
      return id === "bruno" ? { id: "bruno", nome: "Bruno" } : null;
    },
    async listarBarbeirosAtivos() {
      return [{ id: "bruno", nome: "Bruno" }];
    },
    async listarServicosAtivos() {
      return [corte];
    },
    async servicosPorIds(ids) {
      return ids.includes(corte.id) ? [corte] : [];
    },
    async clientePorTelefone(telefone) {
      return clientes.find((cliente) => cliente.telefone === telefone) ?? null;
    },
    async clientePorEmail(email) {
      return clientes.find((cliente) => cliente.email === email) ?? null;
    },
    async clientePorClerk() {
      return null;
    },
    async vincularClerk() {},
    async expediente() {
      return faixas;
    },
    async ocupados(): Promise<Intervalo[]> {
      return gravados.map((gravado) => ({ inicio: gravado.inicio, fim: gravado.fim }));
    },
    async indisponibilidades() {
      return [];
    },
    async substituirExpediente() {},
    async gravarAgendamento(dados) {
      gravados.push(dados);
      const gravado: AgendamentoGravado = {
        id: "ag-1",
        clienteId: "id" in dados.cliente ? dados.cliente.id : "novo",
        inicio: dados.inicio,
        fim: dados.fim,
        estado: "confirmado",
      };
      return gravado;
    },
    async semearSeVazio() {},
    async buscarAgendamento() {
      return null;
    },
    async proximoConfirmado() {
      return null;
    },
    async marcarPresenca() {},
    async cancelarAgendamento() {},
    async reagendarAgendamento() {},
    async listarAgenda() {
      return [];
    },
    async agendamentosCriadosDesde() {
      return [];
    },
    async definirEstado() {},
    async substituirItens() {},
    async gravarBloqueio() {
      return {
        id: "b",
        inicio: new Date(),
        fim: new Date(),
        motivo: "pausa" as const,
      };
    },
    async listarBloqueios() {
      return [];
    },
    async removerBloqueio() {},
    async registrarAuditoria() {},
    async listarAuditoria() {
      return [];
    },
    async anonimizarCliente() {},
    async agendamentosDoCliente() {
      return [];
    },
    async lerConfiguracao() {
      return "booksy";
    },
    async gravarConfiguracao() {},
    async criarCliente(dados) {
      return { id: "novo", clerkUserId: null, ...dados };
    },
  };
}

test("grava no telefone que já existe e não troca o e-mail", async () => {
  const agenda = agendaFalsa({
    clientes: [
      { id: "joao", nome: "João", telefone: "47999999999", email: "joao@email.com", clerkUserId: null },
    ],
  });

  const resultado = await marcarAgendamento(agenda, relogioFixo("2026-10-01T12:00:00-03:00"), {
    servicoIds: ["corte"],
    inicio: new Date("2026-10-05T12:00:00.000Z"),
    nome: "Outro",
    telefone: "47999999999",
    email: "novo@email.com",
    origem: "site",
  });

  assert.equal(resultado.ok, true);
  assert.deepEqual(agenda.gravados[0]?.cliente, { id: "joao" });
});

test("recusa e-mail que já é de outro telefone", async () => {
  const agenda = agendaFalsa({
    clientes: [
      { id: "joao", nome: "João", telefone: "47999999999", email: "joao@email.com", clerkUserId: null },
    ],
  });

  const resultado = await marcarAgendamento(agenda, relogioFixo("2026-10-01T12:00:00-03:00"), {
    servicoIds: ["corte"],
    inicio: new Date("2026-10-05T12:00:00.000Z"),
    nome: "Maria",
    telefone: "47988888888",
    email: "joao@email.com",
    origem: "site",
  });

  assert.deepEqual(resultado, { ok: false, erro: "email_de_outra_ficha" });
});

test("o segundo cliente não leva o mesmo horário", async () => {
  const agenda = agendaFalsa();
  const relogio = relogioFixo("2026-10-01T12:00:00-03:00");
  const inicio = new Date("2026-10-05T12:00:00.000Z");

  const primeiro = await marcarAgendamento(agenda, relogio, {
    servicoIds: ["corte"],
    inicio,
    nome: "Ana",
    telefone: "47999999999",
    email: "ana@email.com",
    origem: "site",
  });
  const segundo = await marcarAgendamento(agenda, relogio, {
    servicoIds: ["corte"],
    inicio,
    nome: "Bruno Cliente",
    telefone: "47988888888",
    email: "outro@email.com",
    origem: "site",
  });

  assert.equal(primeiro.ok, true);
  assert.deepEqual(segundo, { ok: false, erro: "horario_indisponivel" });
});
