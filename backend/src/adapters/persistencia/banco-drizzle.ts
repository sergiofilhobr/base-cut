import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sql as drizzleSql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { Banco } from "../../ports/banco.ts";
import type { RepositorioAgenda } from "../../ports/agenda.ts";
import type { RepositorioCasa } from "./casa-postgres.ts";
import { criarRepositorioCasa } from "./casa-postgres.ts";
import type { RepositorioRelacao } from "./relacao-postgres.ts";
import { criarRepositorioRelacao } from "./relacao-postgres.ts";
import type { RepositorioCaixa } from "../../ports/caixa.ts";
import type { RepositorioMensagens } from "../../ports/mensagens.ts";
import { criarRepositorioAgenda } from "./agenda-drizzle.ts";
import { criarRepositorioCaixa } from "./caixa-postgres.ts";
import { criarRepositorioMensagens } from "./mensagens-drizzle.ts";
import * as schema from "./schema.ts";

const pastaSql = join(dirname(fileURLToPath(import.meta.url)), "../../../sql");

export type BancoConectado = Banco & {
  fechar(): Promise<void>;
  aplicarSchema(): Promise<void>;
  agenda: RepositorioAgenda;
  mensagens: RepositorioMensagens;
  caixa: RepositorioCaixa;
  relacao: RepositorioRelacao;
  casa: RepositorioCasa;
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
      const arquivos = readdirSync(pastaSql)
        .filter((nome) => nome.endsWith(".sql"))
        .sort();
      for (const arquivo of arquivos) {
        await cliente.unsafe(readFileSync(join(pastaSql, arquivo), "utf8"));
      }
    },
    agenda: criarRepositorioAgenda(cliente),
    mensagens: criarRepositorioMensagens(cliente),
    caixa: criarRepositorioCaixa(cliente),
    relacao: criarRepositorioRelacao(cliente),
    casa: criarRepositorioCasa(cliente),
  };
}
