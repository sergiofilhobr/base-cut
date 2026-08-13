/**
 * Avaliações reais do Google. Sem foto de perfil: o selo é "Base Member".
 * Para adicionar uma nova, basta mais uma entrada na lista.
 */
export const REVIEWS = [
  {
    quote: 'Atendimento de ótima qualidade, número 01 de Itajaí!!',
    author: 'Sergio Bittencourt',
    stars: 5,
  },
  {
    quote:
      'Ótimo atendimento e ambiente incrível, qualidade do profissional é de outro mundo, o melhor que tem em Itajaí e região!!!!!',
    author: 'Adrian Souza Vaz',
    stars: 5,
  },
  {
    quote: 'Melhor atendimento e trabalho que já tive experiência. Muito bom!',
    author: 'Gregório Cristino',
    stars: 5,
  },
  {
    quote: 'Um dos melhores de Itajaí! Ambiente totalmente diferenciado.',
    author: 'Everton Filho',
    stars: 5,
  },
  {
    quote: 'O mais brabo de todos, não tem como.',
    author: 'Bosco Silva',
    stars: 5,
  },
  {
    quote: 'Melhor barbeiro de Itajaí! Recomendo demais.',
    author: 'Ruan Carlos Tondorf',
    stars: 5,
  },
  {
    quote:
      'Um ambiente muito leve e descontraído, Bruno super atencioso com todo mundo, um profissional muito competente!',
    author: 'Fábio Palhano',
    stars: 5,
  },
  {
    quote:
      'Ótimo atendimento, Bruno Mizael corta demais, nunca errou um corte comigo. Vale muito a pena visitar.',
    author: 'Samuel Ribeiro de Oliveira',
    stars: 5,
  },
] as const

export const REVIEWS_COUNT = REVIEWS.length

export const AVERAGE_RATING =
  REVIEWS.reduce((sum, r) => sum + r.stars, 0) / REVIEWS_COUNT
