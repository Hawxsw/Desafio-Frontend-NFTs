# Arquitetura

## Organização

```
src/
  app.tsx, main.tsx          bootstrap: liga o MSW e só então importa a aplicação
  routes/                    Router.tsx (todas as rotas, guarda privada), layouts, NotFound
  pages/public|private/      telas e seus componentes locais
  components/                componentes de domínio, shared/ e shadcn/ui
  hooks/                     hooks do TanStack Query por domínio + tempo real
  services/api/              instância Axios e clientes REST tipados
  lib/                       QueryClient, cliente Socket.IO, anúncios acessíveis
  types/                     contratos compartilhados entre mocks, transporte e UI
  utils/                     dinheiro (decimal.js), erros, validação, storage do checkout
  mocks/                     MSW: handlers REST, Socket.IO, banco simulado, cenários
e2e/                         Playwright (specs, fixtures, baselines visuais)
lighthouse/                  configuração, executor, relatórios e resumo
```

Os tipos em `src/types` são a fonte única dos contratos. Os handlers MSW, os serviços Axios e os componentes usam os mesmos tipos. Componentes, hooks e o cliente Axios não contêm respostas fictícias: todo dado passa pela rede simulada.

`main.tsx` inicia o worker do MSW **antes** de importar a aplicação. Isso é necessário porque o `engine.io-client` captura `globalThis.WebSocket` no momento em que é importado. Se a aplicação carregasse primeiro, o Socket.IO usaria o WebSocket nativo e escaparia do interceptador.

## Contratos REST

Base `/api`. Toda requisição leva `Authorization: Bearer <token>` (quando há sessão) e `X-Cart-Id: <uuid do visitante>`. Valores em ETH trafegam como **strings decimais** (`"0.664"`). Quantidades são inteiras.

| Método e rota | Corpo / parâmetros | Resposta | Erros |
| --- | --- | --- | --- |
| `POST /auth/register` | `{ username, email, password }` | `201 Session` | 422 validação, 409 conflito de usuário/e-mail |
| `POST /auth/login` | `{ email, password }` | `200 Session` | 422, 401 credenciais |
| `GET /auth/me` | — | `200 User` | 401 sessão inválida/expirada, 403 |
| `POST /auth/logout` | — | `204` | — |
| `GET /nfts` | `q, tab, category[], network[], minPrice, maxPrice, availableOnly, sort, page, pageSize, exclude` | `200 { data, page, pageSize, total, totalPages, facets }` | 422 filtros de preço |
| `GET /nfts/featured` | — | `200 Nft` | 404 |
| `GET /nfts/:id` | — | `200 Nft` | 404 |
| `GET /favorites` | — | `200 { nftIds, nfts }` | 401 |
| `PUT /favorites/:nftId` | — | `200 { nftIds, nfts }` | 401, 404, 503 (cenário) |
| `DELETE /favorites/:nftId` | — | `200 { nftIds, nfts }` | 401, 503 (cenário) |
| `GET /cart` | — | `200 Quote` | 401 |
| `POST /cart/items` | `{ nftId, editionId, quantity }` | `200 Quote` | 422 quantidade, 404, 409 `AVAILABILITY_CONFLICT` |
| `PATCH /cart/items/:editionId` | `{ quantity }` | `200 Quote` | 422, 404, 409 |
| `DELETE /cart/items/:editionId` | — | `200 Quote` | — |
| `PUT /cart/coupon` | `{ code }` | `200 Quote` | 422 `COUPON_INVALID`, 422 `COUPON_EXPIRED` |
| `DELETE /cart/coupon` | — | `200 Quote` | — |
| `POST /cart/accept-changes` | — | `200 Quote` | — |
| `POST /cart/merge` | header `X-Cart-Id` | `200 Quote` | 401 |
| `POST /orders` | header `Idempotency-Key`; `{ quoteId, walletId, network, buyer }` | `201 Order` (novo) / `200 Order` (repetição) | 422, 409 `QUOTE_OUTDATED`, 409 `IDEMPOTENCY_CONFLICT`, 401 |
| `GET /orders/:id` | — | `200 Order` | 404 (inexistente ou de outro usuário), 401 |
| `PATCH /me` | `{ name, username, email, ensName, referralCode }` | `200 User` | 422 |
| `PUT /me/avatar` | `{ dataUrl }` (PNG/JPEG/WebP, até ~500 KB) | `200 User` | 422 |
| `DELETE /me/avatar` | — | `200 User` | — |
| `POST /me/password` | `{ currentPassword, newPassword }` | `204` | 422 |
| `GET /wallets` | — | `200 Wallet[]` | 401 |
| `POST /wallets` | `WalletInput` | `201 Wallet` | 422, 409 tipo duplicado |
| `PATCH /wallets/:id` | `WalletInput` | `200 Wallet` | 422, 404 |
| `POST /wallets/:id/connect` | `{ network }` | `200 WalletConnection` | 422 rede, 404, 409 `WALLET_REJECTED` (cenário) |

