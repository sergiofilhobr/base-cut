import type { Sql } from "postgres";

export type RepositorioRelacao = {
  entrarEspera(dados: { clienteId: string; servicoIds: string; desejadoEm: Date }): Promise<{ id: string }>;
  criarRecorrencia(dados: { clienteId: string; servicoIds: string; diaSemana: number; hora: string }): Promise<{ id: string }>;
  criarAvaliacao(dados: { atendimentoId: string; clienteId: string; nota: number; texto: string }): Promise<{ id: string }>;
  publicarAvaliacao(id: string): Promise<void>;
  definirOptIn(clienteId: string, optIn: boolean): Promise<void>;
  optIn(clienteId: string): Promise<boolean>;
  somarPontos(clienteId: string, pontos: number): Promise<void>;
  criarCupom(dados: { codigo: string; descontoCentavos: number }): Promise<{ id: string }>;
  cupom(codigo: string): Promise<{ descontoCentavos: number } | null>;
  criarHorarioDesconto(dados: { diaSemana: number; inicio: string; fim: string; descontoCentavos: number }): Promise<{ id: string }>;
  criarCampanha(dados: { nome: string; texto: string }): Promise<{ id: string }>;
  audiencia(): Promise<Array<{ id: string; telefone: string }>>;
  linhasDoPeriodo(de: Date, ate: Date): Promise<Array<{ estado: string; totalCentavos: number; clienteNovo: boolean }>>;
};

export function criarRepositorioRelacao(sql: Sql): RepositorioRelacao {
  return {
    async entrarEspera(dados) {
      const [linha] = await sql<{ id: string }[]>`
        insert into lista_espera (cliente_id, servico_ids, desejado_em)
        values (${dados.clienteId}, ${dados.servicoIds}, ${dados.desejadoEm})
        returning id
      `;
      return linha;
    },
    async criarRecorrencia(dados) {
      const [linha] = await sql<{ id: string }[]>`
        insert into recorrencias (cliente_id, servico_ids, dia_semana, hora)
        values (${dados.clienteId}, ${dados.servicoIds}, ${dados.diaSemana}, ${dados.hora})
        returning id
      `;
      return linha;
    },
    async criarAvaliacao(dados) {
      const [linha] = await sql<{ id: string }[]>`
        insert into avaliacoes (atendimento_id, cliente_id, nota, texto, publicada)
        values (${dados.atendimentoId}, ${dados.clienteId}, ${dados.nota}, ${dados.texto}, false)
        returning id
      `;
      return linha;
    },
    async publicarAvaliacao(id) {
      await sql`update avaliacoes set publicada = true where id = ${id}`;
    },
    async definirOptIn(clienteId, optIn) {
      await sql`update clientes set marketing_opt_in = ${optIn} where id = ${clienteId}`;
    },
    async optIn(clienteId) {
      const [linha] = await sql<{ marketing_opt_in: boolean }[]>`
        select marketing_opt_in from clientes where id = ${clienteId}
      `;
      return linha?.marketing_opt_in ?? false;
    },
    async somarPontos(clienteId, pontos) {
      await sql`update clientes set pontos = pontos + ${pontos} where id = ${clienteId}`;
    },
    async criarCupom(dados) {
      const [linha] = await sql<{ id: string }[]>`
        insert into cupons (codigo, desconto_centavos) values (${dados.codigo}, ${dados.descontoCentavos})
        returning id
      `;
      return linha;
    },
    async cupom(codigo) {
      const [linha] = await sql<{ descontoCentavos: number }[]>`
        select desconto_centavos as "descontoCentavos" from cupons
        where codigo = ${codigo} and ativo = true
      `;
      return linha ?? null;
    },
    async criarHorarioDesconto(dados) {
      const [linha] = await sql<{ id: string }[]>`
        insert into horarios_desconto (dia_semana, inicio, fim, desconto_centavos)
        values (${dados.diaSemana}, ${dados.inicio}, ${dados.fim}, ${dados.descontoCentavos})
        returning id
      `;
      return linha;
    },
    async criarCampanha(dados) {
      const [linha] = await sql<{ id: string }[]>`
        insert into campanhas (nome, texto) values (${dados.nome}, ${dados.texto}) returning id
      `;
      return linha;
    },
    async audiencia() {
      return sql<Array<{ id: string; telefone: string }>>`
        select id, telefone from clientes where marketing_opt_in = true
      `;
    },
    async linhasDoPeriodo(de, ate) {
      const linhas = await sql<Array<{ estado: string; totalCentavos: number; anteriores: number }>>`
        select a.estado,
          coalesce(at.total_centavos, 0) as "totalCentavos",
          (
            select count(*)::int from agendamentos anteriores
            where anteriores.cliente_id = a.cliente_id and anteriores.inicio < a.inicio
          ) as anteriores
        from agendamentos a
        left join atendimentos at on at.agendamento_id = a.id
        where a.inicio >= ${de} and a.inicio < ${ate}
      `;
      return linhas.map((linha) => ({
        estado: linha.estado,
        totalCentavos: linha.totalCentavos,
        clienteNovo: Number(linha.anteriores) === 0,
      }));
    },
  };
}
