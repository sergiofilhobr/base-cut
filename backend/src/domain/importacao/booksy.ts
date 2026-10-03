import { normalizarEmail, normalizarTelefone } from "../cliente/identidade.ts";

export type LinhaBooksy = { nome: string; telefone: string; email: string | null };

export function lerCsvBooksy(texto: string): LinhaBooksy[] {
  const linhas = texto.replace(/^\uFEFF/, "").split(/\r?\n/).filter((linha) => linha.trim() !== "");
  if (linhas.length < 2) return [];
  const cabecalho = separar(linhas[0] ?? "").map((coluna) => coluna.trim().toLowerCase());
  const nomeIdx = indice(cabecalho, ["nome", "name", "client", "cliente"]);
  const telefoneIdx = indice(cabecalho, ["telefone", "phone", "celular", "mobile"]);
  const emailIdx = indice(cabecalho, ["email", "e-mail"]);
  if (nomeIdx < 0 || telefoneIdx < 0) return [];

  const fichas: LinhaBooksy[] = [];
  for (const linha of linhas.slice(1)) {
    const colunas = separar(linha);
    const nome = (colunas[nomeIdx] ?? "").trim();
    const telefone = normalizarTelefone(colunas[telefoneIdx] ?? "");
    if (!nome || !telefone) continue;
    const emailBruto = emailIdx >= 0 ? (colunas[emailIdx] ?? "") : "";
    fichas.push({ nome, telefone, email: emailBruto ? normalizarEmail(emailBruto) : null });
  }
  return fichas;
}

function indice(cabecalho: string[], nomes: string[]) {
  return cabecalho.findIndex((coluna) => nomes.includes(coluna));
}

function separar(linha: string) {
  const colunas: string[] = [];
  let atual = "";
  let aspas = false;
  for (const char of linha) {
    if (char === '"') {
      aspas = !aspas;
      continue;
    }
    if (char === "," && !aspas) {
      colunas.push(atual);
      atual = "";
      continue;
    }
    atual += char;
  }
  colunas.push(atual);
  return colunas;
}
