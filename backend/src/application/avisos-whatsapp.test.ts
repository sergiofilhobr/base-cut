import assert from "node:assert/strict";
import test from "node:test";
import type { LinhaDaAgenda, RepositorioAgenda } from "../ports/agenda.ts";
import type { Mensageiro, RepositorioMensagens, TipoMensagem } from "../ports/mensagens.ts";
import type { Relogio } from "../ports/relogio.ts";
import { avisarMarcacao, dispararLembretes } from "./avisos-whatsapp.ts";

function mensagensFalsas() {
  const enviadas: Array<{ tipo: TipoMensagem; para: string; texto: string }> = [];
  let ativo = true;
  const registro = new Set<string>();
  const repositorio: RepositorioMensagens = {
    async canalAtivo() {
      return ativo;
    },
    async desligarCanal() {
      ativo = false;
    },
    async jaEnviada(id, tipo) {
      return registro.has(`${id}:${tipo}`);
    },
    async registrar(id, tipo) {
      registro.add(`${id}:${tipo}`);
    },
  };
  const mensageiro = (banido = false): Mensageiro => ({
    async enviar(pedido) {
      if (banido) return { ok: false, banido: true };
      enviadas.push({ tipo: "confirmacao", para: pedido.para, texto: pedido.texto });
      return { ok: true };
    },
  });
  return { repositorio, enviadas, mensageiro, registro };
}

function linha(inicio: Date): LinhaDaAgenda {
  return {
    id: "ag-1",
    barbeiroId: "bruno",
    clienteId: "joao",
    nome: "João",
    telefone: "47999999999",
    inicio,
    fim: new Date(inicio.getTime() + 45 * 60 * 1000),
    estado: "confirmado",
    presencaAvisadaEm: null,
    criadoEm: new Date("2026-10-01T12:00:00-03:00"),
    itens: [],
  };
}

test("a confirmação sai para o cliente e para o Bruno", async () => {
  const caixa = mensagensFalsas();
  const enviadas: string[] = [];
  const mensageiro: Mensageiro = {
    async enviar(pedido) {
      enviadas.push(pedido.texto);
      return { ok: true };
    },
  };
  await avisarMarcacao(caixa.repositorio, mensageiro, {
    id: "ag-1",
    nome: "João",
    telefone: "47999999999",
    inicio: new Date("2026-10-05T15:00:00-03:00"),
    telefoneDoBruno: "47988880000",
    urlDoSite: "https://basecut.com.br",
  });
  assert.equal(enviadas.length, 2);
  assert.match(enviadas[0] ?? "", /confirmado/);
  assert.match(enviadas[1] ?? "", /Novo horário/);
});

test("lembrete de 24h traz o caminho de cancelar e o de 2h só pede presença", async () => {
  const caixa = mensagensFalsas();
  const textos: string[] = [];
  const mensageiro: Mensageiro = {
    async enviar(pedido) {
      textos.push(pedido.texto);
      return { ok: true };
    },
  };
  const agora = new Date("2026-10-04T15:00:00-03:00");
  const agenda = {
    async barbeiroAtivo() {
      return { id: "bruno", nome: "Bruno" };
    },
    async listarAgenda() {
      return [
        linha(new Date("2026-10-05T15:00:00-03:00")),
        linha(new Date(agora.getTime() + 2 * 60 * 60 * 1000)),
      ].map((item, indice) => ({ ...item, id: `ag-${indice}` }));
    },
  } as unknown as RepositorioAgenda;

  await dispararLembretes(agenda, caixa.repositorio, mensageiro, { agora: () => agora } satisfies Relogio, {
    urlDoSite: "https://basecut.com.br",
  });

  assert.equal(textos.length, 2);
  assert.match(textos.find((texto) => texto.includes("cancelar")) ?? "", /\/agendamento\//);
  assert.match(textos.find((texto) => texto.includes("presença")) ?? "", /continua seu/);
});

test("número banido desliga o canal e o silêncio não muda o horário", async () => {
  const caixa = mensagensFalsas();
  const mensageiro: Mensageiro = {
    async enviar() {
      return { ok: false, banido: true };
    },
  };
  const inicio = new Date("2026-10-05T15:00:00-03:00");
  const atual = linha(inicio);
  const agenda = {
    async barbeiroAtivo() {
      return { id: "bruno", nome: "Bruno" };
    },
    async listarAgenda() {
      return [atual];
    },
  } as unknown as RepositorioAgenda;
  const agora = new Date(inicio.getTime() - 24 * 60 * 60 * 1000);
  await dispararLembretes(agenda, caixa.repositorio, mensageiro, { agora: () => agora }, {
    urlDoSite: "https://basecut.com.br",
  });
  assert.equal(await caixa.repositorio.canalAtivo(), false);
  assert.equal(atual.estado, "confirmado");
  const antes = textosDe(caixa);
  await dispararLembretes(agenda, caixa.repositorio, mensageiro, { agora: () => agora }, {
    urlDoSite: "https://basecut.com.br",
  });
  assert.equal(textosDe(caixa), antes);
});

function textosDe(caixa: { registro: Set<string> }) {
  return caixa.registro.size;
}
