import { normalizarEmail, normalizarTelefone } from "../domain/cliente/identidade.ts";
import type { RepositorioAgenda } from "../ports/agenda.ts";

export type FalhaNoCadastro =
  | "pedido_invalido"
  | "sem_consentimento"
  | "telefone_de_outra_ficha"
  | "email_de_outra_ficha";

/**
 * O cliente entra no Clerk e completa a ficha com nome e telefone.
 * O telefone identifica a ficha; o e-mail é o do Clerk e pertence a uma só.
 *
 * - Já tem ficha ligada a este usuário: nada muda.
 * - O e-mail já está numa ficha com este telefone: liga e segue.
 * - O e-mail já está numa ficha de outro telefone: recusa.
 * - O telefone já tem ficha sem e-mail, ou com este e-mail: liga e segue.
 * - O telefone já tem ficha com outro e-mail: recusa.
 * - Senão, nasce a ficha.
 */
export async function cadastrarCliente(
  agenda: RepositorioAgenda,
  pedido: {
    clerkUserId: string;
    email: string;
    nome: string;
    telefone: string;
    consentimento: boolean;
  },
): Promise<{ ok: true; clienteId: string; novo: boolean } | { ok: false; erro: FalhaNoCadastro }> {
  const email = normalizarEmail(pedido.email);
  const telefone = normalizarTelefone(pedido.telefone);
  const nome = pedido.nome.trim();
  if (!email || !telefone || !nome) return { ok: false, erro: "pedido_invalido" };
  if (!pedido.consentimento) return { ok: false, erro: "sem_consentimento" };

  const porClerk = await agenda.clientePorClerk(pedido.clerkUserId);
  if (porClerk) return { ok: true, clienteId: porClerk.id, novo: false };

  const porEmail = await agenda.clientePorEmail(email);
  if (porEmail) {
    if (porEmail.telefone !== telefone) return { ok: false, erro: "email_de_outra_ficha" };
    if (porEmail.clerkUserId && porEmail.clerkUserId !== pedido.clerkUserId) {
      return { ok: false, erro: "email_de_outra_ficha" };
    }
    await agenda.atualizarCliente(porEmail.id, { nome });
    await agenda.vincularClerk(porEmail.id, pedido.clerkUserId);
    return { ok: true, clienteId: porEmail.id, novo: false };
  }

  const porTelefone = await agenda.clientePorTelefone(telefone);
  if (porTelefone) {
    if (porTelefone.email && porTelefone.email !== email) {
      return { ok: false, erro: "telefone_de_outra_ficha" };
    }
    if (porTelefone.clerkUserId && porTelefone.clerkUserId !== pedido.clerkUserId) {
      return { ok: false, erro: "telefone_de_outra_ficha" };
    }
    await agenda.atualizarCliente(porTelefone.id, { nome, email });
    await agenda.vincularClerk(porTelefone.id, pedido.clerkUserId);
    return { ok: true, clienteId: porTelefone.id, novo: false };
  }

  const criado = await agenda.criarCliente({ nome, telefone, email });
  await agenda.vincularClerk(criado.id, pedido.clerkUserId);
  return { ok: true, clienteId: criado.id, novo: true };
}
