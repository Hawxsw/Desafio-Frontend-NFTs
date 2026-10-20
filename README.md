# Kurio — Marketplace de NFTs

Implementação do desafio frontend do marketplace de NFTs em React + TypeScript. Todos os dados (API REST, autenticação, carteiras, pagamentos e eventos em tempo real) são simulados com **MSW** na camada de rede; não há backend, blockchain nem gateway real.

- Deploy: https://desafio-frontend-nft-s.vercel.app
- Decisões de arquitetura, contratos e desvios do Figma: [ARCHITECTURE.md](ARCHITECTURE.md)

## Stack

| Responsabilidade | Tecnologia |
| --- | --- |
| Interface / linguagem | React 19, TypeScript 6 |
| Build | Vite 8 |
| Roteamento | TanStack Router (rotas por código em `src/routes/Router.tsx`) |
| Estado remoto | TanStack Query 5 |
| Cliente HTTP | Axios (`src/services/api`) |
| Tempo real | socket.io-client 4.8 + `@mswjs/socket.io-binding` |
| Estilo / componentes | Tailwind CSS 4, shadcn/ui (Radix) |
| Mocks | MSW 3 (REST + WebSocket) |
| Testes E2E e visuais | Playwright 1.64 |
| Auditoria | Lighthouse 13.5 |

## Requisitos

- Node.js 22 ou superior (desenvolvido com Node 24.13)
- pnpm 10 (`corepack enable` habilita a versão do lockfile)

## Setup

```bash
pnpm install
pnpm exec playwright install chromium   # necessário para testes e para o Lighthouse
pnpm dev                                # http://localhost:5173
```

### Variáveis de ambiente

| Variável | Valor padrão (`.env`) | Efeito |
| --- | --- | --- |
| `VITE_ENABLE_MSW` | `true` | Liga o MSW (REST + Socket.IO). Também é usado no build de demonstração/deploy. Com `false`, a aplicação tenta falar com `/api` e `/socket.io` reais, que não existem neste projeto. |

## Comandos

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Desenvolvimento com mocks |
| `pnpm build` | Verificação de tipos + build otimizado (com mocks) |
| `pnpm preview` | Serve o build em `http://localhost:4173` |
| `pnpm typecheck` | Verificação de tipos (app, configs e e2e) |
| `pnpm lint` | ESLint |
| `pnpm test` / `pnpm test:e2e` | Playwright em Chromium, projetos `desktop` (1440×900) e `mobile` (390×844) |
| `pnpm test:report` | Abre o relatório HTML do último run (`playwright-report/`) |
| `pnpm test:update-snapshots` | Regenera as baselines da regressão visual |
| `pnpm lighthouse` | Build + preview + 3 auditorias por página/perfil, com mediana |

## Credenciais fictícias

| Usuário | E-mail | Senha | Observações |
| --- | --- | --- | --- |
| Ana Souza | `ana@kurio.dev` | `Kurio@123` | 2 carteiras (principal multirrede e secundária Polygon), 2 favoritos |
| Bruno Lima | `bruno@kurio.dev` | `Kurio@123` | 1 carteira (Ethereum), sem favoritos |

As senhas são guardadas apenas como hash SHA-256 (`usuário:senha`) no banco simulado. Cupons: `KURIO10` (10%), `GREEN25` (25%), `EXPIRADO` (expirado).

## Cenários de mock

O painel **Cenários de mock** (canto inferior esquerdo, presente em dev e no deploy) seleciona o cenário e recarrega a página. **Resetar** restaura o banco simulado do cenário atual e limpa sessão, carrinho e rascunhos.

| Cenário | Efeito |
| --- | --- |
| Padrão (sucesso) | Latência de 100–300 ms, tudo funciona |
| Catálogo vazio | Banco sem NFTs |
| Latência variável | 0,8–3 s por requisição (determinístico por sequência) |
| Respostas fora de ordem | Requisições ímpares demoram 1,8 s, pares 200 ms |
| Sem conexão | Toda requisição falha na rede; o Socket.IO é recusado |
| Instável | Requisições ímpares respondem 503 (o Query refaz automaticamente) |
| Erro 500 em tudo | Toda requisição responde 500 |
| Sessão expira em 20s | Sessões criadas no login duram 20 s |
| Acesso negado (403) | Rotas autenticadas respondem 403 |
| Falha ao salvar favoritos | Inclusão/remoção de favorito responde 503 |
| Preço muda com item no carrinho | 4 s após o carrinho ter itens, o preço do primeiro item sobe 10% (REST + `nft.updated`) |
| Edição esgota com item no carrinho | Mesmo gatilho, mas a disponibilidade vai a zero |
| Carteira recusa conexão | `POST /wallets/:id/connect` responde 409 `WALLET_REJECTED` |
| Timeout após criar pedido | O pedido é criado, mas a resposta nunca chega (o Axios desiste em 10 s) |
| Pagamento recusado | O pedido fica pendente e depois é recusado |

Também é possível selecionar pelo console: `localStorage.setItem('kurio:mock-scenario', 'slow')` + recarregar.

### Controles usados pelos testes

`src/mocks/control.ts` exporta `mockControls`, com ações que **passam pela camada de mocks** (banco + eventos Socket.IO): `updateEdition` (muda preço/disponibilidade e emite `nft.updated`), `replayLastEvent` (duplicata), `replayStaleNftEvent` (versão antiga), `disconnectRealtime`/`restoreRealtime`, `expireSessions` e `resetMocks`. Os testes Playwright importam esse módulo dentro da página servida pelo `pnpm dev` (`import('/src/mocks/control.ts')`), então nada é exposto pela aplicação.

## Como reproduzir os fluxos de falha

