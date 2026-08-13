/** Categorias de filtro da Galeria — nem todas têm foto ainda. */
export const GALLERY_CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'barbeiro', label: 'Barbeiro' },
  { id: 'atendimentos', label: 'Atendimentos' },
  { id: 'ambiente', label: 'Ambiente' },
  { id: 'run', label: 'Run' },
] as const

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number]['id']

/**
 * Fotos reais da casa — o barbeiro trabalhando, o ambiente ao redor.
 * Compartilhadas entre o mural da Galeria e a faixa de auto-slide.
 */
export const GALLERY_PHOTOS = [
  {
    src: '/assets/images/model-hype-cut-3.jpeg',
    alt: 'Ambiente da Base Cut — sofá de couro, letreiro neon e arte na parede',
    width: 1755,
    height: 2340,
    category: 'ambiente',
  },
  {
    src: '/assets/images/model-hype-cut-1.jpeg',
    alt: 'Corte finalizado — fade e alinhamento',
    width: 2160,
    height: 3840,
    category: 'atendimentos',
  },
  {
    src: '/assets/images/model-hype-cut-6.jpeg',
    alt: 'Acabamento em andamento na cadeira',
    width: 2160,
    height: 3840,
    category: 'atendimentos',
  },
  {
    src: '/assets/images/model-hype-cut-4.jpeg',
    alt: 'Corte finalizado, perfil',
    width: 2160,
    height: 3840,
    category: 'atendimentos',
  },
  {
    src: '/assets/images/model-hype-cut-5.jpeg',
    alt: 'Corte finalizado — textura e volume',
    width: 1440,
    height: 1795,
    category: 'atendimentos',
  },
  {
    src: '/assets/images/model-hype-cut-2.jpeg',
    alt: 'Corte finalizado, perfil com barba',
    width: 2160,
    height: 3840,
    category: 'atendimentos',
  },
] as const satisfies ReadonlyArray<{
  src: string
  alt: string
  width: number
  height: number
  category: Exclude<GalleryCategory, 'todos'>
}>
