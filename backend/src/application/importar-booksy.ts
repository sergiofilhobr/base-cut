import { lerCsvBooksy } from "../domain/importacao/booksy.ts";
import type { RepositorioAgenda } from "../ports/agenda.ts";

export async function importarBooksy(agenda: RepositorioAgenda, csv: string) {
  const linhas = lerCsvBooksy(csv);
  let criados = 0;
  let existentes = 0;
  for (const linha of linhas) {
    const porTelefone = await agenda.clientePorTelefone(linha.telefone);
    if (porTelefone) {
      existentes += 1;
      continue;
    }
    let email = linha.email;
    if (email) {
      const porEmail = await agenda.clientePorEmail(email);
      if (porEmail) email = null;
    }
    await agenda.criarCliente({ nome: linha.nome, telefone: linha.telefone, email });
    criados += 1;
  }
  return { criados, existentes, lidos: linhas.length };
}
