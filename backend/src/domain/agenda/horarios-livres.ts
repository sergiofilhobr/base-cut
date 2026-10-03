import {
  ANTECEDENCIA_MAXIMA_DIAS,
  ANTECEDENCIA_MINIMA_MINUTOS,
} from "./regras.ts";

const FUSO = "-03:00";
export const PASSO_MINUTOS = 15;

export type Intervalo = { inicio: Date; fim: Date };
export type Faixa = { inicio: string; fim: string };

export function instanteLocal(dia: string, hora: string): Date {
  return new Date(`${dia}T${hora}:00${FUSO}`);
}

/** Segunda = 1, domingo = 7. O dia é uma data civil em America/Sao_Paulo. */
export function diaDaSemanaIso(dia: string): number {
  const meioDia = new Date(`${dia}T12:00:00${FUSO}`);
  const domingoZero = meioDia.getUTCDay();
  return domingoZero === 0 ? 7 : domingoZero;
}

export function limitesDoDia(dia: string): Intervalo {
  const inicio = instanteLocal(dia, "00:00");
  const fim = new Date(inicio.getTime() + 24 * 60 * 60 * 1000);
  return { inicio, fim };
}

function cruza(a: Intervalo, b: Intervalo): boolean {
  return a.inicio < b.fim && b.inicio < a.fim;
}

function somarMinutos(data: Date, minutos: number): Date {
  return new Date(data.getTime() + minutos * 60 * 1000);
}

export function horariosLivres(entrada: {
  dia: string;
  duracaoMinutos: number;
  faixas: Faixa[];
  ocupados: Intervalo[];
  indisponibilidades: Intervalo[];
  agora: Date;
  origem: "site" | "equipe";
  passoMinutos?: number;
}): Date[] {
  const passo = entrada.passoMinutos ?? PASSO_MINUTOS;
  const minimo = new Date(
    entrada.agora.getTime() + ANTECEDENCIA_MINIMA_MINUTOS * 60 * 1000,
  );
  const maximo = new Date(
    entrada.agora.getTime() + ANTECEDENCIA_MAXIMA_DIAS * 24 * 60 * 60 * 1000,
  );
  const livres: Date[] = [];

  for (const faixa of entrada.faixas) {
    let cursor = instanteLocal(entrada.dia, faixa.inicio);
    const fimDaFaixa = instanteLocal(entrada.dia, faixa.fim);

    while (cursor.getTime() + entrada.duracaoMinutos * 60 * 1000 <= fimDaFaixa.getTime()) {
      const fim = somarMinutos(cursor, entrada.duracaoMinutos);
      const bloco = { inicio: cursor, fim };
      const dentroDaAntecedencia =
        entrada.origem === "equipe" || (cursor >= minimo && cursor <= maximo);
      const cabe =
        !entrada.ocupados.some((ocupado) => cruza(bloco, ocupado)) &&
        !entrada.indisponibilidades.some((bloqueio) => cruza(bloco, bloqueio));

      if (dentroDaAntecedencia && cabe) livres.push(cursor);
      cursor = somarMinutos(cursor, passo);
    }
  }

  return livres;
}
