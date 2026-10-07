# Base Cut Barbearia

O site fica em `frontend/` (Next.js 16). A agenda fica em `backend/` (API com Postgres). No local, os dois sobem com Docker: a API usa a imagem do `backend/Dockerfile`.

```bash
cp backend/.env.example .env
docker compose up --build
```

A API responde em `http://localhost:4000/api/health`. O site, se for rodar junto, continua em `http://localhost:3000` com `npm run dev:frontend`. O Postgres do projeto escuta na porta 5434.

Sem `CLERK_SECRET_KEY`, o container aceita `Authorization: Bearer local:equipe:admin`. Para enviar WhatsApp, preencha `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN` e `ZAPI_CLIENT_TOKEN` no `.env` e suba de novo. A resposta do cliente no WhatsApp não chega nesta máquina: a Z-API chama `POST /api/whatsapp/entrada` num endereço público.

## Entrada, cadastro e painel (`/app`)

Quem entra em `/app` é identificado por `GET /api/eu`: equipe (member da organization no Clerk) vê o painel — Hoje, Agenda, Expediente, Casa; cliente vê a própria agenda — Horários, Marcar, Ficha. Cliente sem ficha completa o cadastro na primeira entrada.

### Com o Clerk (instância de desenvolvimento)

1. No [dashboard do Clerk](https://dashboard.clerk.com), crie a aplicação (ou use a existente) e fique na instância **Development**.
2. Em *User & authentication*, deixe **Email address** obrigatório com **Email verification code**. Telefone e nome não precisam estar no Clerk: a ficha guarda.
3. Em *Organizations*, ative organizations e crie a **Base Cut**. Copie o `org_...` para `CLERK_ORG_ID`.
4. Em *Organizations → Roles*, além de `org:admin`, crie `org:barbeiro` e `org:recepcao`. Convide o Bruno como `org:admin`.
5. Em *API keys*, copie a **Publishable key** (`pk_test_...`) para `frontend/.env.local` e a **Secret key** (`sk_test_...`) para `backend/.env`:

```bash
# frontend/.env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
API_URL=http://localhost:4000

# backend/.env
CLERK_SECRET_KEY=sk_test_...
CLERK_ORG_ID=org_...
```

Com a chave presente, o modo local abaixo desliga sozinho. O cliente não é member da organization: ele só autentica (ADR 0007).

### Sem o Clerk (modo local)

Para desenvolver sem chave, `AUTH_LOCAL=1` no `backend/.env` e `NEXT_PUBLIC_AUTH_LOCAL=1` no `frontend/.env.local`. A tela de entrada vira um seletor de papel (equipe admin, barbeiro, recepção, ou cliente por e-mail) e o token é o papel. Nunca liga em produção nem com `CLERK_SECRET_KEY` presente.

Site e app da **Base Cut Barbearia**, em Itajaí/SC. Next.js 16, React 19, Tailwind CSS v4 e daisyUI. A marcação é pelo próprio site (`/agendar`); o painel da casa e a agenda do cliente moram em `/app`.

---

## 🗂 Estrutura do Projeto

Os caminhos abaixo são relativos a `frontend/`.

```
frontend/
├── app/
│   ├── page.tsx                    # Rota /        — Hero
│   ├── servicos/page.tsx           # Rota /servicos — serviços + tabela de preços
│   ├── run-club/page.tsx           # Rota /run-club
│   ├── galeria/page.tsx            # Rota /galeria — O Barbeiro, Ambiente, Atendimentos, Run
│   ├── contato/page.tsx            # Rota /contato — mapa + avaliações
│   ├── layout.tsx                  # Root layout — fontes, Navbar e Footer compartilhados
│   ├── globals.css                 # Tokens do sistema (Tailwind v4)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── navbar.tsx          # Navegação entre rotas + troca de tema
│   │   │   └── footer.tsx          # Rodapé com contato e redes
│   │   ├── sections/
│   │   │   ├── hero.tsx            # Chamada principal com CTA (/agendar)
│   │   │   ├── services.tsx        # Serviços oferecidos
│   │   │   ├── run-club.tsx        # Base Run — deck de 5 capítulos em carrossel
│   │   │   ├── gallery.tsx         # Galeria — slots de foto por capítulo
│   │   │   ├── location.tsx        # Onde é a base — endereço + mapa do Google
│   │   │   └── google-review.tsx   # Avaliações do Google
│   │   ├── ui/
│   │   │   ├── barber-pole.tsx     # Poste de barbearia animado (anime.js)
│   │   │   ├── carousel.tsx        # Carrossel acessível (base: reactbits.dev)
│   │   │   ├── animated-section.tsx  # Wrapper com animação de entrada
│   │   │   └── theme-toggle.tsx      # Alternância dark / light
│   │   └── providers.tsx           # ThemeProvider (next-themes)
│   └── lib/
│       ├── constants.ts            # Rotas da navbar, URLs externas, serviços
│       ├── services.json           # Tabela de preços
│       └── motion.ts               # Variantes de animação compartilhadas
├── public/
│   ├── favicon.svg                 # Navalha
│   └── assets/images/              # Logo e fotos dos modelos
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
| [Framer Motion](https://www.framer.com/motion) | ^12 | Animações, transições e o carrossel |
| [anime.js](https://animejs.com) | ^4.5 | Rotação do barber pole |
| [next-themes](https://github.com/pacocoursey/next-themes) | ^0.4 | Dark / Light mode |
| [lucide-react](https://lucide.dev) | ^1.7 | Biblioteca de ícones |

---

## 🚀 Rodando Localmente

### Pré-requisitos

| | Versão | Por quê |
|---|---|---|
| Node.js | **>= 20.9.0** | Exigência do Next 16 (`engines` do pacote). Node 18 falha na hora do `next dev` |
| npm | >= 10 | Acompanha o Node 20+ |
| git | qualquer | Para clonar |

---

### Passo 1 — Confira a versão do Node

```bash
node -v
```

Se aparecer algo abaixo de `v20.9.0`, **pare aqui** e resolva antes de instalar. O Next 16 não sobe em Node 18 — o erro é literal:

```
You are using Node.js 18.19.1. For Next.js, Node.js version ">=20.9.0" is required.
```

Com [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm install 22
nvm use 22
```

> ⚠️ **Importante:** rode `nvm use` **antes** do `npm install`. Instalar dependências com o Node errado corrompe os binários nativos do Tailwind (veja *Solução de problemas*).

---

### Passo 2 — Clone o repositório

```bash
git clone git@github.com:sergiofilhobr/base-cut.git
cd base-cut
```

---

### Passo 3 — Instale as dependências

```bash
npm install
```

---

### Passo 4 — Suba o servidor de desenvolvimento

```bash
npm run dev
```

Acesse **[http://localhost:3000](http://localhost:3000)**.

---

### Passo 5 — Verifique se subiu certo

O site tem cinco rotas. Todas devem responder `200`:

```bash
for p in / /servicos /run-club /galeria /contato; do echo "$p -> $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000$p)"; done
```

E a checagem de tipos deve passar limpa:

```bash
npx tsc --noEmit
```

---

## 🔧 Solução de problemas

### `Cannot find native binding` no `@tailwindcss/oxide`

```
Error: Cannot find native binding.
Cannot find module '@tailwindcss/oxide-linux-x64-gnu'
```

O Tailwind v4 usa um binário nativo escolhido por plataforma **no momento do `npm install`**. Se as dependências foram instaladas com uma versão de Node diferente da que está rodando o servidor, esse binário não é baixado.

```bash
nvm use 22
rm -rf node_modules .next
npm install
npm run dev
```

Apagar o `.next` importa: o Turbopack guarda o erro em cache e continua mostrando a falha mesmo depois de o pacote ser corrigido.

### A porta 3000 já está em uso

```bash
npm run dev -- -p 3001
```

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com hot-reload |
| `npm run build` | Build de produção |
| `npm run start` | Inicia o servidor em modo produção |
| `npm run lint` | Verifica erros de lint com ESLint |

---

## 🎨 Rotas

| Rota | Página | Conteúdo |
|---|---|---|
| `/` | `app/page.tsx` | Hero com CTA de agendamento (`/agendar`) |
| `/agendar` | `app/agendar/page.tsx` | Marcação pública: serviço, horário, dados |
| `/app` | `app/app/` | Entrada, cadastro, painel da equipe e agenda do cliente |
| `/servicos` | `app/servicos/page.tsx` | Serviços + tabela de preços (`lib/services.json`) |
| `/run-club` | `app/run-club/page.tsx` | Base Run — 5 capítulos em carrossel |
| `/galeria` | `app/galeria/page.tsx` | O Barbeiro, Ambiente, Atendimentos, Run — slots de foto |
| `/contato` | `app/contato/page.tsx` | Onde é a base (mapa) + avaliações do Google |

Navbar e Footer vivem no `layout.tsx` e são compartilhados por todas as rotas. Cada página define sua própria `metadata` para SEO.

---

## 🏗 Arquitetura

```
layout.tsx (Server Component)
├── <Navbar />          → Client (usePathname, toggle de tema)
├── <main>{children}</main>
│    └── página da rota → Server Component
└── <Footer />          → Server Component
```

O padrão é manter as páginas como **Server Components** e isolar a interatividade em **Client Components** pontuais. `run-club.tsx`, por exemplo, é um Server Component que só marca `'use client'` no carrossel que envolve os capítulos.

---

## 🎨 Design system

A paleta nasceu no deck do Base Run: neutros quentes, sem acento cromático. São cinco tokens semânticos em `globals.css` que **invertem entre claro e escuro** — por isso nenhum componente usa variante `dark:` para cor.

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--paper` | `#f2efe6` | `#1a1917` | Fundo da página |
| `--surface` | `#ece7d9` | `#232220` | Superfície elevada (cards) |
| `--ink` | `#1a1917` | `#f2efe6` | Texto principal |
| `--muted` | `#5f5d58` | `#8f8d85` | Texto de apoio |
| `--rule` | `#d8d3c6` | `#34332f` | Bordas e réguas |

Use pelo nome (`bg-paper`, `text-ink`, `border-rule`) — nunca hex inline.

**Tipografia:** Archivo (display, caixa alta) · Inter (corpo) · JetBrains Mono (eyebrows e rótulos).

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
**Agendamentos:** pelo site, em `/agendar`  
**Base Run Club:** Comunidade de corrida — entre em contato via WhatsApp
