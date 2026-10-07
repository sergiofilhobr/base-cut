import assert from "node:assert/strict";
import test from "node:test";
import { criarInterpretador } from "../eve/interpretador.ts";
import type { AgendamentoDetalhe, RepositorioAgenda } from "../../ports/agenda.ts";
import type { Banco } from "../../ports/banco.ts";
import type { Cobrancas, RepositorioCaixa } from "../../ports/caixa.ts";
import type { Mensageiro, RepositorioMensagens } from "../../ports/mensagens.ts";
import type { Autenticacao } from "../../ports/autenticacao.ts";
import { criarAplicacao } from "./app.ts";
import type { RepositorioCasa } from "../persistencia/casa-postgres.ts";
import type { RepositorioRelacao } from "../persistencia/relacao-postgres.ts";
import { criarLimitePorJanela, segredoConfere } from "./entrada-whatsapp.ts";

const SEGREDO = "token-da-casa";
const AGORA = new Date("2026-10-06T12:00:00Z");
const INICIO = new Date("2026-10-06T16:00:00Z");

function detalhe(): AgendamentoDetalhe {
  return {
    id: "ag-1",
    barbeiroId: "bruno",
    clienteId: "joao",
    telefone: "47999999999",
    inicio: INICIO,
    fim: new Date(INICIO.getTime() + 45 * 60 * 1000),
    estado: "confirmado",
    presencaAvisadaEm: null,
    itens: [],
  };
}

function cenario(opcoes: { segredo?: string; maximo?: number }) {
  let atual = detalhe();
  const enviados: string[] = [];
  const agenda = {
    atual: () => atual,
    async proximoConfirmado() {
      return atual.estado === "confirmado" ? atual : null;
    },
    async cancelarAgendamento() {
      atual = { ...atual, estado: "cancelado_pelo_cliente" };
    },
  } as unknown as RepositorioAgenda & { atual: () => AgendamentoDetalhe };
  const mensageiro: Mensageiro = {
    async enviar(pedido) {
      enviados.push(pedido.para);
      return { ok: true };
    },
  };
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
  const autenticacao: Autenticacao = {
    async membro() {
      return null;
    },
    async cliente() {
      return null;
    },
  };
  let agora = 0;
  const app = criarAplicacao({
    banco: {} as Banco,
    relogio: { agora: () => AGORA },
    agenda,
    autenticacao,
    mensagens,
    mensageiro,
    interpretador: criarInterpretador({ url: undefined, token: undefined }),
    telefoneDoBruno: undefined,
    urlDoSite: "http://localhost:3000",
    caixa: {} as RepositorioCaixa,
    cobrancas: {} as Cobrancas,
    relacao: {} as RepositorioRelacao,
    casa: {} as RepositorioCasa,
    urlGoogle: "https://example.test",
    segredoWhatsapp: opcoes.segredo,
    limiteWhatsapp: criarLimitePorJanela({
      maximo: opcoes.maximo ?? 30,
      janelaMs: 60_000,
      agora: () => agora++,
    }),
  });
  return { app, agenda, enviados };
}

function postar(app: ReturnType<typeof cenario>["app"], token?: string) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (token !== undefined) headers["client-token"] = token;
  return app.request("/api/whatsapp/entrada", {
    method: "POST",
    headers,
    body: JSON.stringify({ telefone: "47999999999", texto: "nao vou" }),
  });
}

test("segredo ausente ou diferente não confere", () => {
  assert.equal(segredoConfere(undefined, SEGREDO), false);
  assert.equal(segredoConfere(SEGREDO, undefined), false);
  assert.equal(segredoConfere("outro", SEGREDO), false);
  assert.equal(segredoConfere(SEGREDO, SEGREDO), true);
});

test("sem o Client-Token a entrada não cancela nem envia", async () => {
  const { app, agenda, enviados } = cenario({ segredo: SEGREDO });
  const resposta = await postar(app);
  assert.equal(resposta.status, 401);
  assert.equal(agenda.atual().estado, "confirmado");
  assert.deepEqual(enviados, []);
});

test("sem segredo configurado a entrada recusa", async () => {
  const { app, agenda, enviados } = cenario({});
  const resposta = await postar(app, SEGREDO);
  assert.equal(resposta.status, 401);
  assert.equal(agenda.atual().estado, "confirmado");
  assert.deepEqual(enviados, []);
});

test("com o token certo, cancelar ainda cancela quando faltam mais de 2 horas", async () => {
  const { app, agenda, enviados } = cenario({ segredo: SEGREDO });
  const resposta = await postar(app, SEGREDO);
  assert.equal(resposta.status, 200);
  assert.equal(agenda.atual().estado, "cancelado_pelo_cliente");
  assert.deepEqual(enviados, ["47999999999"]);
});

test("estouro do limite não chega na agenda", async () => {
  const { app, agenda, enviados } = cenario({ segredo: SEGREDO, maximo: 1 });
  assert.equal((await postar(app, SEGREDO)).status, 200);
  const segunda = await postar(app, SEGREDO);
  assert.equal(segunda.status, 429);
  assert.equal(agenda.atual().estado, "cancelado_pelo_cliente");
  assert.deepEqual(enviados, ["47999999999"]);
});
