ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS marketing_opt_in boolean NOT NULL DEFAULT false;

ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS pontos integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS lista_espera (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES clientes (id),
  servico_ids text NOT NULL,
  desejado_em timestamptz NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recorrencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES clientes (id),
  servico_ids text NOT NULL,
  dia_semana integer NOT NULL CHECK (dia_semana BETWEEN 1 AND 7),
  hora text NOT NULL,
  ativa boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  atendimento_id uuid NOT NULL REFERENCES atendimentos (id),
  cliente_id uuid NOT NULL REFERENCES clientes (id),
  nota integer NOT NULL CHECK (nota BETWEEN 1 AND 5),
  texto text NOT NULL,
  publicada boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS campanhas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  texto text NOT NULL,
  criada_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  desconto_centavos integer NOT NULL CHECK (desconto_centavos > 0),
  ativo boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS horarios_desconto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dia_semana integer NOT NULL CHECK (dia_semana BETWEEN 1 AND 7),
  inicio text NOT NULL,
  fim text NOT NULL,
  desconto_centavos integer NOT NULL CHECK (desconto_centavos > 0),
  CHECK (inicio < fim)
);
