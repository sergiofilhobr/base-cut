-- O Booksy saiu. A agenda pública é a do site, sem chave de destino.
DELETE FROM configuracao WHERE chave = 'agendamento_publico';
