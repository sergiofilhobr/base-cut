'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { diaCivil, formatarDiaLongo, formatarHorario, formatarPreco, intervaloDoDia } from '@/app/lib/agenda'
import { useApi } from '../sessao'
import { classesDoBotao } from '../ui/button'
import { Falha } from '../ui/campo'
import { EsqueletoLista, Pagina, Regua, Secao, Vazio } from '../ui/secao'
import { LinhaAgenda, type LinhaDaAgenda, type ServicoBasico } from './agenda/linha-agenda'

type Bloqueio = { id: string; inicio: string; fim: string; motivo: string }
type Caixa = { totalCentavos: number; meios: Array<{ meio: string; valorCentavos: number }> }

const MEIO: Record<string, string> = { pix: 'Pix', cartao: 'Cartão', dinheiro: 'Dinheiro', vale: 'Vale' }

/** Hoje — o dia da casa de relance, com as ações de fechar cada horário. */
export function Hoje() {
  const api = useApi()
  const [linhas, setLinhas] = useState<LinhaDaAgenda[] | null>(null)
  const [bloqueios, setBloqueios] = useState<Bloqueio[]>([])
  const [servicos, setServicos] = useState<ServicoBasico[]>([])
  const [caixa, setCaixa] = useState<Caixa | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [agora, setAgora] = useState(() => new Date().toISOString())
  const hoje = diaCivil()

  const carregar = useCallback(() => {
    const { de, ate } = intervaloDoDia(hoje)
    const agenda = api
      .chamar<{ agendamentos: LinhaDaAgenda[]; bloqueios: Bloqueio[] }>(
        `/api/painel/agenda?de=${encodeURIComponent(de)}&ate=${encodeURIComponent(ate)}`,
      )
      .then((resposta) => {
        if (!resposta.ok || !resposta.dados) {
          setErro(resposta.status === 401 ? 'A conta precisa ser da equipe.' : 'A agenda não respondeu.')
          setLinhas([])
          return
        }
        setErro(null)
        setLinhas(resposta.dados.agendamentos)
        setBloqueios(resposta.dados.bloqueios)
        setAgora(new Date().toISOString())
      })
    const dinheiro = api
      .chamar<Caixa>(`/api/painel/caixa?de=${encodeURIComponent(de)}&ate=${encodeURIComponent(ate)}`)
      .then((resposta) => setCaixa(resposta.dados ?? { totalCentavos: 0, meios: [] }))
    return Promise.all([agenda, dinheiro]).then(() => undefined)
  }, [api, hoje])

  useEffect(() => {
    void carregar()
    void api.chamar<{ servicos: ServicoBasico[] }>('/api/servicos').then((resposta) => {
      setServicos(resposta.dados?.servicos ?? [])
    })
  }, [api, carregar])

  const confirmados = (linhas ?? []).filter((linha) => linha.estado === 'confirmado')
  const proximo = confirmados.find((linha) => linha.inicio > agora)
  const concluidos = (linhas ?? []).filter((linha) => linha.estado === 'concluido').length

  return (
    <Pagina
      eyebrow={formatarDiaLongo(`${hoje}T12:00:00-03:00`)}
      titulo={
        <>
          Hoje
          <br />
          <span className="text-muted">na base.</span>
        </>
      }
      acao={
        <Link href="/app/agenda" className={classesDoBotao({ variant: 'outline' })}>
          Ver a semana
        </Link>
      }
    >
      <Regua
        itens={[
          { termo: 'Marcados', valor: linhas === null ? '—' : String(confirmados.length) },
          {
            termo: 'Próximo',
            valor: proximo ? `${formatarHorario(proximo.inicio)} · ${proximo.nome}` : '—',
          },
          { termo: 'Concluídos', valor: linhas === null ? '—' : String(concluidos) },
          { termo: 'Faturado', valor: caixa === null ? '—' : formatarPreco(caixa.totalCentavos) },
        ]}
      />
      {caixa && caixa.meios.length > 0 && (
        <Regua
          itens={caixa.meios.map((meio) => ({
            termo: MEIO[meio.meio] ?? meio.meio,
            valor: formatarPreco(Number(meio.valorCentavos)),
          }))}
        />
      )}

      <Secao titulo="Horários do dia" descricao="Concluir, registrar falta ou cancelar, direto na linha.">
        {erro && <Falha>{erro}</Falha>}
        {linhas === null ? (
          <EsqueletoLista />
        ) : linhas.length === 0 ? (
          <Vazio>Nenhum horário marcado para hoje.</Vazio>
        ) : (
          <ul className="list">
            {linhas.map((linha) => (
              <LinhaAgenda key={linha.id} linha={linha} servicos={servicos} aoMudar={carregar} compacta />
            ))}
          </ul>
        )}
        {bloqueios.length > 0 && (
          <ul className="list mt-2">
            {bloqueios.map((bloqueio) => (
              <li key={bloqueio.id} className="list-row text-sm text-muted">
                <span className="list-col-grow">
                  {rotuloMotivo(bloqueio.motivo)} · {formatarHorario(bloqueio.inicio)}–{formatarHorario(bloqueio.fim)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Secao>
    </Pagina>
  )
}

export function rotuloMotivo(motivo: string) {
  if (motivo === 'pausa') return 'Pausa'
  if (motivo === 'folga') return 'Folga'
  if (motivo === 'ferias') return 'Férias'
  return 'Trava'
}
