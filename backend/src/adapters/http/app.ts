import { Hono } from "hono";
import { cors } from "hono/cors";
import { CATALOGO_INICIAL, EXPEDIENTE_INICIAL } from "../../application/catalogo-inicial.ts";
import { cancelarPeloCliente, reagendarPeloCliente } from "../../application/alterar-agendamento.ts";
import { listarHorarios } from "../../application/listar-horarios.ts";
import { marcarAgendamento } from "../../application/marcar-agendamento.ts";
import { verificarSaude } from "../../application/verificar-saude.ts";
import { normalizarEmail, normalizarTelefone } from "../../domain/cliente/identidade.ts";
import { podeCancelarPeloCliente } from "../../domain/agenda/regras.ts";
import type { AgendamentoDetalhe, RepositorioAgenda } from "../../ports/agenda.ts";
import type { Banco } from "../../ports/banco.ts";
import type { Relogio } from "../../ports/relogio.ts";

const DIA = /^\d{4}-\d{2}-\d{2}$/;
const HORA = /^\d{2}:\d{2}$/;

export function criarAplicacao(deps: {
  banco: Banco;
  relogio: Relogio;
  agenda: RepositorioAgenda;
  equipeToken: string | undefined;
}) {
  const app = new Hono();

  const origens = (process.env.CORS_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((origem) => origem.trim())
    .filter(Boolean);

  app.use(
    "/api/*",
    cors({
      origin: origens,
    }),
  );

  app.get("/api/health", async (c) => {
    try {
      const saude = await verificarSaude(deps.banco, deps.relogio);
      return c.json(saude);
    } catch {
      return c.json({ ok: false }, 503);
    }
  });

  app.get("/api/barbeiros", async (c) => {
    const lista = await deps.agenda.listarBarbeirosAtivos();
    return c.json({
      barbeiros: lista.map((barbeiro) => ({ id: barbeiro.id, nome: barbeiro.nome })),
    });
  });

  app.get("/api/servicos", async (c) => {
    const lista = await deps.agenda.listarServicosAtivos();
    return c.json({
      servicos: lista.map((servico) => ({
        id: servico.id,
        nome: servico.nome,
        duracaoMinutos: servico.duracaoMinutos,
        precoCentavos: servico.precoCentavos,
      })),
    });
  });

  app.get("/api/horarios", async (c) => {
    const dia = c.req.query("dia") ?? "";
    const servicoIds = (c.req.query("servicoIds") ?? "").split(",").filter(Boolean);
    const barbeiroId = c.req.query("barbeiroId") || undefined;
    const excetoAgendamentoId = c.req.query("exceto") || undefined;
    if (!DIA.test(dia) || servicoIds.length === 0) {
      return c.json({ erro: "pedido_invalido" }, 400);
    }
    const resultado = await listarHorarios(deps.agenda, deps.relogio, {
      dia,
      servicoIds,
      barbeiroId,
      excetoAgendamentoId,
    });
    if (!resultado.ok) return c.json({ erro: resultado.erro }, 422);
    return c.json({
      dia,
      duracaoMinutos: resultado.duracaoMinutos,
      horarios: resultado.horarios.map((horario) => horario.toISOString()),
    });
  });

  app.post("/api/agendamentos", async (c) => {
    const corpo = await c.req.json().catch(() => null);
    const pedido = lerPedido(corpo);
    if (!pedido) return c.json({ erro: "pedido_invalido" }, 400);

    const resultado = await marcarAgendamento(deps.agenda, deps.relogio, {
      ...pedido,
      origem: "site",
      barbeiroId: pedido.barbeiroId,
    });
    if (!resultado.ok) {
      const status = resultado.erro === "horario_indisponivel" || resultado.erro === "email_de_outra_ficha" ? 409 : 422;
      return c.json({ erro: resultado.erro }, status);
    }
    return c.json(
      {
        id: resultado.agendamento.id,
        inicio: resultado.agendamento.inicio.toISOString(),
        fim: resultado.agendamento.fim.toISOString(),
        estado: resultado.agendamento.estado,
      },
      201,
    );
  });

  app.get("/api/agendamentos/:id", async (c) => {
    const telefone = normalizarTelefone(c.req.query("telefone") ?? "");
    if (!telefone) return c.json({ erro: "pedido_invalido" }, 400);
    const detalhe = await deps.agenda.buscarAgendamento(c.req.param("id"));
    if (!detalhe || detalhe.telefone !== telefone) return c.json({ erro: "nao_encontrado" }, 404);
    return c.json(respostaDeAgendamento(detalhe, deps.relogio.agora()));
  });

  app.post("/api/agendamentos/:id/cancelar", async (c) => {
    const corpo = await c.req.json().catch(() => null);
    const telefone = telefoneDoCorpo(corpo);
    if (!telefone) return c.json({ erro: "pedido_invalido" }, 400);
    const resultado = await cancelarPeloCliente(deps.agenda, deps.relogio, {
      id: c.req.param("id"),
      telefone,
    });
    if (!resultado.ok) return c.json({ erro: resultado.erro }, statusDaAlteracao(resultado.erro));
    return c.json({ ok: true });
  });

  app.post("/api/agendamentos/:id/reagendar", async (c) => {
    const corpo = await c.req.json().catch(() => null);
    const telefone = telefoneDoCorpo(corpo);
    const inicio = inicioDoCorpo(corpo);
    if (!telefone || !inicio) return c.json({ erro: "pedido_invalido" }, 400);
    const resultado = await reagendarPeloCliente(deps.agenda, deps.relogio, {
      id: c.req.param("id"),
      telefone,
      inicio,
    });
    if (!resultado.ok) return c.json({ erro: resultado.erro }, statusDaAlteracao(resultado.erro));
    return c.json({
      ok: true,
      inicio: resultado.inicio.toISOString(),
      fim: resultado.fim.toISOString(),
    });
  });

  app.put("/api/expediente", async (c) => {
    if (!deps.equipeToken) return c.json({ erro: "equipe_nao_configurada" }, 503);
    if (c.req.header("authorization") !== `Bearer ${deps.equipeToken}`) {
      return c.json({ erro: "nao_autorizado" }, 401);
    }
    const corpo = await c.req.json().catch(() => null);
    const faixas = lerFaixas(corpo);
    if (!faixas) return c.json({ erro: "pedido_invalido" }, 400);
    const barbeiro = await deps.agenda.barbeiroAtivo();
    if (!barbeiro) return c.json({ erro: "sem_barbeiro" }, 422);
    await deps.agenda.substituirExpediente(barbeiro.id, faixas);
    return c.json({ ok: true });
  });

  return app;
}

export async function semearAgenda(agenda: RepositorioAgenda) {
  await agenda.semearSeVazio({
    barbeiro: "Bruno",
    servicos: CATALOGO_INICIAL,
    expediente: EXPEDIENTE_INICIAL,
  });
}

function lerPedido(corpo: unknown) {
  if (!corpo || typeof corpo !== "object") return null;
  const dados = corpo as Record<string, unknown>;
  if (!Array.isArray(dados.servicoIds) || dados.servicoIds.some((id) => typeof id !== "string")) {
    return null;
  }
  if (typeof dados.inicio !== "string" || typeof dados.nome !== "string") return null;
  if (typeof dados.telefone !== "string" || typeof dados.email !== "string") return null;
  if (dados.barbeiroId !== undefined && typeof dados.barbeiroId !== "string") return null;
  const telefone = normalizarTelefone(dados.telefone);
  const email = normalizarEmail(dados.email);
  const inicio = new Date(dados.inicio);
  if (!telefone || !email || dados.nome.trim() === "" || Number.isNaN(inicio.getTime())) return null;
  if (dados.servicoIds.length === 0) return null;
  return {
    servicoIds: dados.servicoIds as string[],
    inicio,
    nome: dados.nome.trim(),
    telefone,
    email,
    barbeiroId: typeof dados.barbeiroId === "string" ? dados.barbeiroId : undefined,
  };
}

function telefoneDoCorpo(corpo: unknown) {
  if (!corpo || typeof corpo !== "object") return null;
  const telefone = (corpo as { telefone?: unknown }).telefone;
  if (typeof telefone !== "string") return null;
  return normalizarTelefone(telefone);
}

function inicioDoCorpo(corpo: unknown) {
  if (!corpo || typeof corpo !== "object") return null;
  const inicio = (corpo as { inicio?: unknown }).inicio;
  if (typeof inicio !== "string") return null;
  const data = new Date(inicio);
  if (Number.isNaN(data.getTime())) return null;
  return data;
}

function statusDaAlteracao(erro: string) {
  if (erro === "nao_encontrado") return 404;
  if (erro === "horario_indisponivel") return 409;
  return 422;
}

function respostaDeAgendamento(detalhe: AgendamentoDetalhe, agora: Date) {
  return {
    id: detalhe.id,
    inicio: detalhe.inicio.toISOString(),
    fim: detalhe.fim.toISOString(),
    estado: detalhe.estado,
    podeAlterar:
      detalhe.estado === "confirmado" && podeCancelarPeloCliente(agora, detalhe.inicio),
    servicos: detalhe.itens.map((item) => ({
      id: item.servicoId,
      nome: item.nome,
      duracaoMinutos: item.duracaoMinutos,
    })),
  };
}

function lerFaixas(corpo: unknown) {
  if (!corpo || typeof corpo !== "object" || !Array.isArray((corpo as { faixas?: unknown }).faixas)) {
    return null;
  }
  const faixas = (corpo as { faixas: unknown[] }).faixas;
  const validas: Array<{ diaSemana: number; inicio: string; fim: string }> = [];
  for (const faixa of faixas) {
    if (!faixa || typeof faixa !== "object") return null;
    const item = faixa as Record<string, unknown>;
    if (typeof item.diaSemana !== "number" || item.diaSemana < 1 || item.diaSemana > 7) return null;
    if (typeof item.inicio !== "string" || typeof item.fim !== "string") return null;
    if (!HORA.test(item.inicio) || !HORA.test(item.fim) || item.inicio >= item.fim) return null;
    validas.push({ diaSemana: item.diaSemana, inicio: item.inicio, fim: item.fim });
  }
  return validas;
}
