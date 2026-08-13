import type { ReactNode } from 'react'
import { Carousel } from '@/app/components/ui/carousel'

/**
 * Link do grupo de WhatsApp do Base Run Club.
 * Substituir pelo link real antes de publicar.
 */
const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/Drn8xiZJRrM5LLQKLo85ZC'

const PACE = [
  { label: 'Distância', value: '3 – 5 km' },
  { label: 'Ritmo', value: 'Leve, sem pressão' },
  { label: 'Encontro', value: 'Domingo, na Base' },
]

const STEPS = [
  'Apareça domingo na Base Cut',
  'Entre no grupo do WhatsApp',
  'Convide um amigo',
]

function Chapter({
  label,
  children,
  className = '',
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      /* w-full + justify-center: o slide é esticado até a altura do mais alto,
         então centralizamos o conteúdo para a folga se dividir em cima e embaixo
         em vez de despencar tudo abaixo do texto. */
      className={`w-full flex flex-col justify-center px-6 sm:px-10 py-10 sm:py-12 ${className}`}
    >
      <div className="max-w-4xl w-full mx-auto">
        {/* Eyebrow em mono; o título vem embaixo, na mesma coluna. */}
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--ink)] mb-8 sm:mb-10">
          {label}
        </p>
        {children}
      </div>
    </section>
  )
}

/** Título de capítulo: grotesk pesado, caixa alta, entrelinha travada. */
function Display({ children }: { children: ReactNode }) {
  return (
    <h2
      className="
        font-display font-black uppercase
        text-[2.75rem] sm:text-6xl md:text-7xl
        leading-[0.88] tracking-[-0.02em]
        text-[var(--ink)]
      "
      style={{ overflowWrap: 'anywhere' }}
    >
      {children}
    </h2>
  )
}

/**
 * Base Run — deck de 5 capítulos.
 * Server Component: sem motion, sem fade-on-scroll. O conteúdo simplesmente está lá.
 */
export function RunClub() {
  return (
    <div
      id="run-club"
      className="bg-[var(--paper)] text-[var(--ink)]"
    >
      <Carousel label="Base Run — capítulos">
      {/* 01 — Abertura */}
      <Chapter label="Base Run">
        <Display>
          Corrida,
          <br />
          <span className="text-[var(--muted)]">resenha</span>
          <br />e constância.
        </Display>
        <hr className="my-10 border-0 h-px bg-[var(--muted)]/40" />
        <p className="max-w-xl text-base sm:text-lg leading-relaxed text-[var(--ink)]/80">
          Muito mais que um corte — um jeito de ocupar o domingo. O ponto de
          encontro é a nossa base.
        </p>
      </Chapter>

      {/* 02 — A proposta */}
      <Chapter label="A Proposta">
        <Display>
          Não é sobre{' '}
          <span className="text-[var(--muted)]">performance.</span> É
          sobre a experiência.
        </Display>
        <hr className="my-10 border-0 h-px bg-[var(--muted)]/40" />
        <p className="max-w-xl text-base sm:text-lg leading-relaxed text-[var(--ink)]/80">
          A ideia é viver a experiência, sair da rotina, conhecer novas pessoas e
          criar constância juntos. Não é sobre pace ou competição — cada um no
          seu ritmo.
        </p>
      </Chapter>

      {/* 03 — Cada um no seu ritmo */}
      <Chapter label="Cada um no seu ritmo">
        <Display>Cada um no seu ritmo</Display>

        {/* Slot de imagem — aguardando foto real do grupo */}
        <figure className="mt-10">
          <div
            className="
              aspect-[4/3] sm:aspect-[16/9] w-full max-h-[200px]
              border border-dashed border-[var(--muted)]/50
              flex items-center justify-center
            "
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--muted)]">
              Foto do grupo — a inserir
            </span>
          </div>
          <figcaption className="sr-only">
            Espaço reservado para a fotografia do Base Run.
          </figcaption>
        </figure>

        <dl className="mt-10 divide-y divide-[var(--muted)]/30 border-y border-[var(--muted)]/30">
          {PACE.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-baseline justify-between gap-6 py-4"
            >
              <dt className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--muted)]">
                {label}
              </dt>
              <dd className="text-base sm:text-lg text-[var(--ink)] text-right">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </Chapter>

      {/* 04 — O benefício */}
      <Chapter label="Quem corre, corta">
        <Display>
          Correu com a gente?{' '}
          <span className="text-[var(--muted)]">10% off</span> no
          corte.
        </Display>
        <hr className="my-10 border-0 h-px bg-[var(--muted)]/40" />
        <p className="max-w-xl text-base sm:text-lg leading-relaxed text-[var(--ink)]/80">
          Vale para todos os cortes, em qualquer dia da semana. Basta ter estado
          na corrida de domingo.
        </p>
      </Chapter>

      {/* 05 — Entrar */}
      <Chapter label="Vamos construir juntos">
        <Display>
          Quem participar
          <br />
          já faz parte
        </Display>

        <ol className="mt-10 space-y-4">
          {STEPS.map((step, i) => (
            <li key={step} className="flex items-baseline gap-5">
              <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--muted)] shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-base sm:text-lg text-[var(--ink)]">
                {step}
              </span>
            </li>
          ))}
        </ol>

        <a
          id="run-club-whatsapp-cta"
          href={WHATSAPP_GROUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="
            mt-10 inline-flex items-center gap-3
            px-8 py-4
            font-mono text-xs uppercase tracking-[0.2em] whitespace-nowrap
            bg-[var(--ink)] text-[var(--paper)]
            hover:opacity-90
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
            focus-visible:outline-[var(--ink)]
            transition-opacity duration-200
          "
        >
          Entrar no grupo
        </a>
      </Chapter>
      </Carousel>
    </div>
  )
}
