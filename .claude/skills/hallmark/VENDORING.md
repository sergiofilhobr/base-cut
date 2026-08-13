# Nota de vendorização

Esta é uma cópia da skill **hallmark** v1.1.0, trazida de
`hallmark/skills/hallmark/` para dentro deste projeto.

## O que mudou em relação ao original

O `SKILL.md` original referencia arquivos que vivem **fora** da pasta da skill,
na raiz do repositório hallmark (`site/`, `docs/`). Como só a pasta da skill foi
copiada, esses caminhos quebrariam.

**Vendorizado:** `site/css/tokens.css` → `references/tokens.css` (52K).
Os 6 links que apontavam para ele foram reescritos. Esse arquivo é operacional:
a regra de theme-diversification (SKILL.md, Step 2) lê nele os três valores de
eixo — paper band, display style, accent hue — de cada um dos 20 temas.

**Não vendorizado** (6 links seguem quebrados, todos não-operacionais):

| Link | Por que ficou de fora |
|---|---|
| `docs/recipes.md` | O próprio SKILL.md marca como *"Human-only (do NOT auto-load)"* |
| `docs/study-examples.md` | idem |
| `site/_tests/03-maple-bakery/` | Build de exemplo, ilustrativo |
| `site/_tests/05-tracejam-saas/` | idem |
| `site/examples/cobalt-01/` | idem |

`site/` inteiro tem 14M e `docs/` 3.1M — copiar tudo por causa de exemplos que a
skill nunca carrega sozinha não se paga. Se algum dia forem necessários, estão em
`hallmark/` no repositório original.

## Estado dos links

268 links internos resolvem; 6 quebrados, listados acima.

Para reconferir depois de qualquer edição:

```bash
cd .claude/skills/hallmark
python3 - <<'EOF'
import re, os, glob
quebrados, ok = [], 0
for md in glob.glob('**/*.md', recursive=True):
    base = os.path.dirname(md)
    for link in re.findall(r'\]\(([^)#][^)]*)\)', open(md, encoding='utf-8').read()):
        if link.startswith(('http', 'mailto')): continue
        if os.path.exists(os.path.normpath(os.path.join(base, link.split('#')[0]))): ok += 1
        else: quebrados.append((md, link))
print(f"OK: {ok}  quebrados: {len(quebrados)}")
for m, l in sorted(set(quebrados)): print(f"  {m} -> {l}")
EOF
```
