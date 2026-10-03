export type ServicoAgenda = {
  id: string
  nome: string
  duracaoMinutos: number
  precoCentavos: number
}

export type BarbeiroAgenda = {
  id: string
  nome: string
}

export function urlDaApiNoServidor(caminho: string) {
  const base = process.env.API_URL ?? 'http://localhost:4000'
  return `${base}${caminho}`
}

export function formatarDuracao(minutos: number) {
  if (minutos % 60 === 0) return `${minutos / 60}h`
  if (minutos > 60) {
    const horas = Math.floor(minutos / 60)
    const resto = minutos % 60
    return `${horas}h${String(resto).padStart(2, '0')}`
  }
  return `${minutos}min`
}

export function formatarPreco(centavos: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(centavos / 100)
}

export function diaCivil(instante = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instante)
}

export function somarDias(dia: string, dias: number) {
  const data = new Date(`${dia}T12:00:00-03:00`)
  data.setUTCDate(data.getUTCDate() + dias)
  return diaCivil(data)
}

export function formatarHorario(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function formatarDiaLongo(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(iso))
}

export async function servicosDaApi(): Promise<ServicoAgenda[] | null> {
  try {
    const resposta = await fetch(urlDaApiNoServidor('/api/servicos'), {
      signal: AbortSignal.timeout(1500),
    })
    if (!resposta.ok) return null
    const dados = (await resposta.json()) as { servicos?: ServicoAgenda[] }
    if (!Array.isArray(dados.servicos) || dados.servicos.length === 0) return null
    return dados.servicos
  } catch {
    return null
  }
}

/** "ter, 3 out" — para listas densas. */
export function formatarDataCurta(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
    .format(new Date(iso))
    .replace('.', '')
}

/** O dia civil (YYYY-MM-DD) de um instante, no fuso da casa. */
export function diaCivilDe(iso: string) {
  return diaCivil(new Date(iso))
}

/** Intervalo [de, ate) de um dia civil, em ISO. */
export function intervaloDoDia(dia: string) {
  const inicio = new Date(`${dia}T00:00:00-03:00`)
  return {
    de: inicio.toISOString(),
    ate: new Date(inicio.getTime() + 24 * 60 * 60 * 1000).toISOString(),
  }
}

/** Intervalo [segunda, segunda seguinte) da semana que contém o dia. */
export function intervaloDaSemana(dia: string) {
  const meioDia = new Date(`${dia}T12:00:00-03:00`)
  const domingoZero = meioDia.getUTCDay()
  const iso = domingoZero === 0 ? 7 : domingoZero
  const segunda = somarDias(dia, 1 - iso)
  const de = new Date(`${segunda}T00:00:00-03:00`)
  return {
    de: de.toISOString(),
    ate: new Date(de.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

export const ROTULO_ESTADO: Record<string, string> = {
  confirmado: 'Confirmado',
  concluido: 'Concluído',
  falta: 'Falta',
  cancelado_pelo_cliente: 'Cancelado',
  cancelado_pela_casa: 'Cancelado pela casa',
}

export function rotuloEstado(estado: string) {
  return ROTULO_ESTADO[estado] ?? estado
}

/** Valor em centavos para o input: "50,00" ↔ 5000. */
export function reaisParaCentavos(texto: string) {
  const numero = Number(texto.replace(/\./g, '').replace(',', '.'))
  if (!Number.isFinite(numero)) return null
  return Math.round(numero * 100)
}
