import { Hono } from "hono";
import { cors } from "hono/cors";
import { CATALOGO_INICIAL, EXPEDIENTE_INICIAL } from "../../application/catalogo-inicial.ts";
import { cancelarPeloCliente, reagendarPeloCliente } from "../../application/alterar-agendamento.ts";
import { avisarMarcacao } from "../../application/avisos-whatsapp.ts";
import { responderLembrete } from "../../application/responder-lembrete.ts";
import { entrarNaFicha } from "../../application/entrar-na-ficha.ts";
import { listarHorarios } from "../../application/listar-horarios.ts";
import { marcarAgendamento } from "../../application/marcar-agendamento.ts";
import { alterarServicosPelaEquipe, moverPelaEquipe } from "../../application/operar-agenda.ts";
import { verificarSaude } from "../../application/verificar-saude.ts";
import { normalizarEmail, normalizarTelefone } from "../../domain/cliente/identidade.ts";
import { podeCancelarPeloCliente } from "../../domain/agenda/regras.ts";
import type { Autenticacao } from "../../ports/autenticacao.ts";
import type { Interpretador } from "../../ports/interpretador.ts";
import type { Mensageiro, RepositorioMensagens } from "../../ports/mensagens.ts";
import type { AgendamentoDetalhe, Bloqueio, LinhaDaAgenda, RepositorioAgenda } from "../../ports/agenda.ts";
import type { Banco } from "../../ports/banco.ts";
import type { Relogio } from "../../ports/relogio.ts";

const DIA = /^\d{4}-\d{2}-\d{2}$/;
const HORA = /^\d{2}:\d{2}$/;

