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
 * Fotos reais da casa — o barbeiro trabalhando.
 * Compartilhadas entre o mural da Galeria e o lightbox.
 */
export const GALLERY_PHOTOS = [
  {
    src: '/assets/images/bruno-corte-1.jpeg',
    alt: 'Bruno atendendo um corte na Base Cut',
    width: 1200,
    height: 1600,
    category: 'barbeiro',
  },
  {
    src: '/assets/images/cortando-na-viagem.jpg',
    alt: 'Corte em atendimento externo na viagem',
    width: 1200,
    height: 1600,
    category: 'atendimentos',
  },
] as const satisfies ReadonlyArray<{
  src: string
  alt: string
  width: number
  height: number
  category: Exclude<GalleryCategory, 'todos'>
}>
