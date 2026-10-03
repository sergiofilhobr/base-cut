CREATE TABLE IF NOT EXISTS canal_whatsapp (
  id text PRIMARY KEY,
  ativo boolean NOT NULL
);

INSERT INTO canal_whatsapp (id, ativo)
VALUES ('casa', true)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS mensagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id uuid NOT NULL REFERENCES agendamentos (id),
  tipo text NOT NULL CHECK (
    tipo IN ('confirmacao', 'lembrete_24h', 'lembrete_2h', 'aviso_bruno')
  ),
  enviado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agendamento_id, tipo)
);
