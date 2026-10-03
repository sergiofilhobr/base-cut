import { normalizarEmail } from "../domain/cliente/identidade.ts";
import type { RepositorioAgenda } from "../ports/agenda.ts";

export type FalhaAoEntrar = "ficha_inexistente" | "ficha_de_outro_usuario";

/**
 * O usuário do Clerk nasce na primeira entrada, no Clerk.
 * Aqui só ligamos a ficha que já existe, pelo e-mail guardado.
 * Quem nunca entra não ganha linha nova.
 */
export async function entrarNaFicha(
  agenda: RepositorioAgenda,
  pedido: { clerkUserId: string; email: string },
): Promise<{ ok: true; clienteId: string } | { ok: false; erro: FalhaAoEntrar }> {
  const email = normalizarEmail(pedido.email);
  if (!email) return { ok: false, erro: "ficha_inexistente" };

  const porClerk = await agenda.clientePorClerk(pedido.clerkUserId);
  if (porClerk) return { ok: true, clienteId: porClerk.id };

  const porEmail = await agenda.clientePorEmail(email);
  if (!porEmail) return { ok: false, erro: "ficha_inexistente" };
  if (porEmail.clerkUserId && porEmail.clerkUserId !== pedido.clerkUserId) {
    return { ok: false, erro: "ficha_de_outro_usuario" };
  }

  await agenda.vincularClerk(porEmail.id, pedido.clerkUserId);
  return { ok: true, clienteId: porEmail.id };
}
