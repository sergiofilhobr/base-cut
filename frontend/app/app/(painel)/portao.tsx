'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useApi, useSessao } from '../sessao'
import { Button } from '../ui/button'
import { Caixa, Campo, Falha } from '../ui/campo'
import { EuContext, type Eu } from './eu'
import { Shell } from './shell'

/**
 * Portão — quem entrou, e o que pode ver.
 *
 * Pergunta à API `/api/eu`: equipe recebe o painel; cliente com ficha recebe
 * a própria agenda; cliente sem ficha completa o cadastro aqui mesmo, antes
 * de ver qualquer coisa. Sem sessão, vai para /app/entrar.
 */
export function Portao({ children }: { children: ReactNode }) {
  const sessao = useSessao()
  const api = useApi()
  const router = useRouter()
  const [eu, setEu] = useState<Eu | 'sem-acesso' | 'fora' | null>(null)

  const carregar = useCallback(
    () =>
      api.chamar<Eu>('/api/eu').then((resposta) => {
        if (resposta.status === 401) {
          setEu('sem-acesso')
          return
        }
        if (!resposta.ok || !resposta.dados) {
          setEu('fora')
          return
        }
        setEu(resposta.dados)
      }),
    [api],
  )

  useEffect(() => {
    if (!sessao.pronto || sessao.modo === 'ausente') return
    if (!sessao.entrou) {
      router.replace('/app/entrar')
      return
    }
    void carregar()
  }, [carregar, router, sessao.entrou, sessao.modo, sessao.pronto])

  if (sessao.modo === 'ausente') {
    return (
      <Moldura>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Falta configurar</p>
        <p className="mt-3 text-sm text-ink max-w-prose">
          O app precisa da chave do Clerk ou do modo local de desenvolvimento.{' '}
          <Link href="/app/entrar" className="border-b border-rule hover:border-ink">
            Ver o que falta
          </Link>
          .
        </p>
      </Moldura>
    )
  }

  if (!sessao.pronto || !sessao.entrou || eu === null) {
    return (
      <Moldura>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted" aria-live="polite">
          Abrindo.
        </p>
      </Moldura>
    )
  }

  if (eu === 'fora') {
    return (
      <Moldura>
        <Falha>A agenda não respondeu. Tente de novo em instantes.</Falha>
        <Button variant="outline" className="mt-6" onClick={() => void carregar()}>
          Tentar de novo
        </Button>
      </Moldura>
    )
  }

  if (eu === 'sem-acesso') {
    return (
      <Moldura>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Sem acesso</p>
        <p className="mt-3 text-sm text-ink max-w-prose">
          Esta conta não é da equipe e não tem e-mail. Entre com outra conta ou fale com a casa.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => void sessao.sair()}>
          Sair
        </Button>
      </Moldura>
    )
  }

  if (eu.tipo === 'cliente' && !eu.ficha) {
    return (
      <Moldura>
        <CompletarFicha email={eu.email} erroDaEntrada={eu.erro} aoConcluir={carregar} />
      </Moldura>
    )
  }

  return (
    <EuContext.Provider value={{ eu, recarregar: carregar }}>
      <Shell>{children}</Shell>
    </EuContext.Provider>
  )
}

function Moldura({ children }: { children: ReactNode }) {
  const sessao = useSessao()
  return (
    <div className="min-h-dvh flex flex-col bg-paper">
      <header className="border-b-2 border-ink px-6 sm:px-10 py-4 flex items-center justify-between">
        <Link href="/" className="font-display font-black uppercase tracking-[-0.01em] text-xl text-ink">
          Base<span className="text-muted">Cut</span>
        </Link>
        {sessao.entrou && (
          <Button variant="quiet" size="sm" onClick={() => void sessao.sair()}>
            Sair
          </Button>
        )}
      </header>
      <main className="flex-1 px-6 sm:px-10 py-12 sm:py-16 max-w-xl">{children}</main>
    </div>
  )
}

const ERROS_CADASTRO: Record<string, string> = {
  email_de_outra_ficha: 'Esse e-mail já está na ficha de outro telefone. Confira o número ou fale com a casa.',
  telefone_de_outra_ficha:
    'Esse telefone já tem ficha com outro e-mail. Entre com o e-mail da ficha ou fale com a casa.',
  sem_consentimento: 'A ficha precisa do seu consentimento para existir.',
  pedido_invalido: 'Confira nome e telefone.',
  ficha_de_outro_usuario: 'A ficha deste e-mail já está ligada a outra conta. Fale com a casa.',
}

/** O cadastro em si: o e-mail veio da entrada; faltam nome, telefone e o sim. */
function CompletarFicha({
  email,
  erroDaEntrada,
  aoConcluir,
}: {
  email: string
  erroDaEntrada?: string
  aoConcluir: () => Promise<void>
}) {
  const api = useApi()
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [consentimento, setConsentimento] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const bloqueado = erroDaEntrada === 'ficha_de_outro_usuario'

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    if (!nome.trim() || !telefone.trim()) {
      setErro(ERROS_CADASTRO.pedido_invalido)
      return
    }
    if (!consentimento) {
      setErro(ERROS_CADASTRO.sem_consentimento)
      return
    }
    setEnviando(true)
    const resposta = await api.chamar<{ erro?: string }>('/api/conta/cadastrar', {
      metodo: 'POST',
      corpo: { nome, telefone, consentimento, marketing },
    })
    setEnviando(false)
    if (!resposta.ok) {
      setErro(ERROS_CADASTRO[resposta.dados?.erro ?? ''] ?? 'Não foi possível gravar a ficha. Tente de novo.')
      return
    }
    await aoConcluir()
  }

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">Quase lá</p>
      <h1 className="mt-2 font-display font-black uppercase leading-[0.9] tracking-[-0.02em] text-ink text-4xl sm:text-5xl">
        Complete
        <br />
        <span className="text-muted">a ficha.</span>
      </h1>
      <p className="mt-4 text-sm text-muted max-w-prose">
        O telefone identifica a sua ficha na casa. O e-mail <span className="text-ink">{email}</span>{' '}
        fica para entrar.
      </p>

      {bloqueado ? (
        <div className="mt-10">
          <Falha>{ERROS_CADASTRO.ficha_de_outro_usuario}</Falha>
        </div>
      ) : (
        <form onSubmit={enviar} className="mt-10 flex flex-col gap-5" noValidate>
          <Campo label="Nome" autoComplete="name" value={nome} onChange={(e) => setNome(e.target.value)} required />
          <Campo
            label="Telefone"
            autoComplete="tel"
            inputMode="tel"
            placeholder="47 99999 9999"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            ajuda="Com DDD. É por ele que a casa te acha."
            required
          />
          <Caixa
            label="Concordo em guardar nome, telefone e e-mail para marcar e lembrar os meus horários."
            checked={consentimento}
            onChange={(e) => setConsentimento(e.target.checked)}
            aria-required
          />
          <Caixa
            label="Quero receber campanha e oferta. Posso sair quando quiser."
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
          />
          <Falha>{erro}</Falha>
          <Button type="submit" ocupado={enviando} className="self-start">
            Criar ficha
          </Button>
        </form>
      )}
    </div>
  )
}
