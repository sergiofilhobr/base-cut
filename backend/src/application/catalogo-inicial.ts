/** Terça a sábado. O Bruno troca isso no painel. */
export const EXPEDIENTE_INICIAL = [2, 3, 4, 5, 6].map((diaSemana) => ({
  diaSemana,
  inicio: "09:00",
  fim: diaSemana === 6 ? "17:00" : "19:00",
}));

export const CATALOGO_INICIAL = [
  { nome: "CORTE", duracaoMinutos: 45, precoCentavos: 5000 },
  { nome: "CABELO + SOBRANCELHA", duracaoMinutos: 45, precoCentavos: 6000 },
  { nome: "CORTE + BARBA", duracaoMinutos: 60, precoCentavos: 8000 },
  { nome: "CABELO + BARBA + SOBRANCELHA", duracaoMinutos: 60, precoCentavos: 8500 },
  { nome: "BARBA", duracaoMinutos: 45, precoCentavos: 4500 },
  { nome: "SOBRANCELHA", duracaoMinutos: 10, precoCentavos: 1000 },
  { nome: "HIDRATAÇÃO", duracaoMinutos: 20, precoCentavos: 2500 },
  { nome: "Depilação nasal / orelha", duracaoMinutos: 10, precoCentavos: 2000 },
];
