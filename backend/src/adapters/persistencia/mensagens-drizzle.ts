import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import type { Sql } from "postgres";
import type { RepositorioMensagens, TipoMensagem } from "../../ports/mensagens.ts";
import { canalWhatsapp, mensagens } from "./schema.ts";
import * as schema from "./schema.ts";

export function criarRepositorioMensagens(cliente: Sql): RepositorioMensagens {
  const db = drizzle(cliente, { schema });

  return {
    async canalAtivo() {
      const [linha] = await db
        .select({ ativo: canalWhatsapp.ativo })
        .from(canalWhatsapp)
        .where(eq(canalWhatsapp.id, "casa"))
        .limit(1);
      return linha?.ativo ?? true;
    },

    async desligarCanal() {
      await db.update(canalWhatsapp).set({ ativo: false }).where(eq(canalWhatsapp.id, "casa"));
    },

    async jaEnviada(agendamentoId, tipo) {
      const [linha] = await db
        .select({ id: mensagens.id })
        .from(mensagens)
        .where(and(eq(mensagens.agendamentoId, agendamentoId), eq(mensagens.tipo, tipo)))
        .limit(1);
      return Boolean(linha);
    },

    async registrar(agendamentoId, tipo: TipoMensagem) {
      await db.insert(mensagens).values({ agendamentoId, tipo }).onConflictDoNothing();
    },
  };
}
