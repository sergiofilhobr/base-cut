import assert from "node:assert/strict";
import test from "node:test";
import { horariosLivres, instanteLocal } from "./horarios-livres.ts";

test("oferece inícios de 15 em 15 que cabem na faixa", () => {
  const livres = horariosLivres({
    dia: "2026-10-05",
    duracaoMinutos: 45,
    faixas: [{ inicio: "09:00", fim: "11:00" }],
    ocupados: [],
    indisponibilidades: [],
    agora: new Date("2026-10-01T12:00:00-03:00"),
    origem: "site",
  });

  assert.deepEqual(
    livres.map((horario) => horario.toISOString()),
    [
      "2026-10-05T12:00:00.000Z",
      "2026-10-05T12:15:00.000Z",
      "2026-10-05T12:30:00.000Z",
      "2026-10-05T12:45:00.000Z",
      "2026-10-05T13:00:00.000Z",
      "2026-10-05T13:15:00.000Z",
    ],
  );
});

test("tira o horário que cruza um confirmado ou uma trava", () => {
  const livres = horariosLivres({
    dia: "2026-10-05",
    duracaoMinutos: 45,
    faixas: [{ inicio: "09:00", fim: "11:00" }],
    ocupados: [
      {
        inicio: instanteLocal("2026-10-05", "09:00"),
        fim: instanteLocal("2026-10-05", "09:45"),
      },
    ],
    indisponibilidades: [
      {
        inicio: instanteLocal("2026-10-05", "10:30"),
        fim: instanteLocal("2026-10-05", "11:00"),
      },
    ],
    agora: new Date("2026-10-01T12:00:00-03:00"),
    origem: "site",
  });

  assert.deepEqual(
    livres.map((horario) => horario.toISOString()),
    ["2026-10-05T12:45:00.000Z"],
  );
});

test("o site esconde horário com menos de 60 minutos", () => {
  const livres = horariosLivres({
    dia: "2026-10-05",
    duracaoMinutos: 45,
    faixas: [{ inicio: "09:00", fim: "12:00" }],
    ocupados: [],
    indisponibilidades: [],
    agora: new Date("2026-10-05T08:30:00-03:00"),
    origem: "site",
  });

  assert.equal(livres[0]?.toISOString(), "2026-10-05T12:30:00.000Z");
});
