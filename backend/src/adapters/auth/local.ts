import { papelDe } from "../../domain/casa/regras.ts";
import type { Autenticacao } from "../../ports/autenticacao.ts";

/**
 * Autenticação local, só para desenvolvimento sem chave do Clerk.
 *
 * Liga com `AUTH_LOCAL=1` e nunca em produção. O token é o próprio papel:
 *   Bearer local:equipe:admin        → membro admin da casa
 *   Bearer local:equipe:barbeiro     → membro barbeiro
 *   Bearer local:cliente:<e-mail>    → cliente com esse e-mail
 */
export function criarAutenticacaoLocal(): Autenticacao {
  return {
    async membro(authorization) {
      const partes = lerToken(authorization);
      if (!partes || partes[0] !== "equipe") return null;
      const papel = partes[1] ?? "membro";
      return { userId: `local-equipe-${papel}`, papel: papelDe(`org:${papel}`) };
    },
    async cliente(authorization) {
      const partes = lerToken(authorization);
      if (!partes || partes[0] !== "cliente" || !partes[1]) return null;
      const email = partes.slice(1).join(":").toLowerCase();
      return { userId: `local-cliente-${email}`, email };
    },
  };
}

function lerToken(authorization: string | undefined) {
  if (!authorization?.startsWith("Bearer local:")) return null;
  return authorization.slice("Bearer local:".length).split(":");
}
