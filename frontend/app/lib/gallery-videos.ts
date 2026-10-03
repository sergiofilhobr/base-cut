/**
 * Reels da casa — vídeos verticais reais, convertidos de .MOV para .mp4 web
 * (H.264, sem áudio, altura 720px). Cada entrada tem o próprio poster, usado
 * tanto como capa antes do play quanto como estado estático em
 * `prefers-reduced-motion`.
 *
 * Compartilhados apenas pela faixa de vídeo em loop da Galeria
 * (VideoAutoSlider) — decorativa, `aria-hidden`.
 */
export const GALLERY_VIDEOS = [
  {
    src: '/assets/videos/reel-01.mp4',
    poster: '/assets/videos/reel-01.jpg',
  },
  {
    src: '/assets/videos/reel-02.mp4',
    poster: '/assets/videos/reel-02.jpg',
  },
  {
    src: '/assets/videos/reel-03.mp4',
    poster: '/assets/videos/reel-03.jpg',
  },
  {
    src: '/assets/videos/reel-04.mp4',
    poster: '/assets/videos/reel-04.jpg',
  },
  {
    src: '/assets/videos/reel-05.mp4',
    poster: '/assets/videos/reel-05.jpg',
  },
  {
    src: '/assets/videos/reel-06.mp4',
    poster: '/assets/videos/reel-06.jpg',
  },
  {
    src: '/assets/videos/reel-07.mp4',
    poster: '/assets/videos/reel-07.jpg',
  },
  {
    src: '/assets/videos/reel-08.mp4',
    poster: '/assets/videos/reel-08.jpg',
  },
  {
    src: '/assets/videos/reel-09.mp4',
    poster: '/assets/videos/reel-09.jpg',
  },
  {
    src: '/assets/videos/reel-10.mp4',
    poster: '/assets/videos/reel-10.jpg',
  },
] as const satisfies ReadonlyArray<{
  src: string
  poster: string
}>

/**
 * Reels do Base Run — os vídeos reais das corridas de domingo.
 * Entram no mural da Galeria com o filtro "Run" (e aparecem em "Todos"),
 * diferente dos reels da casa acima, que só alimentam a faixa decorativa.
 */
export const RUN_CLUB_VIDEOS = [
  {
    src: '/assets/videos/base-run-01.mp4',
    poster: '/assets/videos/base-run-01.jpg',
    category: 'run',
  },
  {
    src: '/assets/videos/base-run-02.mp4',
    poster: '/assets/videos/base-run-02.jpg',
    category: 'run',
  },
  {
    src: '/assets/videos/base-run-03.mp4',
    poster: '/assets/videos/base-run-03.jpg',
    category: 'run',
  },
  {
    src: '/assets/videos/base-run-04.mp4',
    poster: '/assets/videos/base-run-04.jpg',
    category: 'run',
  },
  {
    src: '/assets/videos/base-run-05.mp4',
    poster: '/assets/videos/base-run-05.jpg',
    category: 'run',
  },
  {
    src: '/assets/videos/base-run-06.mp4',
    poster: '/assets/videos/base-run-06.jpg',
    category: 'run',
  },
] as const satisfies ReadonlyArray<{
  src: string
  poster: string
  category: 'run'
}>

/**
 * Vídeos de atendimento — o barbeiro trabalhando na cadeira.
 * Entram no mural da Galeria com o filtro "Atendimentos" (e em "Todos").
 */
export const ATENDIMENTO_VIDEOS = [
  {
    src: '/assets/videos/atendimento-01.mp4',
    poster: '/assets/videos/atendimento-01.jpg',
    category: 'atendimentos',
  },
  {
    src: '/assets/videos/atendimento-02.mp4',
    poster: '/assets/videos/atendimento-02.jpg',
    category: 'atendimentos',
  },
  {
    src: '/assets/videos/atendimento-03.mp4',
    poster: '/assets/videos/atendimento-03.jpg',
    category: 'atendimentos',
  },
  {
    src: '/assets/videos/atendimento-04.mp4',
    poster: '/assets/videos/atendimento-04.jpg',
    category: 'atendimentos',
  },
  {
    src: '/assets/videos/atendimento-05.mp4',
    poster: '/assets/videos/atendimento-05.jpg',
    category: 'atendimentos',
  },
  {
    src: '/assets/videos/atendimento-06.mp4',
    poster: '/assets/videos/atendimento-06.jpg',
    category: 'atendimentos',
  },
  {
    src: '/assets/videos/atendimento-07.mp4',
    poster: '/assets/videos/atendimento-07.jpg',
    category: 'atendimentos',
  },
] as const satisfies ReadonlyArray<{
  src: string
  poster: string
  category: 'atendimentos'
}>
