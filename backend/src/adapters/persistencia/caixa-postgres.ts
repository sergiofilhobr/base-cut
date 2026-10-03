import type { Sql } from "postgres";
import type { ItemDeConta } from "../../domain/caixa/total.ts";
import type { AtendimentoGravado, Produto, RepositorioCaixa } from "../../ports/caixa.ts";

export function criarRepositorioCaixa(sql: Sql): RepositorioCaixa {
  return {
    async produto(id) {
      const [linha] = await sql<Produto[]>`
        select id, nome, preco_centavos as "precoCentavos", estoque
        from produtos where id = ${id} and ativo = true
      `;
      return linha ?? null;
    },

    async criarProduto(dados) {
      const [linha] = await sql<Produto[]>`
        insert into produtos (nome, preco_centavos, estoque)
        values (${dados.nome}, ${dados.precoCentavos}, ${dados.estoque})
        returning id, nome, preco_centavos as "precoCentavos", estoque
      `;
      return linha;
    },

    async baixarEstoque(id, quantidade) {
      const linhas = await sql`
        update produtos set estoque = estoque - ${quantidade}
        where id = ${id} and estoque >= ${quantidade}
        returning id
      `;
      return linhas.length > 0;
    },

    async gravarAtendimento(dados) {
      return sql.begin(async (transacao) => {
        const [gravado] = await transacao<{ id: string }[]>`
          insert into atendimentos (
            agendamento_id, cliente_id, desconto_centavos, gorjeta_centavos, total_centavos
          ) values (
            ${dados.agendamentoId}, ${dados.clienteId}, ${dados.descontoCentavos},
            ${dados.gorjetaCentavos}, ${dados.totalCentavos}
          ) returning id
        `;
        if (dados.itens.length > 0) {
          for (const item of dados.itens) {
            await transacao`
              insert into itens_atendimento (
                atendimento_id, tipo, referencia_id, nome, quantidade, preco_centavos
              ) values (
                ${gravado.id}, ${item.tipo}, ${item.referenciaId ?? null}, ${item.nome},
                ${item.quantidade}, ${item.precoCentavos}
              )
            `;
          }
        }
        return montar(gravado.id, dados);
      });
    },

    async atendimento(id) {
      const [linha] = await sql<
        Array<{
          id: string;
          clienteId: string;
          totalCentavos: number;
          descontoCentavos: number;
          gorjetaCentavos: number;
        }>
      >`
        select id, cliente_id as "clienteId", total_centavos as "totalCentavos",
          desconto_centavos as "descontoCentavos", gorjeta_centavos as "gorjetaCentavos"
        from atendimentos where id = ${id}
      `;
      if (!linha) return null;
      const itens = await sql<ItemDeConta[]>`
        select tipo, nome, quantidade, preco_centavos as "precoCentavos", referencia_id as "referenciaId"
        from itens_atendimento where atendimento_id = ${id}
      `;
      return { ...linha, itens };
    },

    async gravarPagamento(dados) {
      const [linha] = await sql<{ id: string }[]>`
        insert into pagamentos (
          atendimento_id, agendamento_id, cliente_id, meio, valor_centavos, situacao, origem, provedor_id
        ) values (
          ${dados.atendimentoId}, ${dados.agendamentoId}, ${dados.clienteId}, ${dados.meio},
          ${dados.valorCentavos}, ${dados.situacao}, ${dados.origem}, ${dados.provedorId}
        ) returning id
      `;
      return linha;
    },

    async criarVale(dados) {
      const [linha] = await sql<{ id: string }[]>`
        insert into vales (codigo, cliente_id, saldo_centavos)
        values (${dados.codigo}, ${dados.clienteId}, ${dados.saldoCentavos})
        returning id
      `;
      return linha;
    },

    async valePorCodigo(codigo) {
      const [linha] = await sql<{ id: string; saldoCentavos: number }[]>`
        select id, saldo_centavos as "saldoCentavos" from vales where codigo = ${codigo}
      `;
      return linha ?? null;
    },

    async debitarVale(id, valorCentavos) {
      const linhas = await sql`
        update vales set saldo_centavos = saldo_centavos - ${valorCentavos}
        where id = ${id} and saldo_centavos >= ${valorCentavos}
        returning id
      `;
      return linhas.length > 0;
    },

    async criarPlano(dados) {
      const [linha] = await sql<{ id: string }[]>`
        insert into planos (cliente_id, nome, valor_centavos)
        values (${dados.clienteId}, ${dados.nome}, ${dados.valorCentavos})
        returning id
      `;
      return linha;
    },

    async listarProdutos() {
      return sql<Produto[]>`
        select id, nome, preco_centavos as "precoCentavos", estoque
        from produtos where ativo = true order by nome
      `;
    },

    async listarPlanos(clienteId) {
      if (clienteId) {
        return sql<Array<{ id: string; clienteId: string; nome: string; valorCentavos: number }>>`
          select id, cliente_id as "clienteId", nome, valor_centavos as "valorCentavos"
          from planos where ativo = true and cliente_id = ${clienteId}
          order by nome
        `;
      }
      return sql<Array<{ id: string; clienteId: string; nome: string; valorCentavos: number }>>`
        select id, cliente_id as "clienteId", nome, valor_centavos as "valorCentavos"
        from planos where ativo = true order by nome
      `;
    },

    async sinalDoAgendamento(agendamentoId) {
      const [linha] = await sql<
        Array<{ id: string; meio: string; valorCentavos: number; situacao: "pendente" | "pago" }>
      >`
        select id, meio, valor_centavos as "valorCentavos", situacao
        from pagamentos
        where agendamento_id = ${agendamentoId} and origem = 'sinal'
        order by criado_em desc
        limit 1
      `;
      return linha ?? null;
    },

    async caixaDoPeriodo(de, ate) {
      return sql<Array<{ meio: string; valorCentavos: number }>>`
        select meio, coalesce(sum(valor_centavos), 0)::int as "valorCentavos"
        from pagamentos
        where origem = 'cadeira' and situacao = 'pago'
          and criado_em >= ${de.toISOString()} and criado_em < ${ate.toISOString()}
        group by meio
        order by meio
      `;
    },
  };
}

function montar(
  id: string,
  dados: {
    clienteId: string;
    totalCentavos: number;
    descontoCentavos: number;
    gorjetaCentavos: number;
    itens: ItemDeConta[];
  },
): AtendimentoGravado {
  return {
    id,
    clienteId: dados.clienteId,
    totalCentavos: dados.totalCentavos,
    descontoCentavos: dados.descontoCentavos,
    gorjetaCentavos: dados.gorjetaCentavos,
    itens: dados.itens,
  };
}
