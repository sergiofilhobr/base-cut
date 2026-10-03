CREATE TABLE IF NOT EXISTS produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  preco_centavos integer NOT NULL,
  estoque integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  CHECK (estoque >= 0)
);

CREATE TABLE IF NOT EXISTS atendimentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id uuid REFERENCES agendamentos (id),
  cliente_id uuid NOT NULL REFERENCES clientes (id),
  desconto_centavos integer NOT NULL DEFAULT 0,
  gorjeta_centavos integer NOT NULL DEFAULT 0,
  total_centavos integer NOT NULL,
  fechado_em timestamptz NOT NULL DEFAULT now(),
  CHECK (desconto_centavos >= 0),
  CHECK (gorjeta_centavos >= 0),
  CHECK (total_centavos >= 0)
);

CREATE TABLE IF NOT EXISTS itens_atendimento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  atendimento_id uuid NOT NULL REFERENCES atendimentos (id),
  tipo text NOT NULL CHECK (tipo IN ('servico', 'produto')),
  referencia_id uuid,
  nome text NOT NULL,
  quantidade integer NOT NULL CHECK (quantidade > 0),
  preco_centavos integer NOT NULL
);

CREATE TABLE IF NOT EXISTS pagamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  atendimento_id uuid REFERENCES atendimentos (id),
  agendamento_id uuid REFERENCES agendamentos (id),
  cliente_id uuid NOT NULL REFERENCES clientes (id),
  meio text NOT NULL CHECK (meio IN ('pix', 'cartao', 'dinheiro', 'vale')),
  valor_centavos integer NOT NULL CHECK (valor_centavos > 0),
  situacao text NOT NULL CHECK (situacao IN ('pendente', 'pago')),
  origem text NOT NULL CHECK (origem IN ('sinal', 'cadeira')),
  provedor_id text,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  cliente_id uuid REFERENCES clientes (id),
  saldo_centavos integer NOT NULL CHECK (saldo_centavos >= 0)
);

CREATE TABLE IF NOT EXISTS planos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES clientes (id),
  nome text NOT NULL,
  valor_centavos integer NOT NULL CHECK (valor_centavos > 0),
  ativo boolean NOT NULL DEFAULT true
);
