'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useApi } from '../../sessao'
import { Button } from '../../ui/button'
import { Caixa, Falha, Selecao } from '../../ui/campo'
import { Carregando, Pagina, Secao } from '../../ui/secao'
import { SoEquipe } from '../agenda/page'
import { useEquipe } from '../eu'

type Faixa = { diaSemana: number; inicio: string; fim: string }
type Barbeiro = { id: string; nome: string }
type DiaDaSemana = { diaSemana: number; atende: boolean; inicio: string; fim: string }

const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

/** Expediente — as faixas recorrentes da semana, uma por dia. */
export default function ExpedientePage() {
  const equipe = useEquipe()
  const api = useApi()
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([])
  const [barbeiroId, setBarbeiroId] = useState('')
  const [semana, setSemana] = useState<DiaDaSemana[] | null>(null)
  const [semanaDe, setSemanaDe] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [salvoEm, setSalvoEm] = useState<string | null>(null)

  useEffect(() => {
    void api.chamar<{ barbeiros: Barbeiro[] }>('/api/barbeiros').then((r) => setBarbeiros(r.dados?.barbeiros ?? []))
  }, [api])

  useEffect(() => {
    const filtro = barbeiroId ? `?barbeiroId=${encodeURIComponent(barbeiroId)}` : ''
    void api.chamar<{ faixas: Faixa[] }>(`/api/expediente${filtro}`).then((resposta) => {
      setSemanaDe(barbeiroId)
      if (!resposta.ok || !resposta.dados) {
        setErro(resposta.status === 401 ? 'A conta precisa ser da equipe.' : 'O expediente não abriu.')
        setSemana([])
        return
      }
      setErro(null)
      const faixas = resposta.dados.faixas
      setSemana(
        DIAS.map((_, indice) => {
          const faixa = faixas.find((item) => item.diaSemana === indice + 1)
          return {
            diaSemana: indice + 1,
            atende: Boolean(faixa),
            inicio: faixa?.inicio ?? '09:00',
            fim: faixa?.fim ?? '19:00',
          }
        }),
      )
    })
  }, [api, barbeiroId])

  if (!equipe) return <SoEquipe />

  function mudar(diaSemana: number, dados: Partial<DiaDaSemana>) {
    setSemana((atual) => atual?.map((dia) => (dia.diaSemana === diaSemana ? { ...dia, ...dados } : dia)) ?? atual)
    setSalvoEm(null)
  }

  async function salvar(evento: FormEvent) {
    evento.preventDefault()
    if (!semana) return
    const invalido = semana.find((dia) => dia.atende && dia.inicio >= dia.fim)
    if (invalido) {
      setErro(`${DIAS[invalido.diaSemana - 1]}: o fim precisa vir depois do começo.`)
      return
    }
    setErro(null)
    setOcupado(true)
    const faixas = semana
      .filter((dia) => dia.atende)
      .map(({ diaSemana, inicio, fim }) => ({ diaSemana, inicio, fim }))
    const resposta = await api.chamar('/api/expediente', {
      metodo: 'PUT',
      corpo: { faixas, barbeiroId: barbeiroId || undefined },
    })
    setOcupado(false)
    if (!resposta.ok) {
      setErro('Não foi possível gravar o expediente.')
      return
    }
    setSalvoEm(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
  }

  return (
    <Pagina
      eyebrow="Semana a semana"
      titulo={
        <>
          Expediente
          <br />
          <span className="text-muted">da casa.</span>
        </>
      }
    >
      {barbeiros.length > 1 && (
        <Selecao label="Profissional" value={barbeiroId} onChange={(e) => setBarbeiroId(e.target.value)} className="max-w-xs">
          <option value="">Primeiro da casa</option>
          {barbeiros.map((barbeiro) => (
            <option key={barbeiro.id} value={barbeiro.id}>
              {barbeiro.nome}
            </option>
          ))}
        </Selecao>
      )}

      <Secao
        titulo="Dias e horas"
        descricao="Os horários livres do site nascem daqui. Fora dessas faixas ninguém marca."
      >
        {semana === null || semanaDe !== barbeiroId ? (
          <Carregando />
        ) : (
          <form onSubmit={salvar} noValidate>
            <ul>
              {semana.map((dia) => (
                <li
                  key={dia.diaSemana}
                  className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[10rem_minmax(0,1fr)] items-center gap-x-6 gap-y-3 border-b border-rule py-4"
                >
                  <Caixa
                    label={<span className="text-base">{DIAS[dia.diaSemana - 1]}</span>}
                    checked={dia.atende}
                    onChange={(e) => mudar(dia.diaSemana, { atende: e.target.checked })}
                  />
                  <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
                    <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                      das
                      <input
                        type="time"
                        value={dia.inicio}
                        disabled={!dia.atende}
                        onChange={(e) => mudar(dia.diaSemana, { inicio: e.target.value })}
                        className="input w-28 px-2 font-sans text-base tracking-normal"
                      />
                    </label>
                    <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                      às
                      <input
                        type="time"
                        value={dia.fim}
                        disabled={!dia.atende}
                        onChange={(e) => mudar(dia.diaSemana, { fim: e.target.value })}
                        className="input w-28 px-2 font-sans text-base tracking-normal"
                      />
                    </label>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button type="submit" ocupado={ocupado}>
                Salvar expediente
              </Button>
              <Falha>{erro}</Falha>
              {salvoEm && !erro && (
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted" aria-live="polite">
                  Gravado às {salvoEm}
                </span>
              )}
            </div>
          </form>
        )}
      </Secao>
    </Pagina>
  )
}
