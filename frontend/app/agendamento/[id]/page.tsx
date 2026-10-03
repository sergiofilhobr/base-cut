import type { Metadata } from 'next'
import { AlterarHorario } from './alterar'

export const metadata: Metadata = {
  title: 'Seu horário — Base Cut Barbearia',
  robots: { index: false, follow: false },
}

export default async function AgendamentoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div className="bg-paper px-6 sm:px-10 pt-24 pb-28">
      <h1 className="font-display font-black uppercase text-ink text-[2.5rem] sm:text-6xl leading-[0.88] tracking-[-0.02em]">
        Seu
        <br />
        <span className="text-muted">horário.</span>
      </h1>
      <AlterarHorario id={id} />
    </div>
  )
}
