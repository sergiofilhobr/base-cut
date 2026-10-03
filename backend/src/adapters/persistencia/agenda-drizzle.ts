import { and, asc, eq, gt, inArray, lt, ne } from "drizzle-orm";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Sql } from "postgres";
import type { Faixa } from "../../domain/agenda/horarios-livres.ts";
import type { EstadoAgendamento } from "../../domain/agenda/regras.ts";
import type {
  AgendamentoDetalhe,
  AgendamentoGravado,
  Cliente,
  NovoAgendamento,
  RepositorioAgenda,
  Servico,
} from "../../ports/agenda.ts";
import {
  agendamentos,
  barbeiros,
  clientes,
  expedientes,
  indisponibilidades,
  itensAgendamento,
  servicos,
} from "./schema.ts";
import * as schema from "./schema.ts";

type BancoDrizzle = PostgresJsDatabase<typeof schema>;

export function criarRepositorioAgenda(cliente: Sql): RepositorioAgenda {
  const db = drizzle(cliente, { schema });

  return {
    async barbeiroAtivo() {
      const [barbeiro] = await db
        .select({ id: barbeiros.id, nome: barbeiros.nome })
        .from(barbeiros)
        .where(eq(barbeiros.ativo, true))
        .orderBy(asc(barbeiros.nome))
        .limit(1);
      return barbeiro ?? null;
    },

    async barbeiroPorId(id) {
      const [barbeiro] = await db
        .select({ id: barbeiros.id, nome: barbeiros.nome })
        .from(barbeiros)
        .where(and(eq(barbeiros.id, id), eq(barbeiros.ativo, true)))
        .limit(1);
      return barbeiro ?? null;
    },

    async listarBarbeirosAtivos() {
      return db
        .select({ id: barbeiros.id, nome: barbeiros.nome })
        .from(barbeiros)
        .where(eq(barbeiros.ativo, true))
        .orderBy(asc(barbeiros.nome));
    },

    async listarServicosAtivos() {
      const linhas = await db
        .select()
        .from(servicos)
        .where(eq(servicos.ativo, true))
        .orderBy(asc(servicos.nome));
      return linhas.map(paraServico);
    },

    async servicosPorIds(ids) {
      if (ids.length === 0) return [];
      const linhas = await db.select().from(servicos).where(inArray(servicos.id, ids));
      return linhas.map(paraServico);
    },

    async clientePorTelefone(telefone) {
      const [linha] = await db
        .select()
        .from(clientes)
        .where(eq(clientes.telefone, telefone))
        .limit(1);
      return linha ? paraCliente(linha) : null;
    },

    async clientePorEmail(email) {
      const [linha] = await db
        .select()
        .from(clientes)
        .where(eq(clientes.email, email))
        .limit(1);
      return linha ? paraCliente(linha) : null;
    },

    async expediente(barbeiroId, diaSemana) {
      const linhas = await db
        .select({ inicio: expedientes.inicio, fim: expedientes.fim })
        .from(expedientes)
        .where(
          and(eq(expedientes.barbeiroId, barbeiroId), eq(expedientes.diaSemana, diaSemana)),
        )
        .orderBy(asc(expedientes.inicio));
      return linhas;
    },

    async ocupados(barbeiroId, de, ate, excetoAgendamentoId) {
      const filtros = [
        eq(agendamentos.barbeiroId, barbeiroId),
        eq(agendamentos.estado, "confirmado"),
        lt(agendamentos.inicio, ate),
        gt(agendamentos.fim, de),
      ];
      if (excetoAgendamentoId) filtros.push(ne(agendamentos.id, excetoAgendamentoId));
      return db
        .select({ inicio: agendamentos.inicio, fim: agendamentos.fim })
        .from(agendamentos)
        .where(and(...filtros));
    },

    async buscarAgendamento(id) {
      const [linha] = await db
        .select({
          id: agendamentos.id,
          barbeiroId: agendamentos.barbeiroId,
          clienteId: agendamentos.clienteId,
          telefone: clientes.telefone,
          inicio: agendamentos.inicio,
          fim: agendamentos.fim,
          estado: agendamentos.estado,
          presencaAvisadaEm: agendamentos.presencaAvisadaEm,
        })
        .from(agendamentos)
        .innerJoin(clientes, eq(clientes.id, agendamentos.clienteId))
        .where(eq(agendamentos.id, id))
        .limit(1);
      if (!linha) return null;
      const itens = await db
        .select({
          servicoId: itensAgendamento.servicoId,
          nome: itensAgendamento.nome,
          duracaoMinutos: itensAgendamento.duracaoMinutos,
          precoCentavos: itensAgendamento.precoCentavos,
        })
        .from(itensAgendamento)
        .where(eq(itensAgendamento.agendamentoId, id));
      return {
        ...linha,
        estado: linha.estado as EstadoAgendamento,
        itens,
      } satisfies AgendamentoDetalhe;
    },

    async cancelarAgendamento(id, estado) {
      await db.update(agendamentos).set({ estado }).where(eq(agendamentos.id, id));
    },

    async reagendarAgendamento(id, inicio, fim) {
      await db
        .update(agendamentos)
        .set({ inicio, fim, presencaAvisadaEm: null })
        .where(eq(agendamentos.id, id));
    },

    async indisponibilidades(barbeiroId, de, ate) {
      return db
        .select({ inicio: indisponibilidades.inicio, fim: indisponibilidades.fim })
        .from(indisponibilidades)
        .where(
          and(
            eq(indisponibilidades.barbeiroId, barbeiroId),
            lt(indisponibilidades.inicio, ate),
            gt(indisponibilidades.fim, de),
          ),
        );
    },

    async substituirExpediente(barbeiroId, faixas) {
      await db.delete(expedientes).where(eq(expedientes.barbeiroId, barbeiroId));
      if (faixas.length === 0) return;
      await db.insert(expedientes).values(
        faixas.map((faixa) => ({
          barbeiroId,
          diaSemana: faixa.diaSemana,
          inicio: faixa.inicio,
          fim: faixa.fim,
        })),
      );
    },

    async gravarAgendamento(dados) {
      return db.transaction(async (transacao) => {
        const clienteId = await resolverCliente(transacao, dados.cliente);
        const [gravado] = await transacao
          .insert(agendamentos)
          .values({
            barbeiroId: dados.barbeiroId,
            clienteId,
            inicio: dados.inicio,
            fim: dados.fim,
            estado: "confirmado",
            origem: dados.origem,
          })
          .returning({
            id: agendamentos.id,
            inicio: agendamentos.inicio,
            fim: agendamentos.fim,
            estado: agendamentos.estado,
          });
        await transacao.insert(itensAgendamento).values(
          dados.itens.map((item) => ({
            agendamentoId: gravado.id,
            servicoId: item.servicoId,
            nome: item.nome,
            duracaoMinutos: item.duracaoMinutos,
            precoCentavos: item.precoCentavos,
          })),
        );
        return {
          id: gravado.id,
          clienteId,
          inicio: gravado.inicio,
          fim: gravado.fim,
          estado: "confirmado" as const,
        };
      });
    },

    async semearSeVazio(dados) {
      const [barbeiroExistente] = await db.select({ id: barbeiros.id }).from(barbeiros).limit(1);
      const barbeiroId = barbeiroExistente
        ? barbeiroExistente.id
        : (
            await db
              .insert(barbeiros)
              .values({ nome: dados.barbeiro, ativo: true })
              .returning({ id: barbeiros.id })
          )[0].id;

      const [servico] = await db.select({ id: servicos.id }).from(servicos).limit(1);
      if (!servico && dados.servicos.length > 0) {
        await db.insert(servicos).values(
          dados.servicos.map((item) => ({
            nome: item.nome,
            duracaoMinutos: item.duracaoMinutos,
            precoCentavos: item.precoCentavos,
            ativo: true,
          })),
        );
      }

      const [faixa] = await db.select({ id: expedientes.id }).from(expedientes).limit(1);
      if (!faixa && dados.expediente.length > 0) {
        await db.insert(expedientes).values(
          dados.expediente.map((item) => ({
            barbeiroId,
            diaSemana: item.diaSemana,
            inicio: item.inicio,
            fim: item.fim,
          })),
        );
      }
    },
  };
}

async function resolverCliente(
  db: BancoDrizzle,
  cliente: NovoAgendamento["cliente"],
): Promise<string> {
  if ("id" in cliente) return cliente.id;
  const [criado] = await db
    .insert(clientes)
    .values({
      nome: cliente.nome,
      telefone: cliente.telefone,
      email: cliente.email,
    })
    .returning({ id: clientes.id });
  return criado.id;
}

function paraServico(linha: typeof servicos.$inferSelect): Servico {
  return {
    id: linha.id,
    nome: linha.nome,
    duracaoMinutos: linha.duracaoMinutos,
    precoCentavos: linha.precoCentavos,
    ativo: linha.ativo,
  };
}

function paraCliente(linha: typeof clientes.$inferSelect): Cliente {
  return {
    id: linha.id,
    nome: linha.nome,
    telefone: linha.telefone,
    email: linha.email,
  };
}

export type { Faixa, AgendamentoGravado };
