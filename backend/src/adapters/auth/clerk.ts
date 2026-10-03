import { createClerkClient, verifyToken } from "@clerk/backend";
import type { Autenticacao, Membro, SessaoCliente } from "../../ports/autenticacao.ts";

export function criarAutenticacaoClerk(opcoes: {
  secretKey: string | undefined;
  orgId: string | undefined;
}): Autenticacao {
  if (!opcoes.secretKey) {
    return {
      async membro() {
        return null;
      },
      async cliente() {
        return null;
      },
    };
  }

  const clerk = createClerkClient({ secretKey: opcoes.secretKey });

  return {
    async membro(authorization) {
      const userId = await usuarioDoToken(authorization, opcoes.secretKey!);
      if (!userId || !opcoes.orgId) return null;
      try {
        const lista = await clerk.users.getOrganizationMembershipList({ userId });
        const daCasa = lista.data.find((item) => item.organization.id === opcoes.orgId);
        if (!daCasa) return null;
        const papel: Membro["papel"] = daCasa.role === "org:admin" ? "admin" : "membro";
        return { userId, papel };
      } catch {
        return null;
      }
    },

    async cliente(authorization) {
      const userId = await usuarioDoToken(authorization, opcoes.secretKey!);
      if (!userId) return null;
      try {
        const usuario = await clerk.users.getUser(userId);
        const email = usuario.emailAddresses.find(
          (item) => item.id === usuario.primaryEmailAddressId,
        )?.emailAddress;
        if (!email) return null;
        const sessao: SessaoCliente = { userId, email };
        return sessao;
      } catch {
        return null;
      }
    },
  };
}

async function usuarioDoToken(authorization: string | undefined, secretKey: string) {
  if (!authorization?.startsWith("Bearer ")) return null;
  try {
    const payload = await verifyToken(authorization.slice("Bearer ".length), { secretKey });
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
