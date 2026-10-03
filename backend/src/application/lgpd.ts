import { normalizarEmail } from "../domain/cliente/identidade.ts";
import type { RepositorioAgenda } from "../ports/agenda.ts";

export async function exportarFicha(
  agenda: RepositorioAgenda,
  pedido: { telefone: string; email: string },
) {
  const cliente = await fichaDoPedido(agenda, pedido);
  if (!cliente) return { ok: false as const, erro: "nao_encontrado" as const };
  const [agendamentos, historico] = await Promise.all([
    agenda.agendamentosDoCliente(cliente.id),
    agenda.listarAuditoria(cliente.id),
  ]);
  return {
    ok: true as const,
    ficha: {
      nome: cliente.nome,
      telefone: cliente.telefone,
      email: cliente.email,
      agendamentos,
      historico,
    },
  };
}

export async function excluirFicha(
  agenda: RepositorioAgenda,
  pedido: { telefone: string; email: string },
) {
  const cliente = await fichaDoPedido(agenda, pedido);
  if (!cliente) return { ok: false as const, erro: "nao_encontrado" as const };
  await agenda.registrarAuditoria({
    agendamentoId: null,
    clienteId: cliente.id,
    acao: "exclusao",
    ator: `cliente:${cliente.telefone}`,
  });
  await agenda.anonimizarCliente(cliente.id);
  return { ok: true as const };
}

async function fichaDoPedido(
  agenda: RepositorioAgenda,
  pedido: { telefone: string; email: string },
) {
  const email = normalizarEmail(pedido.email);
  if (!email) return null;
  const cliente = await agenda.clientePorTelefone(pedido.telefone);
  if (!cliente || cliente.email !== email) return null;
  return cliente;
}
