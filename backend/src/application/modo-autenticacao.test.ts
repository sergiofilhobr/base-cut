import assert from "node:assert/strict";
import test from "node:test";
import { decidirAutenticacao } from "./modo-autenticacao.ts";

test("AUTH_LOCAL com NODE_ENV ausente recusa antes de ouvir", () => {
  const decisao = decidirAutenticacao({ nodeEnv: undefined, authLocal: "1", clerkSecret: undefined });
  assert.deepEqual(decisao, { recusar: "AUTH_LOCAL não vale fora de development." });
});

test("AUTH_LOCAL em production recusa", () => {
  const decisao = decidirAutenticacao({ nodeEnv: "production", authLocal: "1", clerkSecret: undefined });
  assert.ok("recusar" in decisao);
});

test("AUTH_LOCAL em development sem Clerk fica local", () => {
  const decisao = decidirAutenticacao({ nodeEnv: "development", authLocal: "1", clerkSecret: undefined });
  assert.deepEqual(decisao, { local: true });
});

test("sem AUTH_LOCAL o processo segue no Clerk", () => {
  const decisao = decidirAutenticacao({ nodeEnv: undefined, authLocal: undefined, clerkSecret: "sk" });
  assert.deepEqual(decisao, { local: false });
});
