export type Intencao = "presenca" | "cancelar" | "outro_horario" | "desconhecida";

/** O Eve só lê o texto. Não vê o banco e não marca horário. */
export interface Interpretador {
  interpretar(texto: string): Promise<Intencao>;
}
