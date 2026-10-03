import assert from "node:assert/strict";
import test from "node:test";
import type { Intervalo } from "../domain/agenda/horarios-livres.ts";
import type { AgendamentoDetalhe, RepositorioAgenda } from "../ports/agenda.ts";
import type { Relogio } from "../ports/relogio.ts";
import { cancelarPeloCliente, reagendarPeloCliente } from "./alterar-agendamento.ts";

const inicio = new Date("2026-10-05T15:00:00-03:00");

function detalhe(parcial?: Partial<AgendamentoDetalhe>): AgendamentoDetalhe {
  return {
    id: "ag-1",
    barbeiroId: "bruno",
    clienteId: "joao",
    telefone: "47999999999",
    inicio,
    fim: new Date("2026-10-05T15:45:00-03:00"),
    estado: "confirmado",
    presencaAvisadaEm: new Date("2026-10-04T10:00:00-03:00"),
    itens: [
      {
        servicoId: "corte",
        nome: "CORTE",
        duracaoMinutos: 45,
        precoCentavos: 5000,
      },
    ],
    ...parcial,
  };
}

function agendaCom(inicial: AgendamentoDetalhe, ocupados: Intervalo[] = []) {
  let atual = { ...inicial, itens: [...inicial.itens] };
  const agenda = {
    atual: () => atual,
    async buscarAgendamento(id: string) {
      return id === atual.id ? atual : null;
    },
    async cancelarAgendamento(id: string, estado: AgendamentoDetalhe["estado"]) {
      if (id === atual.id) atual = { ...atual, estado };
    },
    async reagendarAgendamento(id: string, novoInicio: Date, fim: Date) {
      if (id !== atual.id) return;
      atual = { ...atual, inicio: novoInicio, fim, presencaAvisadaEm: null };
    },
    async expediente() {
      return [{ inicio: "09:00", fim: "18:00" }];
    },
    async ocupados(): Promise<Intervalo[]> {
      return ocupados;
    },
    async indisponibilidades() {
      return [];
    },
  };
  return agenda as unknown as typeof agenda & RepositorioAgenda;
}

function relogio(agora: string): Relogio {
  return { agora: () => new Date(agora) };
}

test("cancelar com mais de 2 horas libera e mantém o registro", async () => {
  const agenda = agendaCom(detalhe());
  const resultado = await cancelarPeloCliente(agenda, relogio("2026-10-05T12:00:00-03:00"), {
    id: "ag-1",
    telefone: "47999999999",
  });
  assert.deepEqual(resultado, { ok: true });
  assert.equal(agenda.atual().estado, "cancelado_pelo_cliente");
  assert.equal(agenda.atual().id, "ag-1");
});

test("com 2 horas ou menos o cliente não cancela", async () => {
  const agenda = agendaCom(detalhe());
  const resultado = await cancelarPeloCliente(agenda, relogio("2026-10-05T13:00:00-03:00"), {
    id: "ag-1",
    telefone: "47999999999",
  });
  assert.deepEqual(resultado, { ok: false, erro: "prazo_encerrado" });
  assert.equal(agenda.atual().estado, "confirmado");
});

test("reagendar grava o novo intervalo e zera a presença", async () => {
  const agenda = agendaCom(detalhe());
  const novo = new Date("2026-10-06T12:00:00.000Z");
  const resultado = await reagendarPeloCliente(agenda, relogio("2026-10-05T10:00:00-03:00"), {
    id: "ag-1",
    telefone: "47999999999",
    inicio: novo,
  });
  assert.equal(resultado.ok, true);
  assert.equal(agenda.atual().inicio.toISOString(), novo.toISOString());
  assert.equal(agenda.atual().presencaAvisadaEm, null);
  assert.equal(agenda.atual().itens[0]?.nome, "CORTE");
});

test("se o novo horário foi tomado, o antigo permanece", async () => {
  const novo = new Date("2026-10-06T12:00:00.000Z");
  const agenda = agendaCom(detalhe(), [
    { inicio: novo, fim: new Date(novo.getTime() + 45 * 60 * 1000) },
  ]);
  const resultado = await reagendarPeloCliente(agenda, relogio("2026-10-05T10:00:00-03:00"), {
    id: "ag-1",
    telefone: "47999999999",
    inicio: novo,
  });
  assert.deepEqual(resultado, { ok: false, erro: "horario_indisponivel" });
  assert.equal(agenda.atual().inicio.toISOString(), inicio.toISOString());
});

test("conflito no meio da gravação não troca o horário", async () => {
  const agenda = agendaCom(detalhe());
  agenda.reagendarAgendamento = async () => {
    const erro = new Error("conflito") as Error & { code: string };
    erro.code = "23P01";
    throw erro;
  };
  const novo = new Date("2026-10-06T12:00:00.000Z");
  const resultado = await reagendarPeloCliente(agenda, relogio("2026-10-05T10:00:00-03:00"), {
    id: "ag-1",
    telefone: "47999999999",
    inicio: novo,
  });
  assert.deepEqual(resultado, { ok: false, erro: "horario_indisponivel" });
  assert.equal(agenda.atual().inicio.toISOString(), inicio.toISOString());
});
