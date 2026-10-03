'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Confirmação e formulário que não cabem na linha. O `<dialog>` do daisy
 * (`modal`) — raio e sombra do tema já são zero; `shadow-none` cobre o
 * que o `modal-box` ainda desenha por cima.
 */
export function Modal({
  aberto,
  titulo,
  onFechar,
  children,
}: {
  aberto: boolean
  titulo: string
  onFechar: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (aberto && !dialog.open) dialog.showModal()
    if (!aberto && dialog.open) dialog.close()
  }, [aberto])

  return (
    <dialog
      ref={ref}
      className="modal"
      onClose={onFechar}
      onCancel={(evento) => {
        evento.preventDefault()
        onFechar()
      }}
    >
      <div className="modal-box shadow-none max-w-lg">
        <h3 className="font-display font-black uppercase tracking-tight text-ink text-2xl">{titulo}</h3>
        <div className="mt-6">{children}</div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit">Fechar</button>
      </form>
    </dialog>
  )
}
