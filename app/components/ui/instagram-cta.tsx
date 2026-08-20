import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '@/app/lib/constants'

/**
 * InstagramCta — convite editorial para o Instagram.
 *
 * Sem feed embutido nem ícone de biblioteca: o link e o handle carregam a
 * conversa (a paleta não tem acento cromático e o design bane fileiras de
 * ícones sociais). Reusado na Galeria e em /contato.
 */
export function InstagramCta({ className = '' }: { className?: string }) {
  return (
    <div className={`border-t border-rule pt-10 ${className}`}>
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
        Bastidores e agenda no Instagram
      </p>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="
          group mt-3 inline-flex flex-wrap items-baseline gap-x-3 gap-y-1 text-ink
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
          focus-visible:outline-ink
        "
      >
        <span className="font-display font-black uppercase text-2xl sm:text-3xl tracking-[-0.02em]">
          Veja nosso Instagram
        </span>
        <span className="font-mono text-[11px] tracking-[0.2em] text-muted group-hover:text-ink transition-colors duration-200">
          {INSTAGRAM_HANDLE}
        </span>
      </a>
    </div>
  )
}
