import { existsSync } from "node:fs";
import { serve } from "@hono/node-server";
import { relogioDoSistema } from "./adapters/relogio/relogio-do-sistema.ts";
import { criarAplicacao, semearAgenda } from "./adapters/http/app.ts";
import { criarBanco } from "./adapters/persistencia/banco-drizzle.ts";

if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL ausente");
}

const porta = Number(process.env.PORT ?? 4000);
const banco = criarBanco(databaseUrl);

await banco.aplicarSchema();
await semearAgenda(banco.agenda);

const app = criarAplicacao({
  banco,
  relogio: relogioDoSistema,
  agenda: banco.agenda,
  equipeToken: process.env.EQUIPE_TOKEN,
});

serve({ fetch: app.fetch, port: porta }, () => {
  console.log(`agenda ouvindo em ${porta}`);
});
