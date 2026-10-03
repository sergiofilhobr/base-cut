'use client'

import { useEu } from './eu'
import { Hoje } from './hoje'
import { Horarios } from './horarios'

/** A porta de entrada muda com quem entrou: a casa vê o dia, o cliente os seus horários. */
export default function InicioDoApp() {
  const { eu } = useEu()
  return eu.tipo === 'equipe' ? <Hoje /> : <Horarios />
}
