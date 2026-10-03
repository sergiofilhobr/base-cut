import type { Faixa, Intervalo } from "../domain/agenda/horarios-livres.ts";
import type { EstadoAgendamento } from "../domain/agenda/regras.ts";

export type Servico = {
  id: string;
  nome: string;
  duracaoMinutos: number;
  precoCentavos: number;
  ativo: boolean;
};

export type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
};

export type Barbeiro = { id: string; nome: string };

export type NovoAgendamento = {
  barbeiroId: string;
  cliente: { id: string } | { nome: string; telefone: string; email: string };
  inicio: Date;
  fim: Date;
  origem: "site" | "equipe";
  itens: Array<{
    servicoId: string;
    nome: string;
    duracaoMinutos: number;
    precoCentavos: number;
  }>;
};

export type AgendamentoGravado = {
  id: string;
  clienteId: string;
  inicio: Date;
  fim: Date;
  estado: EstadoAgendamento;
};

export type ItemAgendamento = {
  servicoId: string | null;
  nome: string;
  duracaoMinutos: number;
  precoCentavos: number;
};

export type AgendamentoDetalhe = {
  id: string;
  barbeiroId: string;
  clienteId: string;
  telefone: string;
  inicio: Date;
  fim: Date;
  estado: EstadoAgendamento;
  presencaAvisadaEm: Date | null;
  itens: ItemAgendamento[];
};

export interface RepositorioAgenda {
  barbeiroAtivo(): Promise<Barbeiro | null>;
  barbeiroPorId(id: string): Promise<Barbeiro | null>;
  listarBarbeirosAtivos(): Promise<Barbeiro[]>;
  listarServicosAtivos(): Promise<Servico[]>;
  servicosPorIds(ids: string[]): Promise<Servico[]>;
  clientePorTelefone(telefone: string): Promise<Cliente | null>;
  clientePorEmail(email: string): Promise<Cliente | null>;
  expediente(barbeiroId: string, diaSemana: number): Promise<Faixa[]>;
  ocupados(
    barbeiroId: string,
    de: Date,
    ate: Date,
    excetoAgendamentoId?: string,
  ): Promise<Intervalo[]>;
  buscarAgendamento(id: string): Promise<AgendamentoDetalhe | null>;
  cancelarAgendamento(
    id: string,
    estado: "cancelado_pelo_cliente" | "cancelado_pela_casa",
  ): Promise<void>;
  reagendarAgendamento(id: string, inicio: Date, fim: Date): Promise<void>;
  indisponibilidades(barbeiroId: string, de: Date, ate: Date): Promise<Intervalo[]>;
  substituirExpediente(
    barbeiroId: string,
    faixas: Array<{ diaSemana: number; inicio: string; fim: string }>,
  ): Promise<void>;
  gravarAgendamento(dados: NovoAgendamento): Promise<AgendamentoGravado>;
  semearSeVazio(dados: {
    barbeiro: string;
    servicos: Array<{ nome: string; duracaoMinutos: number; precoCentavos: number }>;
    expediente: Array<{ diaSemana: number; inicio: string; fim: string }>;
  }): Promise<void>;
}
