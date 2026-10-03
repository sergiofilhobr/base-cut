import type { Membro } from "../../ports/autenticacao.ts";

export function papelDe(role: string): Membro["papel"] {
  if (role === "org:admin") return "admin";
  if (role === "org:barbeiro") return "barbeiro";
  if (role === "org:recepcao") return "recepcao";
  return "membro";
}

export function valorDoRepasse(faturadoCentavos: number, percentual: number) {
  if (percentual < 0 || percentual > 100) {
    return { ok: false as const, erro: "percentual_invalido" as const };
  }
  return { ok: true as const, centavos: Math.floor((faturadoCentavos * percentual) / 100) };
}

export function cabeNaLista(inscritos: number, vagas: number) {
  return inscritos < vagas;
}

export function servicosVisiveis<T extends { id: string }>(todos: T[], ligados: string[]) {
  if (ligados.length === 0) return todos;
  const permitidos = new Set(ligados);
  return todos.filter((servico) => permitidos.has(servico.id));
}