1. **Busca fora de ordem**: cenário *Respostas fora de ordem*, digite uma busca e troque rapidamente; o resultado final corresponde sempre ao último termo.
2. **Carregamento lento e skeletons**: cenário *Latência variável*; catálogo e detalhe mostram skeletons.
3. **Erro e nova tentativa**: cenário *Erro 500 em tudo*, abra a home e depois volte para *Padrão* pelo painel e clique em **Tentar novamente**.
4. **Sessão expirada**: cenário *Sessão expira em 20s*, entre como Ana, abra `/perfil` e espere 20 s; a próxima chamada leva ao login com `redirect` preservado.
5. **Favorito com falha**: cenário *Falha ao salvar favoritos*; o coração muda na hora (otimista) e volta, com aviso.
6. **Cupom inválido/expirado**: no carrinho, use `XYZ` e `EXPIRADO`.
7. **Preço alterado no checkout**: cenário *Preço muda com item no carrinho*, adicione um item e vá ao pagamento: após 4 s aparece "Seu carrinho mudou", e a confirmação fica bloqueada até **Aceitar alterações** e revisar de novo.
8. **Carteira recusada**: cenário *Carteira recusa conexão* → **Conectar carteira**.
9. **Pagamento recusado**: cenário *Pagamento recusado* → pedido aparece pendente e depois **Pagamento recusado**, com os itens preservados no carrinho.
10. **Timeout com recuperação**: cenário *Timeout após criar pedido* → confirmar, esperar a mensagem de timeout, recarregar a página e clicar em **Verificar pedido**: a mesma chave de idempotência recupera o mesmo pedido.
11. **Queda do tempo real com pedido pendente**: coberto por `e2e/realtime.spec.ts`, que derruba o Socket.IO antes de confirmar e verifica a recuperação ao reconectar e ao recarregar, sem nova compra.

## Testes

```bash
pnpm test                      # todos os testes, desktop + mobile
pnpm test e2e/checkout.spec.ts --project=desktop
pnpm test:report
```

- Cada teste usa um contexto novo do navegador, então começa com `localStorage` vazio e banco semeado do zero.
- Os cenários são definidos por teste (`app.scenario(...)`), e os eventos de tempo real são disparados pelos `mockControls`, passando pelo MSW e pelo `socket.io-client`. O painel de cenários é ocultado por CSS durante os testes.
- Falhas geram trace, screenshot e vídeo em `test-results/`; o relatório HTML fica em `playwright-report/`.
- As baselines visuais (início, detalhe, carrinho, pagamento × desktop/mobile) ficam versionadas em `e2e/visual.spec.ts-snapshots/`. Elas foram geradas no Windows; em outro sistema operacional, gere as baselines desse sistema com `pnpm test:update-snapshots`.

| Arquivo | Cobertura |
| --- | --- |
| `catalog.spec.ts` | Busca, filtros combinados, ordenação, paginação, histórico/refresh, vazio, skeleton, erro + retry, fora de ordem, detalhe direto, 404 |
| `auth.spec.ts` | Cadastro (validação e conflito), login, expiração de sessão, logout e troca de usuário |
| `favorites.spec.ts` | Favoritar, persistência, falha com rollback otimista |
| `cart.spec.ts` | Quantidades, limite por edição, remoção, cupons, totais, refresh e merge no login |
| `checkout.spec.ts` | Compra completa até o recibo, validação, carteira recusada/desconectada, clique repetido, recusa, timeout + idempotência |
| `realtime.spec.ts` | Preço/disponibilidade via Socket.IO no checkout e na revisão, duplicatas e eventos antigos, queda de conexão e refresh com pedido pendente |
| `account.spec.ts` | Perfil, avatar, senha e carteiras com erros de validação |
| `a11y.spec.ts` | Teclado, foco em diálogos, alt de imagens, movimento reduzido, overflow em 390/768/1440 |
| `visual.spec.ts` | Regressão visual |

## Lighthouse

`pnpm lighthouse` gera o build, sobe o `vite preview` em `:4173` e roda 3 auditorias por página (`/` e `/nft/nft-001`) e perfil (mobile padrão do Lighthouse e preset desktop) em Chromium headless. A configuração fica em `lighthouse/config.mjs` e o executor em `lighthouse/run.mjs`. Os relatórios HTML/JSON de cada execução ficam em `lighthouse/reports/`, e as medianas em `lighthouse/summary.json` e `lighthouse/summary.md`.

Mediana da última execução (Lighthouse 13.5.0, HeadlessChrome 156, Node 24.13, Windows 11, Ryzen 5 5600G, build de produção com MSW no cenário padrão):

| Página | Perfil | Performance | Accessibility | Best Practices | SEO | LCP (ms) | CLS | TBT (ms) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| início | mobile | 90 | 97 | 100 | 100 | 3201 | 0.001 | 140 |
| início | desktop | 99 | 97 | 100 | 100 | 805 | 0.002 | 5 |
| detalhe | mobile | 91 | 96 | 100 | 100 | 3184 | 0.000 | 108 |
| detalhe | desktop | 90 | 96 | 100 | 100 | 851 | 0.200 | 0 |

Todas as categorias atingem as metas. Pontos de atenção:

- **LCP mobile (~3,2 s)**: as imagens do hero/NFT são PNG de ~2 MB (assets originais), e o MSW registra o service worker antes do primeiro render.
- **CLS 0,2 no detalhe desktop**: o skeleton original do detalhe é mais baixo que o conteúdo final, e o rodapé desce quando os dados chegam.

## Deploy

O projeto está preparado para a Vercel (`vercel.json` reescreve todas as rotas para `index.html`, então acesso direto e refresh funcionam). O build de produção inclui o MSW e o service worker `public/mockServiceWorker.js`; nenhuma variável extra é necessária além do `.env` versionado.

```bash
pnpm dlx vercel --prod
```
