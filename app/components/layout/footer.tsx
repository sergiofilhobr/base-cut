import Link from 'next/link'
import { MapPin, AtSign } from 'lucide-react'
import { BOOKSY_URL } from '@/app/lib/constants'

/**
 * Footer — Server Component puro.
 * Sem hooks ou interatividade: apenas HTML estático com links e endereço.
 */
export function Footer() {
  return (
    <footer
      id="contato"
      className="
        py-20 px-6
        bg-surface
        border-t border-rule
      "
    >
      <div className="max-w-5xl mx-auto">
        {/* Top: logo + CTA */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-10 mb-16">
          <div className="flex flex-col items-center sm:items-start">
            <div className="flex items-end gap-0 mb-3">
              <span className="text-2xl font-black tracking-tight text-ink">
                BASE
              </span>
              <span className="text-2xl font-light tracking-widest text-muted ml-[2px]">
                CUT
              </span>
            </div>
            <p className="text-xs text-muted tracking-wide">
              Barbearia de Alto Padrão
            </p>
          </div>

          <Link
            id="footer-cta"
            href={BOOKSY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-2
              px-6 py-3 rounded-full
              text-sm font-bold tracking-wide uppercase
              bg-ink text-paper
              hover:opacity-90
              transition-all duration-300
            "
          >
            Garantir Meu Horário
          </Link>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-10 border-y border-rule">
          {/* Address */}
          <div id="footer-address" className="flex items-start gap-3">
            <MapPin size={18} className="text-muted mt-0.5 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs uppercase tracking-widest text-muted mb-1">
                Localização
              </p>
              <p className="text-sm text-muted leading-relaxed">
                R. Juvenal García, 64
                <br />
                Centro, Itajaí – SC
              </p>
            </div>
          </div>

          {/* Social */}
          <div id="footer-social" className="flex items-start gap-3">
            <AtSign size={18} className="text-muted mt-0.5 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs uppercase tracking-widest text-muted mb-1">
                Instagram
              </p>
              <div className="flex flex-col gap-1">
                <a
                  id="ig-brunomz"
                  href="https://instagram.com/brunomzbarber"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted hover:text-ink dark:hover:text-ink transition-colors duration-200"
                >
                  @brunomzbarber
                </a>
                <a
                  id="ig-basecut"
                  href="https://instagram.com/basecut_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted hover:text-ink dark:hover:text-ink transition-colors duration-200"
                >
                  @basecut_
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright + dev signature */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Base Cut Barbearia. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted">
            Feito com precisão por{' '}
            <a
              id="dev-signature"
              href="https://instagram.com/sergiofilhobr"
              target="_blank"
              rel="noopener noreferrer"
              className="
                text-muted
                hover:text-ink
                transition-colors duration-200
              "
            >
              @sergiofilhobr
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
