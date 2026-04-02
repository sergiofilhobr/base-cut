# Base Cut Barbearia — Landing Page

Site institucional da **Base Cut Barbearia**, localizada em Itajaí/SC. Desenvolvido com Next.js 16, React 19 e Tailwind CSS v4, com foco em performance, design premium e experiência de agendamento via [Booksy](https://booksy.com).

---

## 🗂 Estrutura do Projeto

```
base-cut/
├── app/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── navbar.tsx          # Barra de navegação responsiva com troca de tema
│   │   │   └── footer.tsx          # Rodapé com links e informações de contato
│   │   ├── sections/
│   │   │   ├── hero.tsx            # Seção principal com CTA para agendamento
│   │   │   ├── about.tsx           # Sobre a barbearia
│   │   │   ├── services.tsx        # Serviços oferecidos
│   │   │   ├── run-club.tsx        # Base Run Club — comunidade de corrida
│   │   │   └── google-review.tsx   # Avaliações do Google
│   │   ├── ui/
│   │   │   ├── animated-section.tsx  # Wrapper reutilizável com animação de entrada
│   │   │   └── theme-toggle.tsx      # Botão de alternância dark/light mode
│   │   └── providers.tsx           # ThemeProvider (next-themes)
│   ├── globals.css                 # Design tokens e estilos globais (Tailwind v4)
│   ├── layout.tsx                  # Root layout com metadata SEO e fonte Inter
│   └── page.tsx                    # Home — Server Component que orquestra as seções
├── public/
│   └── favicon.svg
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 🧱 Stack Tecnológica

| Tecnologia | Versão | Função |
|---|---|---|
| [Next.js](https://nextjs.org) | 16.2.2 | Framework principal (App Router) |
| [React](https://react.dev) | 19.2.4 | UI |
| [TypeScript](https://www.typescriptlang.org) | ^5 | Tipagem estática |
| [Tailwind CSS](https://tailwindcss.com) | ^4 | Estilização utilitária |
| [Framer Motion](https://www.framer.com/motion) | ^12 | Animações e transições |
| [next-themes](https://github.com/pacocoursey/next-themes) | ^0.4 | Dark / Light mode |
| [lucide-react](https://lucide.dev) | ^1.7 | Biblioteca de ícones |

---

## 🚀 Rodando Localmente

### Pré-requisitos

- Node.js >= 20
- npm >= 10

### Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd base-cut

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com hot-reload |
| `npm run build` | Build de produção |
| `npm run start` | Inicia o servidor em modo produção |
| `npm run lint` | Verifica erros de lint com ESLint |

---

## 🎨 Seções da Landing Page

| Seção | Componente | Descrição |
|---|---|---|
| Navbar | `layout/navbar.tsx` | Navegação fixa com scroll suave e toggle de tema |
| Hero | `sections/hero.tsx` | Chamada principal com botão de agendamento (Booksy) |
| Sobre | `sections/about.tsx` | História e diferenciais da barbearia |
| Serviços | `sections/services.tsx` | Grade de serviços oferecidos |
| Base Run Club | `sections/run-club.tsx` | Comunidade de corrida — captação via WhatsApp |
| Avaliações | `sections/google-review.tsx` | Depoimentos e nota no Google |
| Footer | `layout/footer.tsx` | Redes sociais, localização e contato |

---

## 🏗 Arquitetura

A página principal (`page.tsx`) é um **Server Component** que apenas orquestra as seções. Toda a interatividade (animações, formulários, toggles) fica isolada nos **Client Components** individuais, seguindo as boas práticas do Next.js App Router.

```
page.tsx (Server Component)
├── <Navbar />        → Client Component
├── <Hero />          → Client Component
├── <About />         → Client Component
├── <Services />      → Client Component
├── <RunClub />       → Client Component
├── <GoogleReview />  → Client Component
└── <Footer />        → Client Component
```

---

## 🌍 Deploy

O projeto está pronto para deploy na [Vercel](https://vercel.com). Basta conectar o repositório e o deploy acontece automaticamente a cada push na branch `main`.

```bash
# Build de produção (verificação local)
npm run build
npm run start
```

---

## 📍 Base Cut Barbearia

**Localização:** Itajaí, SC — Brasil  
**Agendamentos:** [Booksy](https://booksy.com)  
**Base Run Club:** Comunidade de corrida — entre em contato via WhatsApp
