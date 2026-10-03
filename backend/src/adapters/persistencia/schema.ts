import {
  boolean,
  check,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const barbeiros = pgTable("barbeiros", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  ativo: boolean("ativo").notNull().default(true),
});

export const expedientes = pgTable(
  "expedientes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    barbeiroId: uuid("barbeiro_id")
      .notNull()
      .references(() => barbeiros.id),
    diaSemana: integer("dia_semana").notNull(),
    inicio: text("inicio").notNull(),
    fim: text("fim").notNull(),
  },
  (tabela) => [
    check("expedientes_dia", sql`${tabela.diaSemana} between 1 and 7`),
    check("expedientes_faixa", sql`${tabela.inicio} < ${tabela.fim}`),
  ],
);

export const indisponibilidades = pgTable(
  "indisponibilidades",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    barbeiroId: uuid("barbeiro_id")
      .notNull()
      .references(() => barbeiros.id),
    inicio: timestamp("inicio", { withTimezone: true }).notNull(),
    fim: timestamp("fim", { withTimezone: true }).notNull(),
    motivo: text("motivo").notNull(),
  },
  (tabela) => [
    check(
      "indisponibilidades_motivo",
      sql`${tabela.motivo} in ('pausa', 'folga', 'ferias', 'trava')`,
    ),
    check("indisponibilidades_faixa", sql`${tabela.inicio} < ${tabela.fim}`),
  ],
);

export const servicos = pgTable("servicos", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  duracaoMinutos: integer("duracao_minutos").notNull(),
  precoCentavos: integer("preco_centavos").notNull(),
  ativo: boolean("ativo").notNull().default(true),
});

export const clientes = pgTable(
  "clientes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nome: text("nome").notNull(),
    telefone: text("telefone").notNull(),
    email: text("email"),
    observacao: text("observacao"),
    clerkUserId: text("clerk_user_id"),
  },
  (tabela) => [
    uniqueIndex("clientes_telefone").on(tabela.telefone),
    uniqueIndex("clientes_email").on(tabela.email),
    uniqueIndex("clientes_clerk").on(tabela.clerkUserId),
  ],
);

export const agendamentos = pgTable(
  "agendamentos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    barbeiroId: uuid("barbeiro_id")
      .notNull()
      .references(() => barbeiros.id),
    clienteId: uuid("cliente_id")
      .notNull()
      .references(() => clientes.id),
    inicio: timestamp("inicio", { withTimezone: true }).notNull(),
    fim: timestamp("fim", { withTimezone: true }).notNull(),
    estado: text("estado").notNull(),
    presencaAvisadaEm: timestamp("presenca_avisada_em", { withTimezone: true }),
    origem: text("origem").notNull(),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [
    check(
      "agendamentos_estado",
      sql`${tabela.estado} in ('confirmado', 'concluido', 'cancelado_pelo_cliente', 'cancelado_pela_casa', 'falta')`,
    ),
    check("agendamentos_origem", sql`${tabela.origem} in ('site', 'equipe')`),
    check("agendamentos_faixa", sql`${tabela.inicio} < ${tabela.fim}`),
  ],
);

export const itensAgendamento = pgTable("itens_agendamento", {
  id: uuid("id").primaryKey().defaultRandom(),
  agendamentoId: uuid("agendamento_id")
    .notNull()
    .references(() => agendamentos.id),
  servicoId: uuid("servico_id").references(() => servicos.id),
  nome: text("nome").notNull(),
  duracaoMinutos: integer("duracao_minutos").notNull(),
  precoCentavos: integer("preco_centavos").notNull(),
});
