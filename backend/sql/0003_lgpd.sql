ALTER TABLE agendamentos
  ADD COLUMN IF NOT EXISTS consentimento_em timestamptz;

CREATE TABLE IF NOT EXISTS auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id uuid REFERENCES agendamentos (id),
  cliente_id uuid REFERENCES clientes (id),
  acao text NOT NULL,
  ator text NOT NULL,
  em timestamptz NOT NULL DEFAULT now()
);
