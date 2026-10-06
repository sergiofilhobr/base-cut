import type { Sql } from "postgres";

export type RepositorioCasa = {
  criarBarbeiro(nome: string): Promise<{ id: string }>;
  ligarServicos(barbeiroId: string, servicoIds: string[]): Promise<void>;
  servicosDoBarbeiro(barbeiroId: string): Promise<string[]>;
  definirComissao(barbeiroId: string, percentual: number): Promise<void>;
  faturamento(de: Date, ate: Date): Promise<Array<{ barbeiroId: string; nome: string; percentual: number; faturadoCentavos: number }>>;
  criarEvento(dados: { nome: string; inicio: Date; vagas: number }): Promise<{ id: string }>;
  eventos(): Promise<Array<{ id: string; nome: string; inicio: Date; vagas: number }>>;
  vagasDoEvento(eventoId: string): Promise<{ vagas: number; inscritos: number } | null>;
  inscrever(eventoId: string, clienteId: string): Promise<{ id: string }>;
  marcarPresenca(eventoId: string, clienteId: string): Promise<void>;
  marcarRunClub(clienteId: string): Promise<void>;
  publicarFoto(dados: { src: string; alt: string; servicoId: string | null }): Promise<{ id: string }>;
  fotosPublicadas(): Promise<Array<{ id: string; src: string; alt: string; servicoId: string | null }>>;
  inscritos(eventoId: string): Promise<
    Array<{ clienteId: string; nome: string; telefone: string; presente: boolean; runClub: boolean }>
  >;
};

export function criarRepositorioCasa(sql: Sql): RepositorioCasa {
  return {
    async criarBarbeiro(nome) {
      const [linha] = await sql<{ id: string }[]>`
        insert into barbeiros (nome) values (${nome}) returning id
      `;
      return linha;
    },
    async ligarServicos(barbeiroId, servicoIds) {
      await sql.begin(async (tx) => {
        await tx`delete from barbeiro_servicos where barbeiro_id = ${barbeiroId}`;
        for (const servicoId of servicoIds) {
          await tx`
            insert into barbeiro_servicos (barbeiro_id, servico_id)
            values (${barbeiroId}, ${servicoId})
          `;
        }
      });
    },
    async servicosDoBarbeiro(barbeiroId) {
      const linhas = await sql<{ servicoId: string }[]>`
        select servico_id as "servicoId" from barbeiro_servicos where barbeiro_id = ${barbeiroId}
      `;
      return linhas.map((linha) => linha.servicoId);
    },
    async definirComissao(barbeiroId, percentual) {
      await sql`
        insert into comissoes (barbeiro_id, percentual) values (${barbeiroId}, ${percentual})
        on conflict (barbeiro_id) do update set percentual = excluded.percentual
      `;
    },
    async faturamento(de, ate) {
      return sql<Array<{ barbeiroId: string; nome: string; percentual: number; faturadoCentavos: number }>>`
        select b.id as "barbeiroId",
          b.nome,
          coalesce(c.percentual, 0)::int as percentual,
          coalesce(sum(a.total_centavos), 0)::int as "faturadoCentavos"
        from barbeiros b
        left join comissoes c on c.barbeiro_id = b.id
        left join agendamentos ag on ag.barbeiro_id = b.id
        left join atendimentos a
          on a.agendamento_id = ag.id
          and a.fechado_em >= ${de}
          and a.fechado_em < ${ate}
        where b.ativo = true
        group by b.id, b.nome, c.percentual
        order by b.nome
      `;
    },
    async eventos() {
      return sql<Array<{ id: string; nome: string; inicio: Date; vagas: number }>>`
        select id, nome, inicio, vagas::int as vagas from run_eventos order by inicio
      `;
    },
    async criarEvento(dados) {
      const [linha] = await sql<{ id: string }[]>`
        insert into run_eventos (nome, inicio, vagas)
        values (${dados.nome}, ${dados.inicio}, ${dados.vagas})
        returning id
      `;
      return linha;
    },
    async vagasDoEvento(eventoId) {
      const [linha] = await sql<{ vagas: number; inscritos: number }[]>`
        select e.vagas::int as vagas, count(i.id)::int as inscritos
        from run_eventos e
        left join run_inscricoes i on i.evento_id = e.id
        where e.id = ${eventoId}
        group by e.vagas
      `;
      return linha ?? null;
    },
    async inscrever(eventoId, clienteId) {
      const [linha] = await sql<{ id: string }[]>`
        insert into run_inscricoes (evento_id, cliente_id)
        values (${eventoId}, ${clienteId})
        returning id
      `;
      return linha;
    },
    async marcarPresenca(eventoId, clienteId) {
      await sql`
        update run_inscricoes set presente = true
        where evento_id = ${eventoId} and cliente_id = ${clienteId}
      `;
    },
    async marcarRunClub(clienteId) {
      await sql`update clientes set run_club = true where id = ${clienteId}`;
    },
    async publicarFoto(dados) {
      const [linha] = await sql<{ id: string }[]>`
        insert into galeria (src, alt, servico_id)
        values (${dados.src}, ${dados.alt}, ${dados.servicoId})
        returning id
      `;
      return linha;
    },
    async fotosPublicadas() {
      return sql<Array<{ id: string; src: string; alt: string; servicoId: string | null }>>`
        select id, src, alt, servico_id as "servicoId"
        from galeria
        where publicada = true
        order by id
      `;
    },
    async inscritos(eventoId) {
      return sql<Array<{ clienteId: string; nome: string; telefone: string; presente: boolean; runClub: boolean }>>`
        select i.cliente_id as "clienteId", c.nome, c.telefone, i.presente, c.run_club as "runClub"
        from run_inscricoes i
        join clientes c on c.id = i.cliente_id
        where i.evento_id = ${eventoId}
        order by c.nome
      `;
    },
  };
}
