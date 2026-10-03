import assert from "node:assert/strict";
import test from "node:test";
import type { Cliente, RepositorioAgenda } from "../ports/agenda.ts";
import { importarBooksy } from "./importar-booksy.ts";

test("não duplica telefone que já tem ficha", async () => {
  const fichas: Cliente[] = [
    { id: "ana", nome: "Ana", telefone: "47999990001", email: "ana@email.com", clerkUserId: null },
  ];
  const agenda = {
    async clientePorTelefone(telefone: string) {
      return fichas.find((ficha) => ficha.telefone === telefone) ?? null;
    },
    async clientePorEmail(email: string) {
      return fichas.find((ficha) => ficha.email === email) ?? null;
    },
    async criarCliente(dados: { nome: string; telefone: string; email: string | null }) {
      const criada: Cliente = { id: "novo", clerkUserId: null, ...dados };
      fichas.push(criada);
      return criada;
    },
  } as unknown as RepositorioAgenda;

  const csv = ["nome,telefone,email", "Ana,47999990001,ana@email.com", "Bia,47999990002,bia@email.com"].join("\n");
  const resultado = await importarBooksy(agenda, csv);
  assert.deepEqual(resultado, { criados: 1, existentes: 1, lidos: 2 });
});
