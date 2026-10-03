export type TipoMensagem = "confirmacao" | "lembrete_24h" | "lembrete_2h" | "aviso_bruno";

export interface RepositorioMensagens {
  canalAtivo(): Promise<boolean>;
  desligarCanal(): Promise<void>;
  jaEnviada(agendamentoId: string, tipo: TipoMensagem): Promise<boolean>;
  registrar(agendamentoId: string, tipo: TipoMensagem): Promise<void>;
}

export interface Mensageiro {
  enviar(pedido: { para: string; texto: string }): Promise<{ ok: true } | { ok: false; banido: boolean }>;
}
