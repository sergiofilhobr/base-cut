'use client'

import { useEffect, useState } from 'react'
import { useApi, useSessao } from '../../sessao'
import { Button } from '../../ui/button'
import { Caixa, Campo, Falha } from '../../ui/campo'
import { Carregando, Pagina, Regua, Secao } from '../../ui/secao'
import { useFicha } from '../eu'

type FichaCompleta = {
  id: string
  nome: string
  telefone: string
  email: string | null
  optIn: boolean
  agendamentos: Array<{ id: string; inicio: string; estado: string }>
  historico: Array<{ acao: string; ator: string; em: string }>
}

/** Ficha — os dados que a casa guarda, e o controle sobre eles. */
export default function FichaPage() {
  const ficha = useFicha()
  const api = useApi()
  const sessao = useSessao()
  const [dados, setDados] = useState<FichaCompleta | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [confirmacao, setConfirmacao] = useState('')
  const [excluindo, setExcluindo] = useState(false)
  const [ocupado, setOcupado] = useState<string | null>(null)

  useEffect(() => {
    void api.chamar<FichaCompleta>('/api/conta/ficha').then((resposta) => {
      if (!resposta.ok || !resposta.dados) {
        setErro('A ficha não abriu.')
        return
      }
      setDados(resposta.dados)
    })
  }, [api])

  if (!ficha) {
    return (
      <Pagina titulo="Só o cliente.">
        <p className="text-sm text-muted max-w-prose">A equipe não tem ficha de cliente.</p>
      </Pagina>
    )
  }

  async function mudarMarketing(optIn: boolean) {
    if (!dados) return
    setDados({ ...dados, optIn })
    const resposta = await api.chamar('/api/conta/marketing', { metodo: 'POST', corpo: { optIn } })
    if (!resposta.ok) {
      setDados({ ...dados, optIn: !optIn })
      setErro('Não foi possível mudar a preferência.')
    }
  }

  async function baixar() {
    if (!dados) return
    setOcupado('baixar')
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'minha-ficha-base-cut.json'
    link.click()
    URL.revokeObjectURL(url)
    setOcupado(null)
  }

  async function excluir() {
    setOcupado('excluir')
    const resposta = await api.chamar('/api/conta/excluir', { metodo: 'POST', corpo: {} })
    setOcupado(null)
    if (!resposta.ok) {
      setErro('Não foi possível excluir a ficha.')
      return
    }
    await sessao.sair()
  }

  const visitas = dados?.agendamentos.filter((item) => item.estado === 'concluido').length ?? 0

  return (
    <Pagina
      eyebrow="Seus dados"
      titulo={
        <>
          Sua
          <br />
          <span className="text-muted">ficha.</span>
        </>
      }
    >
      <Regua
        itens={[
          { termo: 'Nome', valor: ficha.nome },
          { termo: 'Telefone', valor: ficha.telefone },
          { termo: 'E-mail', valor: ficha.email ?? '—' },
          { termo: 'Visitas', valor: dados ? String(visitas) : '—' },
        ]}
      />
      <Falha>{erro}</Falha>

      {dados === null ? (
        <Carregando />
      ) : (
        <>
          <Secao titulo="Avisos" descricao="O lembrete do horário vai sempre. Campanha e oferta, só se você quiser.">
            <Caixa
              label="Quero receber campanha e oferta da Base Cut."
              checked={dados.optIn}
              onChange={(e) => void mudarMarketing(e.target.checked)}
            />
          </Secao>

          <Secao titulo="Seus dados" descricao="Tudo o que a casa guarda sobre você, em um arquivo.">
            <Button variant="outline" ocupado={ocupado === 'baixar'} onClick={() => void baixar()}>
              Baixar meus dados
            </Button>
          </Secao>

          <Secao
            titulo="Excluir a ficha"
            descricao="Apaga nome, telefone e e-mail. Os horários passados ficam anônimos. Não tem volta."
          >
            {!excluindo ? (
              <Button variant="ghost" onClick={() => setExcluindo(true)}>
                Quero excluir
              </Button>
            ) : (
              <form
                className="flex flex-col gap-4 max-w-sm"
                noValidate
                onSubmit={(evento) => {
                  evento.preventDefault()
                  if (confirmacao.replace(/\D/g, '') !== ficha.telefone.replace(/\D/g, '')) {
                    setErro('Digite o telefone da ficha para confirmar.')
                    return
                  }
                  setErro(null)
                  void excluir()
                }}
              >
                <Campo
                  label="Digite seu telefone para confirmar"
                  inputMode="tel"
                  value={confirmacao}
                  onChange={(e) => setConfirmacao(e.target.value)}
                  ajuda={ficha.telefone}
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" variant="outline" ocupado={ocupado === 'excluir'}>
                    Excluir de vez
                  </Button>
                  <Button variant="quiet" onClick={() => setExcluindo(false)}>
                    Deixar como está
                  </Button>
                </div>
              </form>
            )}
          </Secao>
        </>
      )}
    </Pagina>
  )
}
