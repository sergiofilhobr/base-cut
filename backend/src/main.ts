import { existsSync } from "node:fs";
import { serve } from "@hono/node-server";
import { criarCobrancas } from "./adapters/caixa/cobrancas.ts";
import { criarAutenticacaoClerk } from "./adapters/auth/clerk.ts";
import { criarAutenticacaoLocal } from "./adapters/auth/local.ts";
import { criarInterpretador } from "./adapters/eve/interpretador.ts";
import { criarMensageiroZApi } from "./adapters/whatsapp/z-api.ts";
import { relogioDoSistema } from "./adapters/relogio/relogio-do-sistema.ts";
import { dispararLembretes } from "./application/avisos-whatsapp.ts";
import { decidirAutenticacao } from "./application/modo-autenticacao.ts";
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

const mensageiro = criarMensageiroZApi({
  instanceId: process.env.ZAPI_INSTANCE_ID,
  token: process.env.ZAPI_TOKEN,
  clientToken: process.env.ZAPI_CLIENT_TOKEN,
});
const urlDoSite = process.env.SITE_URL ?? "http://localhost:3000";

const decisao = decidirAutenticacao({
  nodeEnv: process.env.NODE_ENV,
  authLocal: process.env.AUTH_LOCAL,
  clerkSecret: process.env.CLERK_SECRET_KEY,
});
if ("recusar" in decisao) {
  throw new Error(decisao.recusar);
}
if (decisao.local) {
  console.warn("AUTH_LOCAL=1: autenticação local, sem Clerk. Só com NODE_ENV=development.");
}
const autenticacao = decisao.local
  ? criarAutenticacaoLocal()
  : criarAutenticacaoClerk({
      secretKey: process.env.CLERK_SECRET_KEY,
      orgId: process.env.CLERK_ORG_ID,
    });

const app = criarAplicacao({
  banco,
  relogio: relogioDoSistema,
  agenda: banco.agenda,
  autenticacao,
  mensagens: banco.mensagens,
  mensageiro,
  interpretador: criarInterpretador({
    url: process.env.EVE_URL,
    token: process.env.EVE_TOKEN,
  }),
  telefoneDoBruno: process.env.BRUNO_WHATSAPP,
  urlDoSite,
  caixa: banco.caixa,
  cobrancas: criarCobrancas(process.env.MERCADOPAGO_TOKEN),
  relacao: banco.relacao,
  casa: banco.casa,
  urlGoogle:
    process.env.GOOGLE_REVIEW_URL ??
    "https://www.google.com/search?kgmid=/g/11n3q826nd&hl=pt-BR&q=BASE+CUT+BARBEARIA&shndl=30&source=sh/x/loc/osrp/m1/3&kgs=c1b96cf83428199a&shem=shrtsdl&utm_source=shrtsdl,sh/x/loc/osrp/m1/3",
});

const lembrar = () =>
  dispararLembretes(banco.agenda, banco.mensagens, mensageiro, relogioDoSistema, { urlDoSite });
void lembrar();
setInterval(() => {
  void lembrar();
}, 60_000);

serve({ fetch: app.fetch, port: porta }, () => {
  console.log(`agenda ouvindo em ${porta}`);
});
