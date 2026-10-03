import type { ItemDeConta } from "../domain/caixa/total.ts";

export type Produto = { id: string; nome: string; precoCentavos: number; estoque: number };

export type AtendimentoGravado = {
  id: string;
  clienteId: string;
  totalCentavos: number;
  itens: ItemDeConta[];
  descontoCentavos: number;
  gorjetaCentavos: number;
};

export interface RepositorioCaixa {
  produto(id: string): Promise<Produto | null>;
  criarProduto(dados: { nome: string; precoCentavos: number; estoque: number }): Promise<Produto>;
  baixarEstoque(id: string, quantidade: number): Promise<boolean>;
  gravarAtendimento(dados: {
    agendamentoId: string | null;
    clienteId: string;
    descontoCentavos: number;
    gorjetaCentavos: number;
    totalCentavos: number;
    itens: ItemDeConta[];
  }): Promise<AtendimentoGravado>;
  atendimento(id: string): Promise<AtendimentoGravado | null>;
  gravarPagamento(dados: {
    atendimentoId: string | null;
    agendamentoId: string | null;
    clienteId: string;
    meio: "pix" | "cartao" | "dinheiro" | "vale";
    valorCentavos: number;
    situacao: "pendente" | "pago";
    origem: "sinal" | "cadeira";
    provedorId: string | null;
  }): Promise<{ id: string }>;
  criarVale(dados: { codigo: string; clienteId: string | null; saldoCentavos: number }): Promise<{ id: string }>;
  valePorCodigo(codigo: string): Promise<{ id: string; saldoCentavos: number } | null>;
  debitarVale(id: string, valorCentavos: number): Promise<boolean>;
  criarPlano(dados: { clienteId: string; nome: string; valorCentavos: number }): Promise<{ id: string }>;
}

export interface Cobrancas {
  criar(pedido: {
    valorCentavos: number;
    meio: "pix" | "cartao";
    descricao: string;
  }): Promise<{ provedorId: string; situacao: "pendente" | "pago" }>;
}
