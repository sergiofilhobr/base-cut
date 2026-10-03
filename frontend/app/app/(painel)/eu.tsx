'use client'

import { createContext, useContext } from 'react'

export type Ficha = { id: string; nome: string; telefone: string; email: string | null }

export type Eu =
  | { tipo: 'equipe'; papel: 'admin' | 'barbeiro' | 'recepcao' | 'membro'; userId: string }
  | { tipo: 'cliente'; email: string; ficha: Ficha | null; erro?: string }

export const EuContext = createContext<{ eu: Eu; recarregar: () => Promise<void> } | null>(null)

export function useEu() {
  const valor = useContext(EuContext)
  if (!valor) throw new Error('useEu fora do Portão')
  return valor
}

export function useEquipe() {
  const { eu } = useEu()
  return eu.tipo === 'equipe' ? eu : null
}

export function useFicha() {
  const { eu } = useEu()
  return eu.tipo === 'cliente' ? eu.ficha : null
}
