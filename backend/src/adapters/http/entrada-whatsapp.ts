import { createHash, timingSafeEqual } from "node:crypto";

/** Compara o Client-Token da Z-API com o segredo. Segredo ausente recusa. */
export function segredoConfere(recebido: string | undefined, esperado: string | undefined): boolean {
  if (!recebido || !esperado) return false;
  const a = createHash("sha256").update(recebido).digest();
  const b = createHash("sha256").update(esperado).digest();
  return timingSafeEqual(a, b);
}

/** Limite fixo por chave, dentro de uma janela. */
export function criarLimitePorJanela(opcoes: { maximo: number; janelaMs: number; agora: () => number }) {
  const marcas = new Map<string, number[]>();
  return {
    aceitar(chave: string) {
      const agora = opcoes.agora();
      const recentes = (marcas.get(chave) ?? []).filter((marca) => agora - marca < opcoes.janelaMs);
      if (recentes.length >= opcoes.maximo) {
        marcas.set(chave, recentes);
        return false;
      }
      recentes.push(agora);
      marcas.set(chave, recentes);
      return true;
    },
  };
}

export function chaveDoPedido(header: (nome: string) => string | undefined) {
  return header("fly-client-ip") ?? (header("x-forwarded-for")?.split(",")[0]?.trim() || "direto");
}
