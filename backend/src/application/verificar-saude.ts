import type { Banco } from "../ports/banco.ts";
import type { Relogio } from "../ports/relogio.ts";

export async function verificarSaude(banco: Banco, relogio: Relogio) {
  await banco.ping();
  return { ok: true as const, agora: relogio.agora().toISOString() };
}
