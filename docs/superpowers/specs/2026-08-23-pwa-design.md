# Design: candy-shop-ui como PWA instalável

**Data:** 2026-08-23
**Status:** Aprovado pelo usuário
**Escopo:** Instalável como app (tela inicial, tela cheia, ícone próprio). Offline limitado ao shell da aplicação.

## Objetivo

Transformar o candy-shop-ui em um PWA instalável: o usuário adiciona o dashboard à tela inicial do celular (Android via prompt do Chrome; iOS via Compartilhar → Adicionar à Tela de Início) e o app abre em tela cheia, sem barra de navegador, com ícone da loja.

Bônus aceito do escopo: o app abre offline exibindo a interface (shell pré-cacheado). Dados de API não são cacheados.

**Requisito inegociável:** vender doces em uma sessão exige conexão ativa. O PWA é apenas a "casca" instalável — toda operação de venda (criar sessão, registrar pedido, deletar pedido, fechar sessão) é uma chamada de API em tempo real e deve falhar com feedback claro quando offline. O shell offline existe só para o app abrir e exibir a UI, nunca para simular operação de venda.

## Fora de escopo (YAGNI)

- Fila offline de pedidos (enfileirar vendas feitas sem internet)
- Push notifications
- Background sync
- Tela de splash customizada do iOS
- Prompt/toast de "nova versão disponível" (usa autoUpdate silencioso)

## Abordagem escolhida

`vite-plugin-pwa` (devDependency) com `registerType: 'autoUpdate'`. Alternativas descartadas: SW escrito à mão (versionamento de cache manual, sujeito a cache velho travado) e manifest sem SW (sem shell offline, UX de instalação mais pobre).

## Decisões

### 1. Manifest e identidade

Configurado via opções do `vite-plugin-pwa` em `vite.config.ts`:

| Campo | Valor | Motivo |
|---|---|---|
| `name` | `Loja de Doces` | Nome completo do app |
| `short_name` | `Doces` | Rótulo curto na tela inicial |
| `description` | Descrição atual do index.html | Consistência |
| `lang` | `pt-BR` | Idioma da audiência |
| `display` | `standalone` | Abrir sem barra do navegador |
| `start_url` | `/` | Entrada do app |
| `scope` | `/` | App inteiro |
| `background_color` | `#000000` | Cor de fundo do logo (splash screen) |
| `theme_color` | `#2d160f` | cocoa-900, cor da barra de status |

### 2. Ícones

- Fonte: `src/assets/logo.png` (1254×1254, fundo preto).
- Geração: `@vite-pwa/assets-generator` (companheiro oficial do plugin), executado uma vez, com padding de ~10% no ícone maskable (zona de segurança para os recortes redondos do Android).
- Saída em `public/`: `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png`, `maskable-icon-512x512.png`, `apple-touch-icon.png` (180×180).
- PNGs commitados no repositório (geração não entra no build do Docker).

### 3. index.html

- O plugin injeta `<link rel="manifest">` automaticamente no build.
- Adições manuais: `<meta name="theme-color" content="#2d160f">`, `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`, `<meta name="apple-mobile-web-app-capable" content="yes">`, `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`, `<meta name="apple-mobile-web-app-title" content="Doces">` — necessários para a instalação em tela cheia no iOS/Safari.

### 4. Service worker e cache

- SW gerado pelo Workbox (modo `generateSW`, padrão do plugin).
- Pré-cache de todos os assets do build (HTML/JS/CSS com hash) + `navigateFallback: 'index.html'` para rotas da SPA funcionarem offline (shell).
- **Nenhuma estratégia de runtime cache para `/api`**: requisições de API atravessam o SW sem interceptação — dados de venda sempre frescos. Sem internet, as chamadas falham com os toasts de erro já existentes.
- Firebase (comprovantes PIX): chamada externa direta, fora do alcance do SW.
- `devOptions.enabled: false`: SW não existe em desenvolvimento.

### 5. Comportamento por modo (preservação obrigatória)

| Modo | Comando | API | Service Worker |
|---|---|---|---|
| dev (mock) | `pnpm dev` | axios-mock-adapter | Desligado |
| dev:api | `pnpm dev:api` | Vite proxy `/api` → `localhost:3000` | Desligado |
| prod | `pnpm build` + Docker | `/api` (ou `VITE_API_URL` do `.env`) → proxy Nginx → backend | Ativo |

- `VITE_ENABLE_API_MOCKS` e `VITE_API_URL` continuam funcionando como hoje; a camada PWA não altera nenhum fluxo de API.
- O app instalado no celular é sempre o build de produção (backend real).

### 6. Nginx / Docker

- `nginx.conf`: nova regra para servir `/sw.js`, `/manifest.webmanifest` e `workbox-*.js` com `Cache-Control: no-cache` (detecção imediata de novas versões). Assets com hash mantêm comportamento atual.
- `Dockerfile`: sem mudanças — `dist/` já sai com `sw.js` + manifest.
- `compose.yaml`: sem mudanças.
- `.env.example`: sem mudanças (nenhuma variável nova é necessária).

### 7. Atualização de versão

`registerType: 'autoUpdate'`: o SW detecta `sw.js` novo, pré-cacheia a versão nova e ativa sozinho (`skipWaiting` + `clientsClaim`). O usuário recebe a versão nova na próxima visita/recarga. Sem prompt.

## Arquivos tocados

| Arquivo | Mudança |
|---|---|
| `package.json` | + `vite-plugin-pwa`, + `@vite-pwa/assets-generator` (dev), script `generate-pwa-assets` |
| `vite.config.ts` | Plugin `VitePWA` com manifest + workbox config |
| `index.html` | Metas e links do iOS + theme-color |
| `public/` | Ícones gerados (commitados) |
| `nginx.conf` | Regra no-cache para sw.js/manifest |
| `docs/superpowers/specs/` | Esta spec |

Nenhum arquivo de `src/` é alterado: o plugin registra o SW automaticamente injetando o script de registro no build (`injectRegister: 'auto'`, padrão).

## Verificação

1. `pnpm lint` e `pnpm test` continuam passando (SW não roda em jsdom/dev).
2. `pnpm build && pnpm preview`: `GET /manifest.webmanifest` retorna o manifest; DevTools → Application mostra SW ativo e manifest válido.
3. Lighthouse (categoria PWA): "Installable".
4. Teste real: instalar em um Android (Chrome) e um iOS (Safari) — ícone correto, abertura em tela cheia, sessão de vendas funcionando contra o backend.
5. `docker compose up --build` continua funcionando (checklist do AGENTS.md).
