import assert from "node:assert/strict";
import test from "node:test";
import type { AgendamentoDetalhe, RepositorioAgenda } from "../ports/agenda.ts";
import type { Interpretador, Intencao } from "../ports/interpretador.ts";
import type { Mensageiro, RepositorioMensagens } from "../ports/mensagens.ts";
import { responderLembrete } from "./responder-lembrete.ts";

function detalhe(inicio: Date): AgendamentoDetalhe {
  return {
    id: "ag-1",
    barbeiroId: "bruno",
    clienteId: "joao",
    telefone: "47999999999",
    inicio,
    fim: new Date(inicio.getTime() + 45 * 60 * 1000),
    estado: "confirmado",
    presencaAvisadaEm: null,
    itens: [],
  };
}

function cenario(inicio: Date, intencao: Intencao) {
  let atual = detalhe(inicio);
  const enviados: string[] = [];
  const agenda = {
    atual: () => atual,
    async proximoConfirmado() {
      return atual.estado === "confirmado" ? atual : null;
    },
    async marcarPresenca(_id: string, quando: Date) {
      atual = { ...atual, presencaAvisadaEm: quando };
    },
    async cancelarAgendamento() {
      atual = { ...atual, estado: "cancelado_pelo_cliente" };
    },
  } as unknown as RepositorioAgenda & { atual: () => AgendamentoDetalhe };
  const mensagens: RepositorioMensagens = {
    async canalAtivo() {
      return true;
    },
    async desligarCanal() {},
    async jaEnviada() {
      return false;
    },
    async registrar() {},
  };
  const mensageiro: Mensageiro = {
    async enviar(pedido) {
      enviados.push(pedido.texto);
      return { ok: true };
    },
  };
  const interpretador: Interpretador = {
    async interpretar() {
      return intencao;
    },
  };
  return { agenda, mensagens, mensageiro, interpretador, enviados };
}

const agora = new Date("2026-10-05T12:00:00-03:00");

test("confirmar presença não muda o estado", async () => {
  const cena = cenario(new Date("2026-10-05T18:00:00-03:00"), "presenca");
  await responderLembrete(cena.agenda, cena.mensagens, cena.mensageiro, cena.interpretador, { agora: () => agora }, {
    telefone: "47999999999",
    texto: "confirmo",
    urlDoSite: "https://basecut.com.br",
  });
  assert.equal(cena.agenda.atual().estado, "confirmado");
  assert.ok(cena.agenda.atual().presencaAvisadaEm);
});

test("o núcleo recusa cancelar com 2 horas ou menos, mesmo que o agente peça", async () => {
  const cena = cenario(new Date("2026-10-05T13:30:00-03:00"), "cancelar");
  const resultado = await responderLembrete(
    cena.agenda,
    cena.mensagens,
    cena.mensageiro,
    cena.interpretador,
    { agora: () => agora },
    { telefone: "47999999999", texto: "cancela", urlDoSite: "https://basecut.com.br" },
  );
  assert.equal(cena.agenda.atual().estado, "confirmado");
  assert.match(resultado.resposta ?? "", /continua seu/);
});

test("pedido de outro horário devolve o link e não mexe no agendamento", async () => {
  const inicio = new Date("2026-10-06T15:00:00-03:00");
  const cena = cenario(inicio, "outro_horario");
  const resultado = await responderLembrete(
    cena.agenda,
    cena.mensagens,
    cena.mensageiro,
    cena.interpretador,
    { agora: () => agora },
    { telefone: "47999999999", texto: "quero outro horário", urlDoSite: "https://basecut.com.br" },
  );
  assert.equal(cena.agenda.atual().inicio.toISOString(), inicio.toISOString());
  assert.match(resultado.resposta ?? "", /\/agendar/);
});
