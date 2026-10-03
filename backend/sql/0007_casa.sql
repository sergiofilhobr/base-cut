ALTER TABLE barbeiros
  ADD COLUMN IF NOT EXISTS clerk_user_id text UNIQUE;

CREATE TABLE IF NOT EXISTS barbeiro_servicos (
  barbeiro_id uuid NOT NULL REFERENCES barbeiros (id),
  servico_id uuid NOT NULL REFERENCES servicos (id),
  PRIMARY KEY (barbeiro_id, servico_id)
);

CREATE TABLE IF NOT EXISTS comissoes (
  barbeiro_id uuid PRIMARY KEY REFERENCES barbeiros (id),
  percentual integer NOT NULL CHECK (percentual BETWEEN 0 AND 100)
);

CREATE TABLE IF NOT EXISTS run_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  inicio timestamptz NOT NULL,
  vagas integer NOT NULL CHECK (vagas > 0)
);

CREATE TABLE IF NOT EXISTS run_inscricoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id uuid NOT NULL REFERENCES run_eventos (id),
  cliente_id uuid NOT NULL REFERENCES clientes (id),
  presente boolean NOT NULL DEFAULT false,
  UNIQUE (evento_id, cliente_id)
);

ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS run_club boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS galeria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  src text NOT NULL,
  alt text NOT NULL,
  servico_id uuid REFERENCES servicos (id),
  publicada boolean NOT NULL DEFAULT true
);
