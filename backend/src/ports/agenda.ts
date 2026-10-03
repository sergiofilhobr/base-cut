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

export interface RepositorioAgenda {
  barbeiroAtivo(): Promise<Barbeiro | null>;
  listarServicosAtivos(): Promise<Servico[]>;
  servicosPorIds(ids: string[]): Promise<Servico[]>;
  clientePorTelefone(telefone: string): Promise<Cliente | null>;
  clientePorEmail(email: string): Promise<Cliente | null>;
  expediente(barbeiroId: string, diaSemana: number): Promise<Faixa[]>;
  ocupados(barbeiroId: string, de: Date, ate: Date): Promise<Intervalo[]>;
  indisponibilidades(barbeiroId: string, de: Date, ate: Date): Promise<Intervalo[]>;
  substituirExpediente(
    barbeiroId: string,
    faixas: Array<{ diaSemana: number; inicio: string; fim: string }>,
  ): Promise<void>;
  gravarAgendamento(dados: NovoAgendamento): Promise<AgendamentoGravado>;
  semearSeVazio(dados: {
    barbeiro: string;
    servicos: Array<{ nome: string; duracaoMinutos: number; precoCentavos: number }>;
  }): Promise<void>;
}
