import type { Intencao } from "../../ports/interpretador.ts";

export function interpretarTexto(texto: string): Intencao {
  const normalizado = texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

  if (/\b(cancel|desmarc|nao vou|não vou)\b/.test(texto.toLowerCase()) || /\b(cancel|desmarc|nao vou)\b/.test(normalizado)) {
    return "cancelar";
  }
  if (/\b(outro horario|remarcar|mudar|reagendar|trocar)\b/.test(normalizado)) {
    return "outro_horario";
  }
  if (/\b(confirmo|confirmado|presenca|presente|sim|ok|vou)\b/.test(normalizado)) {
    return "presenca";
  }
  return "desconhecida";
}