**Cotação (`Quote`)**: `id`, linhas com preço **atual** e disponibilidade, `couponCode`, `subtotal`, `discount`, `networkFee`, `total`, `issues[]` e `expiresAt` (5 min). As `issues` comparam o carrinho com o catálogo: `PRICE_CHANGED`, `INSUFFICIENT_AVAILABILITY`, `COUPON_INVALID` e `COUPON_EXPIRED`. O cliente nunca soma valores para decidir o total; ele mostra o que a API calcula com `decimal.js` (precisão de 18 casas).

**Erros**: todos seguem `{ code, message, fieldErrors?, details? }`, com os códigos `VALIDATION_ERROR` (422), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT`, `AVAILABILITY_CONFLICT`, `PRICE_CHANGED`, `QUOTE_OUTDATED`, `IDEMPOTENCY_CONFLICT`, `WALLET_REJECTED` (409), `COUPON_*` (422), `SERVICE_UNAVAILABLE` (503) e `INTERNAL_ERROR` (500). Os `fieldErrors` são ligados a cada campo via `aria-describedby`.

## Eventos Socket.IO

O cliente (`src/hooks/useRealtime.tsx`) usa `socket.io-client` com `path: '/socket.io/'`, transporte `websocket`, `auth: { token }` e reconexão automática (atraso de 0,5–3 s, timeout de conexão de 4 s).

Envelope de todos os eventos:

```ts
{ id: string; type: 'nft.updated' | 'order.updated'; resource: { type: 'nft' | 'order'; id: string }; version: number; occurredAt: string; data: Nft | Order }
```

| Evento | Destinatários | Efeito no cliente |
| --- | --- | --- |
| `nft.updated` | todos os sockets | Atualiza detalhe, listas, destaque e favoritos no cache, sem regredir de versão. Se o NFT está no carrinho, invalida a cotação e anuncia a mudança (`role="alert"`) |
| `order.updated` | só os sockets autenticados como o dono do pedido | Atualiza o pedido no cache. Se confirmado, invalida carrinho e catálogo; anuncia confirmação ou recusa |

**Origem dos eventos.** Toda mudança no banco simulado que afeta um NFT ou pedido publica o evento correspondente: confirmação de pedido (baixa de disponibilidade), cenários de preço/esgotamento e `mockControls.updateEdition` (usado nos testes). REST e Socket.IO leem o mesmo banco.

**Transporte e limitações no ambiente de mocks.**
- O MSW intercepta o `WebSocket` dentro da própria página. O `@mswjs/socket.io-binding` codifica e decodifica os pacotes Engine.IO/Socket.IO e faz o handshake.
- O servidor simulado envia `ping` a cada 20 s para manter o heartbeat do Engine.IO.
- Não há salas, namespaces nem long-polling (só `websocket`).
- O MSW 3 remove o prefixo `/socket.io/` da URL antes de comparar, por isso o link é a origem e o handler confere o caminho.
- O "servidor" vive na aba: cada aba tem o seu, e eventos só chegam à aba que gerou a mudança. Outras abas veem a mudança via REST, ao refazer as consultas.
- Quando a conexão é recusada (offline ou bloqueio de teste), o socket abre e é fechado antes do handshake. O cliente só percebe pelo timeout de conexão de 4 s, e por isso esse timeout foi configurado.

## Reconciliação REST ↔ Socket.IO

1. **Duplicatas e eventos antigos.** `RealtimeEventTracker` descarta ids já vistos e versões menores ou iguais à última aplicada para o mesmo recurso. A escrita no cache também só substitui se `incoming.version > current.version`. Eventos repetidos não reaplicam efeitos (anúncio, invalidação).
2. **Reconexão.** No `connect` seguinte a uma desconexão, o cliente invalida as consultas ativas de NFTs, carrinho e pedidos. Isso refaz as consultas pela API REST, que é a fonte da verdade.
3. **Isolamento por sessão.** O socket é criado por usuário (efeito dependente do `userId`). Logout ou troca de usuário encerram o socket anterior e removem os listeners. `order.updated` só é aceito se `data.userId` for o usuário atual, e o servidor simulado também filtra por dono.
4. **Pedido pendente.** O pedido nasce `pending` e é liquidado pelo mock após 3 s (`settlesAt`). A liquidação é *preguiçosa*: também ocorre em `GET /orders/:id` e quando um socket conecta. Assim, um refresh ou reconexão recupera o estado final mesmo que o evento tenha se perdido. Os estados `confirmed` e `declined` são terminais.

## Sessão

- O token fica em `localStorage` (`kurio:session-token`). `GET /auth/me` restaura a sessão após refresh. Senhas não são armazenadas no cliente; o mock guarda só hashes.
- Um 401 numa requisição autenticada com o token atual dispara o tratamento de expiração (`setSessionExpiredHandler`): limpa o token e os dados privados do cache, anuncia a expiração e, em telas privadas (perfil, favoritos, pagamento, pedido), leva ao `/login?redirect=<url atual>`. O login devolve ao destino.
- No checkout, o rascunho (carteira, rede, campos) e a tentativa de pedido ficam em `sessionStorage` por usuário. O contexto é retomado depois de entrar de novo.
- Logout e troca de usuário removem do cache as consultas privadas (`wallets`, `favorites`, `orders`, `cart`). As chaves dessas consultas incluem o id do usuário, então dados de um usuário nunca são servidos a outro.
- A rota privada (`id: 'private'`) protege `/perfil`, `/perfil/carteiras`, `/favoritos`, `/pagamento` e `/pedido/$orderId`.

## Carrinho

- O dono do carrinho é `user:<id>` com sessão, ou `guest:<X-Cart-Id>` para o visitante (uuid em `localStorage`). Assim, cada usuário e cada visitante têm o seu carrinho, e o carrinho persiste após refresh.
- No login/cadastro, `POST /cart/merge` soma os itens do visitante ao carrinho do usuário, respeitando a disponibilidade, e apaga o carrinho do visitante.
- Cada item guarda o preço que o usuário viu. Se o catálogo muda (evento ou outra ação), a cotação passa a ter `issues`: o carrinho e o checkout avisam, bloqueiam a finalização e oferecem **Aceitar alterações** (`POST /cart/accept-changes`, que atualiza preços e limita quantidades).
- Após a confirmação, só os itens e quantidades comprados saem do carrinho. Em falha ou recusa, nada é removido.

## Pedido, idempotência e recibo

- A chave de idempotência é gerada por tentativa e salva em `sessionStorage` com o corpo enviado. O botão é desabilitado durante o envio e um `ref` impede envios paralelos.
- Em falha sem resposta (timeout de 10 s ou rede), a tentativa é mantida. **Tentar novamente**, ou **Verificar pedido** após refresh, reenvia a mesma chave e o mesmo corpo, e o mock devolve o mesmo pedido (`200`). Reusar a chave com outro corpo gera `409 IDEMPOTENCY_CONFLICT`.
- Antes de enviar, a revisão refaz `GET /cart`, que revalida preço, disponibilidade, cupom e taxa. Se os valores mudam durante a revisão (evento ou nova cotação), a confirmação fica bloqueada até o usuário revisar de novo. O servidor também rejeita com `409 QUOTE_OUTDATED` qualquer cotação que não corresponda ao estado atual.
- A tela `/pedido/$orderId` mostra pendente, recusado ou o recibo. O recibo só aparece para `status: 'confirmed'` vindo da API ou do evento. O pedido é um *snapshot* (itens, preços, cupom, taxa, total, carteira e rede), então mudanças posteriores no catálogo não alteram o recibo. Hash e link do explorador são simulados.

## Estratégia de cache (TanStack Query)

| Item | Política |
| --- | --- |
| `staleTime` | 30 s padrão; sessão (`auth/me`) `Infinity` (atualizada por mutations e eventos de sessão) |
| `gcTime` | 5 min |
| Retries de consulta | até 2, só para erro de rede ou 5xx, com backoff 1 s/2 s (4 s no máximo). 4xx nunca é repetido |
| Retries de mutation | nenhum automático (evita compras duplicadas). Repetição de pedido só com a mesma chave de idempotência |
| Refetch | ao focar a janela e ao reconectar o Socket.IO |
| Respostas obsoletas | as chaves incluem todos os parâmetros. O `AbortSignal` do Query é repassado ao Axios e cancela requisições substituídas. `keepPreviousData` no catálogo evita piscar |
| Mutations do carrinho | gravam a cotação retornada direto no cache (`setQueryData`) |
| Atualização otimista | favoritos: `onMutate` grava o novo estado, `onError` restaura o snapshot, `onSettled` invalida |
| Isolamento | chaves `['favorites', userId]`, `['wallets', userId]`, `['orders', userId, id]` e `['cart', 'quote', userId \| 'guest']` |

O estado do catálogo (busca, aba, categorias, redes, faixa de preço, ordenação e página) vive na URL via `validateSearch`. Ele sobrevive a refresh e ao histórico, e qualquer mudança de filtro reinicia a página. O TanStack Router serializa arrays como JSON (`category=["arte-digital"]`).

## MSW

- Banco simulado em memória, persistido em `localStorage` (`kurio:mock-db`, com versão de esquema). Ele é semeado por cenário a partir das fixtures em `src/mocks/data` (60 NFTs, 9 categorias, 3 redes, edições esgotadas e de unidade única, 2 usuários, 3 carteiras, 3 cupons).
- **Resetar** ou trocar de cenário recria o banco a partir da semente e limpa sessão, carrinho do visitante e rascunhos, voltando a um estado conhecido.
- A simulação de rede (`src/mocks/network.ts`) aplica latência determinística (PRNG semeado pela sequência da requisição), falhas de rede, 5xx e alternância 503.
- A camada é ativada por `VITE_ENABLE_MSW` e está presente no build de produção/deploy.

## Acessibilidade

- Link "Pular para o conteúdo", foco visível e `main` focável.
- Diálogos e drawers (login, cadastro, filtros, revisão, recibo) usam Radix: prendem o foco, fecham com Escape e devolvem o foco ao gatilho.
- Campos com `label`, `aria-invalid` e `aria-describedby` para os erros. O primeiro campo inválido do checkout recebe foco.
- Mutations e eventos em tempo real são anunciados em regiões `role="status"` e `role="alert"` (`LiveAnnouncer`).
- Estados como favorito e edição esgotada são expostos por `aria-pressed`, `aria-checked` e texto, além da cor.
- Skeletons têm `aria-busy` e respeitam `prefers-reduced-motion`.

## Decisões de UX e desvios do Figma

Os elementos que já existiam seguem o Figma sem alteração. Os itens abaixo **não têm frame no Figma** e foram acrescentados no estilo existente, porque o enunciado os exige:

- **Busca no desktop**: campo acima dos filtros na lateral (o layout desktop não tinha busca).
- **Selo "Esgotado"** nos cards do catálogo e texto de disponibilidade/limite por pedido no detalhe.
- **Lixeira** no card do carrinho mobile (o frame mobile não tinha remoção). **Remover cupom** aparece abaixo do campo quando há cupom aplicado.
- **"Seu carrinho mudou"** com **Aceitar alterações**, no carrinho, no checkout e na revisão.
- **Conectar/Desconectar carteira** no checkout e o diálogo **Revise seu pedido** antes do envio.
- **Aviso de pedido sem resposta** e a tela de pedido (pendente/recusado). O recibo confirmado reutiliza o modal do Figma.
- **Página de favoritos** com grade de cards, além de estados de erro e vazio.
- **Avatar**: os botões "Alterar" e "Remover", que eram placeholders, agora funcionam com o mesmo visual.
- No checkout mobile (sem formulário no Figma), os dados do colecionador vêm do perfil e aparecem na revisão.

Pontos conhecidos:

- **Hero da home entre 768 px e 1279 px**: a partir de `md` o hero usa as medidas do desktop (texto de 600 px + imagem de 450 px) e causa overflow horizontal no tablet. O teste `a11y.spec.ts › sem overflow horizontal em 768px` falha por isso. A correção muda a composição do hero no tablet e aguarda aprovação de design.
- **Skeletons**: mantêm o efeito pulsante e as medidas originais do projeto, em vez de *shimmer*. O carrinho e o checkout mantêm o texto de carregamento original.

## Performance

- **SEO 83 (meta 90)**: o `index.html` não tem `<meta name="description">` e não há `robots.txt`; a rota cai no `index.html` da SPA e o Lighthouse o considera inválido.

- **LCP mobile (~3,2 s)**: a imagem do hero/NFT é PNG de ~2 MB (assets originais do Figma). Além disso, o MSW precisa registrar o service worker antes do primeiro render, porque a aplicação só é importada depois dos mocks. A conversão das imagens para WebP/AVIF redimensionado reduziria o LCP, mas é uma substituição de asset que não foi feita.
- **CLS 0,2 no detalhe desktop**: o skeleton original do detalhe é mais baixo que o conteúdo final, e o rodapé desce quando os dados chegam. Ajustar as medidas do skeleton remove o deslocamento; ficou como está para preservar o componente original.
- O TBT fica baixo graças ao code splitting por rota (`lazyRouteComponent`) e ao carregamento dos mocks em chunk separado.

## Limitações

- Não há backend: os dados vivem no `localStorage` de cada navegador, e cada aba roda o seu próprio "servidor" simulado.
- Conexão de carteira, hash de transação e explorador são simulados. O link aponta para o explorador real com um hash fictício.
- Login social, recuperação de senha e as seções editoriais e de suporte aparecem desabilitados ("Disponível em breve").
