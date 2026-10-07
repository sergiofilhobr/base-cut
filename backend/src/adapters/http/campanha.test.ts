import assert from "node:assert/strict";
import test from "node:test";
import type { Autenticacao, Membro } from "../../ports/autenticacao.ts";
import type { RepositorioAgenda } from "../../ports/agenda.ts";
import type { Banco } from "../../ports/banco.ts";
import type { Cobrancas, RepositorioCaixa } from "../../ports/caixa.ts";
import type { Interpretador } from "../../ports/interpretador.ts";
import type { Mensageiro, RepositorioMensagens } from "../../ports/mensagens.ts";
import { criarAplicacao } from "./app.ts";
import type { RepositorioCasa } from "../persistencia/casa-postgres.ts";
import type { RepositorioRelacao } from "../persistencia/relacao-postgres.ts";

function cenario() {
  const enviados: string[] = [];
  const autenticacao: Autenticacao = {
    async membro(authorization) {
      const papel = authorization?.slice("Bearer ".length);
      if (papel === "admin" || papel === "barbeiro" || papel === "recepcao" || papel === "membro") {
        return { userId: papel, papel } as Membro;
      }
      return null;
    },
    async cliente() {
      return null;
    },
  };
  const relacao = {
    async criarCampanha(dados: { nome: string; texto: string }) {
      return { id: "campanha-1", ...dados };
    },
    async audiencia() {
      return [{ id: "ana", telefone: "47911111111" }];
    },
  } as unknown as RepositorioRelacao;
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
      enviados.push(pedido.para);
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
    agenda: {} as RepositorioAgenda,
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
  return { app, enviados };
}

function postar(app: ReturnType<typeof cenario>["app"], papel?: string) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (papel) headers.authorization = `Bearer ${papel}`;
  return app.request("/api/painel/campanhas", {
    method: "POST",
    headers,
    body: JSON.stringify({ nome: "Volta", texto: "Horário aberto amanhã." }),
  });
}

test("barbeiro, recepção e membro não disparam campanha", async () => {
  const { app, enviados } = cenario();
  assert.equal((await postar(app, "barbeiro")).status, 401);
  assert.equal((await postar(app, "recepcao")).status, 401);
  assert.equal((await postar(app, "membro")).status, 401);
  assert.deepEqual(enviados, []);
});

test("admin ainda dispara a campanha", async () => {
  const { app, enviados } = cenario();
  const resposta = await postar(app, "admin");
  assert.equal(resposta.status, 201);
  assert.deepEqual(enviados, ["47911111111"]);
});
