import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sql as drizzleSql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { Banco } from "../../ports/banco.ts";
import type { RepositorioAgenda } from "../../ports/agenda.ts";
import { criarRepositorioAgenda } from "./agenda-drizzle.ts";
import * as schema from "./schema.ts";

const sqlInicial = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../../sql/0001_inicio.sql"),
  "utf8",
);

export type BancoConectado = Banco & {
  fechar(): Promise<void>;
  aplicarSchema(): Promise<void>;
  agenda: RepositorioAgenda;
};

export function criarBanco(databaseUrl: string): BancoConectado {
  const cliente = postgres(databaseUrl, {
    max: 10,
    onnotice: () => {},
  });
  const db = drizzle(cliente, { schema });

  return {
    async ping() {
      await db.execute(drizzleSql`select 1`);
    },
    async fechar() {
      await cliente.end();
    },
    async aplicarSchema() {
      await cliente.unsafe(sqlInicial);
    },
    agenda: criarRepositorioAgenda(cliente),
  };
}
