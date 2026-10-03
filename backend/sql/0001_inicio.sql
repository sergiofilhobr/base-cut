CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS barbeiros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  ativo boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS expedientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbeiro_id uuid NOT NULL REFERENCES barbeiros (id),
  dia_semana integer NOT NULL CHECK (dia_semana BETWEEN 1 AND 7),
  inicio text NOT NULL,
  fim text NOT NULL,
  CHECK (inicio < fim)
);

CREATE TABLE IF NOT EXISTS indisponibilidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbeiro_id uuid NOT NULL REFERENCES barbeiros (id),
  inicio timestamptz NOT NULL,
  fim timestamptz NOT NULL,
  motivo text NOT NULL CHECK (motivo IN ('pausa', 'folga', 'ferias', 'trava')),
  CHECK (inicio < fim)
);

CREATE TABLE IF NOT EXISTS servicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  duracao_minutos integer NOT NULL,
  preco_centavos integer NOT NULL,
  ativo boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  telefone text NOT NULL UNIQUE,
  email text UNIQUE,
  observacao text,
  clerk_user_id text UNIQUE
);

CREATE TABLE IF NOT EXISTS agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbeiro_id uuid NOT NULL REFERENCES barbeiros (id),
  cliente_id uuid NOT NULL REFERENCES clientes (id),
  inicio timestamptz NOT NULL,
  fim timestamptz NOT NULL,
  estado text NOT NULL CHECK (
    estado IN (
      'confirmado',
      'concluido',
      'cancelado_pelo_cliente',
      'cancelado_pela_casa',
      'falta'
    )
  ),
  presenca_avisada_em timestamptz,
  origem text NOT NULL CHECK (origem IN ('site', 'equipe')),
  criado_em timestamptz NOT NULL DEFAULT now(),
  CHECK (inicio < fim)
);

CREATE TABLE IF NOT EXISTS itens_agendamento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id uuid NOT NULL REFERENCES agendamentos (id),
  servico_id uuid REFERENCES servicos (id),
  nome text NOT NULL,
  duracao_minutos integer NOT NULL,
  preco_centavos integer NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'agendamentos_sem_conflito'
  ) THEN
    ALTER TABLE agendamentos
      ADD CONSTRAINT agendamentos_sem_conflito
      EXCLUDE USING gist (
        barbeiro_id WITH =,
        tstzrange(inicio, fim, '[)') WITH &&
      )
      WHERE (estado = 'confirmado');
  END IF;
END $$;
