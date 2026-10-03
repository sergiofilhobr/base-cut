CREATE TABLE IF NOT EXISTS configuracao (
  chave text PRIMARY KEY,
  valor text NOT NULL
);

INSERT INTO configuracao (chave, valor)
VALUES ('agendamento_publico', 'booksy')
ON CONFLICT (chave) DO NOTHING;
