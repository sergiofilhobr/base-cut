export function aplicarCupom(totalCentavos: number, descontoCentavos: number) {
  if (descontoCentavos <= 0 || descontoCentavos > totalCentavos) {
    return { ok: false as const, erro: "cupom_invalido" as const };
  }
  return { ok: true as const, total: totalCentavos - descontoCentavos };
}

export function pontosDaVisita(totalCentavos: number) {
  return Math.floor(totalCentavos / 1000);
}

export function podeReceberCampanha(optIn: boolean) {
  return optIn;
}

export function proximaRecorrencia(diaSemana: number, hora: string, agora: Date) {
  const [horas, minutos] = hora.split(":").map(Number);
  const cursor = new Date(agora.getTime());
  for (let passo = 1; passo <= 8; passo += 1) {
    const candidato = new Date(cursor.getTime() + passo * 24 * 60 * 60 * 1000);
    const partes = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
    }).formatToParts(candidato);
    const dia = partes.find((parte) => parte.type === "year")?.value;
    const mes = partes.find((parte) => parte.type === "month")?.value;
    const diaMes = partes.find((parte) => parte.type === "day")?.value;
    const data = `${dia}-${mes}-${diaMes}`;
    const meioDia = new Date(`${data}T12:00:00-03:00`);
    const iso = meioDia.getUTCDay() === 0 ? 7 : meioDia.getUTCDay();
    if (iso !== diaSemana) continue;
    return new Date(`${data}T${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}:00-03:00`);
  }
  return null;
}

export type LinhaRelatorio = {
  faturamentoCentavos: number;
  ocupados: number;
  faltas: number;
  novos: number;
  recorrentes: number;
};

export function resumirRelatorio(linhas: Array<{ estado: string; totalCentavos: number; clienteNovo: boolean }>): LinhaRelatorio {
  return linhas.reduce(
    (resumo, linha) => ({
      faturamentoCentavos: resumo.faturamentoCentavos + (linha.estado === "concluido" ? linha.totalCentavos : 0),
      ocupados: resumo.ocupados + (linha.estado === "confirmado" || linha.estado === "concluido" ? 1 : 0),
      faltas: resumo.faltas + (linha.estado === "falta" ? 1 : 0),
      novos: resumo.novos + (linha.clienteNovo ? 1 : 0),
      recorrentes: resumo.recorrentes + (linha.clienteNovo ? 0 : 1),
    }),
    { faturamentoCentavos: 0, ocupados: 0, faltas: 0, novos: 0, recorrentes: 0 },
  );
}

export function relatorioCsv(resumo: LinhaRelatorio) {
  return [
    "faturamento_centavos,ocupados,faltas,novos,recorrentes",
    `${resumo.faturamentoCentavos},${resumo.ocupados},${resumo.faltas},${resumo.novos},${resumo.recorrentes}`,
  ].join("\n");
}