export function criarAplicacao(deps: {
  banco: Banco;
  relogio: Relogio;
  agenda: RepositorioAgenda;
  autenticacao: Autenticacao;
  mensagens: RepositorioMensagens;
  mensageiro: Mensageiro;
  interpretador: Interpretador;
  telefoneDoBruno: string | undefined;
  urlDoSite: string;
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
    await avisarMarcacao(deps.mensagens, deps.mensageiro, {
      id: resultado.agendamento.id,
      nome: pedido.nome,
      telefone: pedido.telefone,
      inicio: resultado.agendamento.inicio,
      telefoneDoBruno: deps.telefoneDoBruno,
      urlDoSite: deps.urlDoSite,
    });
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

  app.post("/api/whatsapp/entrada", async (c) => {
    const corpo = await c.req.json().catch(() => null);
    const mensagem = lerMensagemWhatsapp(corpo);
    if (!mensagem) return c.json({ erro: "pedido_invalido" }, 400);
    const resultado = await responderLembrete(
      deps.agenda,
      deps.mensagens,
      deps.mensageiro,
      deps.interpretador,
      deps.relogio,
      { ...mensagem, urlDoSite: deps.urlDoSite },
    );
    return c.json(resultado);
  });

  app.post("/api/conta/entrar", async (c) => {
    const sessao = await deps.autenticacao.cliente(c.req.header("authorization"));
    if (!sessao) return c.json({ erro: "nao_autorizado" }, 401);
    const resultado = await entrarNaFicha(deps.agenda, {
      clerkUserId: sessao.userId,
      email: sessao.email,
    });
    if (!resultado.ok) return c.json({ erro: resultado.erro }, 404);
    const ficha = await deps.agenda.clientePorClerk(sessao.userId);
    return c.json({
      clienteId: resultado.clienteId,
      nome: ficha?.nome ?? null,
    });
  });

  app.put("/api/expediente", async (c) => {
    const membro = await deps.autenticacao.membro(c.req.header("authorization"));
    if (!membro) return c.json({ erro: "nao_autorizado" }, 401);
    const corpo = await c.req.json().catch(() => null);
    const faixas = lerFaixas(corpo);
    if (!faixas) return c.json({ erro: "pedido_invalido" }, 400);
    const barbeiro = await deps.agenda.barbeiroAtivo();
    if (!barbeiro) return c.json({ erro: "sem_barbeiro" }, 422);
    await deps.agenda.substituirExpediente(barbeiro.id, faixas);
    return c.json({ ok: true });
  });

  app.get("/api/painel/agenda", async (c) => {
    if (!(await membro(c, deps))) return c.json({ erro: "nao_autorizado" }, 401);
    const de = dataDe(c.req.query("de"));
    const ate = dataDe(c.req.query("ate"));
    if (!de || !ate) return c.json({ erro: "pedido_invalido" }, 400);
    const barbeiro = await deps.agenda.barbeiroAtivo();
    if (!barbeiro) return c.json({ erro: "sem_barbeiro" }, 422);
    const [agendamentosDaCasa, bloqueios] = await Promise.all([
      deps.agenda.listarAgenda(barbeiro.id, de, ate),
      deps.agenda.listarBloqueios(barbeiro.id, de, ate),
    ]);
    return c.json({
      agendamentos: agendamentosDaCasa.map(serializarLinha),
      bloqueios: bloqueios.map((bloqueio) => ({
        id: bloqueio.id,
        inicio: bloqueio.inicio.toISOString(),
        fim: bloqueio.fim.toISOString(),
        motivo: bloqueio.motivo,
      })),
    });
  });

  app.get("/api/painel/novos", async (c) => {
    if (!(await membro(c, deps))) return c.json({ erro: "nao_autorizado" }, 401);
    const desde = dataDe(c.req.query("desde"));
    if (!desde) return c.json({ erro: "pedido_invalido" }, 400);
    const barbeiro = await deps.agenda.barbeiroAtivo();
    if (!barbeiro) return c.json({ agendamentos: [] });
    const linhas = await deps.agenda.agendamentosCriadosDesde(barbeiro.id, desde);
    return c.json({ agendamentos: linhas.map(serializarLinha) });
  });

  app.post("/api/painel/encaixe", async (c) => {
    if (!(await membro(c, deps))) return c.json({ erro: "nao_autorizado" }, 401);
    const corpo = await c.req.json().catch(() => null);
    const pedido = lerEncaixe(corpo);
    if (!pedido) return c.json({ erro: "pedido_invalido" }, 400);
    const resultado = await marcarAgendamento(deps.agenda, deps.relogio, {
      ...pedido,
      origem: "equipe",
    });
    if (!resultado.ok) {
      const status = resultado.erro === "horario_indisponivel" ? 409 : 422;
      return c.json({ erro: resultado.erro }, status);
    }
    await avisarMarcacao(deps.mensagens, deps.mensageiro, {
      id: resultado.agendamento.id,
      nome: pedido.nome,
      telefone: pedido.telefone,
      inicio: pedido.inicio,
      telefoneDoBruno: deps.telefoneDoBruno,
      urlDoSite: deps.urlDoSite,
    });
    return c.json({ id: resultado.agendamento.id }, 201);
  });

  app.post("/api/painel/agendamentos/:id/mover", async (c) => {
    if (!(await membro(c, deps))) return c.json({ erro: "nao_autorizado" }, 401);
    const inicio = inicioDoCorpo(await c.req.json().catch(() => null));
    if (!inicio) return c.json({ erro: "pedido_invalido" }, 400);
    const resultado = await moverPelaEquipe(deps.agenda, deps.relogio, {
      id: c.req.param("id"),
      inicio,
    });
    if (!resultado.ok) return c.json({ erro: resultado.erro }, statusDaAlteracao(resultado.erro));
    return c.json({ ok: true, inicio: resultado.inicio.toISOString(), fim: resultado.fim.toISOString() });
  });

  app.post("/api/painel/agendamentos/:id/servicos", async (c) => {
    if (!(await membro(c, deps))) return c.json({ erro: "nao_autorizado" }, 401);
    const corpo = await c.req.json().catch(() => null);
    const servicoIds = servicosDoCorpo(corpo);
    if (!servicoIds) return c.json({ erro: "pedido_invalido" }, 400);
    const resultado = await alterarServicosPelaEquipe(deps.agenda, deps.relogio, {
      id: c.req.param("id"),
      servicoIds,
    });
    if (!resultado.ok) return c.json({ erro: resultado.erro }, statusDaAlteracao(resultado.erro));
    return c.json({ ok: true, fim: resultado.fim.toISOString() });
  });

  app.post("/api/painel/agendamentos/:id/estado", async (c) => {
    if (!(await membro(c, deps))) return c.json({ erro: "nao_autorizado" }, 401);
    const corpo = await c.req.json().catch(() => null);
    const estado = estadoDaCasa(corpo);
    if (!estado) return c.json({ erro: "pedido_invalido" }, 400);
    const detalhe = await deps.agenda.buscarAgendamento(c.req.param("id"));
    if (!detalhe) return c.json({ erro: "nao_encontrado" }, 404);
    if (estado === "cancelado_pela_casa") {
      await deps.agenda.cancelarAgendamento(detalhe.id, estado);
    } else {
      await deps.agenda.definirEstado(detalhe.id, estado);
    }
    return c.json({ ok: true });
  });

  app.post("/api/painel/bloqueios", async (c) => {
    if (!(await membro(c, deps))) return c.json({ erro: "nao_autorizado" }, 401);
    const corpo = await c.req.json().catch(() => null);
    const bloqueio = lerBloqueio(corpo);
    if (!bloqueio) return c.json({ erro: "pedido_invalido" }, 400);
    const barbeiro = await deps.agenda.barbeiroAtivo();
    if (!barbeiro) return c.json({ erro: "sem_barbeiro" }, 422);
    const gravado = await deps.agenda.gravarBloqueio({ barbeiroId: barbeiro.id, ...bloqueio });
    return c.json({ id: gravado.id }, 201);
  });

  app.delete("/api/painel/bloqueios/:id", async (c) => {
    if (!(await membro(c, deps))) return c.json({ erro: "nao_autorizado" }, 401);
    await deps.agenda.removerBloqueio(c.req.param("id"));
    return c.json({ ok: true });
  });

  return app;
}

async function membro(
  c: { req: { header: (nome: string) => string | undefined } },
  deps: { autenticacao: Autenticacao },
) {
  return deps.autenticacao.membro(c.req.header("authorization"));
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

function lerMensagemWhatsapp(corpo: unknown) {
  if (!corpo || typeof corpo !== "object") return null;
  const dados = corpo as Record<string, unknown>;
  const telefoneBruto =
    typeof dados.telefone === "string"
      ? dados.telefone
      : typeof dados.phone === "string"
        ? dados.phone
        : null;
  const textoDireto = typeof dados.texto === "string" ? dados.texto : null;
  const textoZapi =
    dados.text && typeof dados.text === "object" && typeof (dados.text as { message?: unknown }).message === "string"
      ? (dados.text as { message: string }).message
      : null;
  const telefone = telefoneBruto ? normalizarTelefone(telefoneBruto) : null;
  const texto = (textoDireto ?? textoZapi)?.trim();
  if (!telefone || !texto) return null;
  return { telefone, texto };
}

function dataDe(valor: string | undefined) {
  if (!valor) return null;
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
}

function lerEncaixe(corpo: unknown) {
  if (!corpo || typeof corpo !== "object") return null;
  const dados = corpo as Record<string, unknown>;
  if (!Array.isArray(dados.servicoIds) || dados.servicoIds.some((id) => typeof id !== "string")) return null;
  if (typeof dados.inicio !== "string" || typeof dados.nome !== "string") return null;
  if (typeof dados.telefone !== "string") return null;
  const telefone = normalizarTelefone(dados.telefone);
  const inicio = new Date(dados.inicio);
  if (!telefone || dados.nome.trim() === "" || Number.isNaN(inicio.getTime())) return null;
  if (dados.servicoIds.length === 0) return null;
  const email =
    typeof dados.email === "string" && dados.email.trim() !== "" ? normalizarEmail(dados.email) : null;
  if (typeof dados.email === "string" && dados.email.trim() !== "" && !email) return null;
  return {
    servicoIds: dados.servicoIds as string[],
    inicio,
    nome: dados.nome.trim(),
    telefone,
    email,
  };
}

function servicosDoCorpo(corpo: unknown) {
  if (!corpo || typeof corpo !== "object") return null;
  const ids = (corpo as { servicoIds?: unknown }).servicoIds;
  if (!Array.isArray(ids) || ids.length === 0 || ids.some((id) => typeof id !== "string")) return null;
  return ids as string[];
}

function estadoDaCasa(corpo: unknown) {
  if (!corpo || typeof corpo !== "object") return null;
  const estado = (corpo as { estado?: unknown }).estado;
  if (estado === "concluido" || estado === "falta" || estado === "cancelado_pela_casa") return estado;
  return null;
}

function lerBloqueio(corpo: unknown): {
  inicio: Date;
  fim: Date;
  motivo: Bloqueio["motivo"];
} | null {
  if (!corpo || typeof corpo !== "object") return null;
  const dados = corpo as Record<string, unknown>;
  if (typeof dados.inicio !== "string" || typeof dados.fim !== "string") return null;
  const inicio = new Date(dados.inicio);
  const fim = new Date(dados.fim);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime()) || inicio >= fim) return null;
  if (dados.motivo !== "pausa" && dados.motivo !== "folga" && dados.motivo !== "ferias" && dados.motivo !== "trava") {
    return null;
  }
  return { inicio, fim, motivo: dados.motivo };
}

function serializarLinha(linha: LinhaDaAgenda) {
  return {
    id: linha.id,
    nome: linha.nome,
    telefone: linha.telefone,
    inicio: linha.inicio.toISOString(),
    fim: linha.fim.toISOString(),
    estado: linha.estado,
    criadoEm: linha.criadoEm.toISOString(),
    servicos: linha.itens.map((item) => ({
      id: item.servicoId,
      nome: item.nome,
      duracaoMinutos: item.duracaoMinutos,
    })),
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
