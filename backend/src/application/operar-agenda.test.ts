import assert from "node:assert/strict";
import test from "node:test";
import type { Intervalo } from "../domain/agenda/horarios-livres.ts";
import type { AgendamentoDetalhe, ItemAgendamento, RepositorioAgenda } from "../ports/agenda.ts";
import type { Relogio } from "../ports/relogio.ts";
import { marcarAgendamento } from "./marcar-agendamento.ts";
import { alterarServicosPelaEquipe, moverPelaEquipe } from "./operar-agenda.ts";

const corte = {
  id: "corte",
  nome: "CORTE",
  duracaoMinutos: 45,
  precoCentavos: 5000,
  ativo: true,
};

function base(): AgendamentoDetalhe {
  return {
    id: "ag-1",
    barbeiroId: "bruno",
    clienteId: "joao",
    telefone: "47999999999",
    inicio: new Date("2026-10-05T15:00:00-03:00"),
    fim: new Date("2026-10-05T15:45:00-03:00"),
    estado: "confirmado",
    presencaAvisadaEm: new Date("2026-10-04T10:00:00-03:00"),
    itens: [
      { servicoId: "corte", nome: "CORTE", duracaoMinutos: 45, precoCentavos: 5000 },
    ],
  };
}

function agendaEquipe(inicial = base()) {
  let atual = structuredClone(inicial);
  const agenda = {
    atual: () => atual,
    async buscarAgendamento(id: string) {
      return id === atual.id ? atual : null;
    },
    async reagendarAgendamento(id: string, inicio: Date, fim: Date) {
      if (id === atual.id) atual = { ...atual, inicio, fim, presencaAvisadaEm: null };
    },
    async substituirItens(id: string, itens: ItemAgendamento[], fim: Date) {
      if (id === atual.id) atual = { ...atual, itens, fim };
    },
    async definirEstado(id: string, estado: AgendamentoDetalhe["estado"]) {
      if (id === atual.id) atual = { ...atual, estado };
    },
    async expediente() {
      return [{ inicio: "09:00", fim: "18:00" }];
    },
    async ocupados(): Promise<Intervalo[]> {
      return [];
    },
    async indisponibilidades() {
      return [];
    },
    async servicosPorIds(ids: string[]) {
      return ids.includes(corte.id) ? [corte] : [];
    },
    async barbeiroAtivo() {
      return { id: "bruno", nome: "Bruno" };
    },
    async clientePorTelefone() {
      return null;
    },
    async clientePorEmail() {
      return null;
    },
    async gravarAgendamento(dados: { inicio: Date; fim: Date }) {
      return {
        id: "encaixe",
        clienteId: "novo",
        inicio: dados.inicio,
        fim: dados.fim,
        estado: "confirmado" as const,
      };
    },
  };
  return agenda as unknown as typeof agenda & RepositorioAgenda;
}

const relogio: Relogio = { agora: () => new Date("2026-10-05T14:50:00-03:00") };

test("a equipe encaixa dentro da antecedência de 60 minutos", async () => {
  const agenda = agendaEquipe();
  const resultado = await marcarAgendamento(agenda, relogio, {
    servicoIds: ["corte"],
    inicio: new Date("2026-10-05T15:00:00-03:00"),
    nome: "Encaixe",
    telefone: "47988887777",
    email: null,
    origem: "equipe",
  });
  assert.equal(resultado.ok, true);
});

test("mover pela casa zera a presença e não espera as 2 horas", async () => {
  const agenda = agendaEquipe();
  const novo = new Date("2026-10-05T16:00:00-03:00");
  const resultado = await moverPelaEquipe(agenda, relogio, { id: "ag-1", inicio: novo });
  assert.equal(resultado.ok, true);
  assert.equal(agenda.atual().presencaAvisadaEm, null);
  assert.equal(agenda.atual().inicio.toISOString(), novo.toISOString());
});

test("trocar o serviço só grava se a nova duração cabe", async () => {
  const agenda = agendaEquipe();
  agenda.ocupados = async () => [
    {
      inicio: new Date("2026-10-05T15:30:00-03:00"),
      fim: new Date("2026-10-05T16:00:00-03:00"),
    },
  ];
  const resultado = await alterarServicosPelaEquipe(agenda, relogio, {
    id: "ag-1",
    servicoIds: ["corte", "corte"],
  });
  assert.deepEqual(resultado, { ok: false, erro: "horario_indisponivel" });
  assert.equal(agenda.atual().itens.length, 1);
});

test("o horário passado continua confirmado até a casa marcar", async () => {
  const agenda = agendaEquipe();
  const antes = agenda.atual().estado;
  await agenda.buscarAgendamento("ag-1");
  assert.equal(agenda.atual().estado, antes);
  assert.equal(antes, "confirmado");
});
