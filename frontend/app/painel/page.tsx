import type { Metadata } from 'next'
import { Painel } from './painel'

export const metadata: Metadata = {
  title: 'Painel — Base Cut',
  robots: { index: false, follow: false },
}

export default function PainelPage() {
  const configurado = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
  return (
    <div className="bg-paper px-4 sm:px-6 pt-24 pb-16">
      <h1 className="font-display text-4xl font-black uppercase leading-none text-ink">
        Agenda
      </h1>
      {configurado ? (
        <Painel />
      ) : (
        <p className="mt-8 max-w-sm text-sm text-muted">
          O painel pede a conta da equipe no Clerk. Sem a chave, a agenda da casa não abre.
        </p>
      )}
    </div>
  )
}
