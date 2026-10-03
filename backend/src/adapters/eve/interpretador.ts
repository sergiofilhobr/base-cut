import { interpretarTexto } from "../../domain/conversa/intencao.ts";
import type { Intencao, Interpretador } from "../../ports/interpretador.ts";

const INTENCOES = new Set<Intencao>(["presenca", "cancelar", "outro_horario", "desconhecida"]);

/** Regras locais. Se EVE_URL existir, pergunta ao modelo e cai na regra se ele falhar. */
export function criarInterpretador(opcoes: {
  url: string | undefined;
  token: string | undefined;
}): Interpretador {
  return {
    async interpretar(texto) {
      if (!opcoes.url) return interpretarTexto(texto);
      try {
        const resposta = await fetch(opcoes.url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(opcoes.token ? { authorization: `Bearer ${opcoes.token}` } : {}),
          },
          body: JSON.stringify({
            texto,
            intencoes: ["presenca", "cancelar", "outro_horario", "desconhecida"],
          }),
        });
        if (!resposta.ok) return interpretarTexto(texto);
        const dados = (await resposta.json()) as { intencao?: string };
        if (dados.intencao && INTENCOES.has(dados.intencao as Intencao)) {
          return dados.intencao as Intencao;
        }
        return interpretarTexto(texto);
      } catch {
        return interpretarTexto(texto);
      }
    },
  };
}
