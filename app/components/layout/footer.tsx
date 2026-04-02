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
        bg-white dark:bg-neutral-950
        border-t border-neutral-100 dark:border-neutral-900
      "
    >
      <div className="max-w-5xl mx-auto">
        {/* Top: logo + CTA */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-10 mb-16">
          <div className="flex flex-col items-center sm:items-start">
            <div className="flex items-end gap-0 mb-3">
              <span className="text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-50">
                BASE
              </span>
              <span className="text-2xl font-light tracking-widest text-neutral-400 ml-[2px]">
                CUT
              </span>
            </div>
            <p className="text-xs text-neutral-400 dark:text-neutral-600 tracking-wide">
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
              bg-neutral-900 text-neutral-50
              dark:bg-neutral-50 dark:text-neutral-900
              hover:opacity-90
              transition-all duration-300
            "
          >
            Garantir Meu Horário
          </Link>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-10 border-y border-neutral-100 dark:border-neutral-900">
          {/* Address */}
          <div id="footer-address" className="flex items-start gap-3">
            <MapPin size={18} className="text-[#c9a96e] mt-0.5 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-600 mb-1">
                Localização
              </p>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                R. Juvenal García, 64
                <br />
                Centro, Itajaí – SC
              </p>
            </div>
          </div>

          {/* Social */}
          <div id="footer-social" className="flex items-start gap-3">
            <AtSign size={18} className="text-[#c9a96e] mt-0.5 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-600 mb-1">
                Instagram
              </p>
              <div className="flex flex-col gap-1">
                <a
                  id="ig-brunomz"
                  href="https://instagram.com/brunomzbarber"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-neutral-700 dark:text-neutral-300 hover:text-[#c9a96e] dark:hover:text-[#c9a96e] transition-colors duration-200"
                >
                  @brunomzbarber
                </a>
                <a
                  id="ig-basecut"
                  href="https://instagram.com/basecut_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-neutral-700 dark:text-neutral-300 hover:text-[#c9a96e] dark:hover:text-[#c9a96e] transition-colors duration-200"
                >
                  @basecut_
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright + dev signature */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-400 dark:text-neutral-600">
            © {new Date().getFullYear()} Base Cut Barbearia. Todos os direitos reservados.
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-500">
            Feito com precisão por{' '}
            <a
              id="dev-signature"
              href="https://instagram.com/sergiofilhobr"
              target="_blank"
              rel="noopener noreferrer"
              className="
                text-neutral-500 dark:text-neutral-500
                hover:text-neutral-900 dark:hover:text-neutral-50
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
