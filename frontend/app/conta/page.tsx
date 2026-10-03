import type { Metadata } from 'next'
import { EntradaCliente } from './entrada'

export const metadata: Metadata = {
  title: 'Sua ficha — Base Cut Barbearia',
  robots: { index: false, follow: false },
}

export default function ContaPage() {
  const configurado = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

  return (
    <div className="bg-paper px-6 sm:px-10 pt-24 pb-28">
      <h1 className="font-display font-black uppercase text-ink text-[2.5rem] sm:text-6xl leading-[0.88] tracking-[-0.02em]">
        Sua
        <br />
        <span className="text-muted">ficha.</span>
      </h1>
      {configurado ? (
        <EntradaCliente />
      ) : (
        <p className="mt-10 max-w-xl text-sm text-muted">
          A entrada da ficha ainda não está configurada. O código chega pelo
          e-mail que já está na marcação.
        </p>
      )}
    </div>
  )
}
