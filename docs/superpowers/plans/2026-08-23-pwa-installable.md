# PWA Instalável — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar o candy-shop-ui instalável como app (tela inicial, tela cheia, ícone da loja) com shell offline, sem alterar nenhum fluxo de API.

**Architecture:** `vite-plugin-pwa` gera manifest + service worker (Workbox) no build de produção. O SW pré-cacheia apenas assets estáticos; requisições `/api` nunca são interceptadas (venda exige online, por design). Ícones gerados uma vez a partir de `public/logo.png` e commitados.

**Tech Stack:** vite-plugin-pwa 1.3.0 (compatível com Vite 8), @vite-pwa/assets-generator 1.0.2 (preset `minimal-2023`), Nginx (headers no-cache para arquivos de runtime do PWA).

**Spec:** `docs/superpowers/specs/2026-08-23-pwa-design.md`

**Nota sobre TDD:** Tarefas 1–4 são configuração de build/infra — não há unidades testáveis em jsdom (SW e manifest são artefatos de build). Cada tarefa tem passo de verificação com comando e saída esperada. A suíte existente (`pnpm test`) deve continuar verde em todas as tarefas.

---

## Estrutura de arquivos

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `public/logo.png` | Mover de `src/assets/logo.png` | Fonte dos ícones (gerador escreve ao lado da fonte) |
| `pwa-assets.config.ts` | Criar | Config do gerador de ícones (preset + imagem fonte) |
| `public/pwa-*.png`, `maskable-icon-512x512.png`, `apple-touch-icon-180x180.png`, `favicon.ico` | Gerar + commitar | Ícones do PWA |
| `vite.config.ts` | Modificar | Plugin VitePWA: manifest + workbox |
| `index.html` | Modificar | Metas iOS + theme-color |
| `nginx.conf` | Modificar | no-cache para sw.js/manifest/workbox; `^~` em /api |
| `package.json` | Modificar | devDeps + script `generate-pwa-assets` |

Nenhum arquivo em `src/` é alterado. O registro do SW é automático (`injectRegister: 'auto'`).

---

### Task 1: Ícones do PWA a partir do logo

**Files:**
- Move: `src/assets/logo.png` → `public/logo.png`
- Create: `pwa-assets.config.ts`
- Modify: `package.json` (script)
- Generate: `public/pwa-64x64.png`, `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/maskable-icon-512x512.png`, `public/apple-touch-icon-180x180.png`, `public/favicon.ico`

- [ ] **Step 1: Mover o logo para public/**

O gerador escreve os assets na mesma pasta da imagem-fonte, e a pasta `public/` é copiada integralmente para o build.

```bash
git mv src/assets/logo.png public/logo.png
```

- [ ] **Step 2: Instalar dependências**

```bash
pnpm add -D vite-plugin-pwa @vite-pwa/assets-generator
```

Expected: instala sem erros de peer (plugin declara `vite: ^8.0.0` nos peerDependencies).

- [ ] **Step 3: Criar config do gerador**

Criar `pwa-assets.config.ts` na raiz:

```ts
import { defineConfig, minimal2023Preset as preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset,
  images: ['public/logo.png'],
})
```

O preset `minimal-2023` aplica padding padrão de zona de segurança no ícone maskable (recortes redondos do Android).

- [ ] **Step 4: Adicionar script no package.json**

Dentro de `"scripts"`, adicionar:

```json
"generate-pwa-assets": "pwa-assets-generator"
```

- [ ] **Step 5: Rodar o gerador**

```bash
pnpm generate-pwa-assets
```

- [ ] **Step 6: Verificar arquivos gerados**

```bash
ls public/*.png public/*.ico
```

Expected: `apple-touch-icon-180x180.png`, `maskable-icon-512x512.png`, `pwa-192x192.png`, `pwa-512x512.png`, `pwa-64x64.png`, `favicon.ico`.

- [ ] **Step 7: Commit**

```bash
git add public pwa-assets.config.ts package.json pnpm-lock.yaml
git commit -m "feat: add pwa icon assets generated from logo"
```

---

### Task 2: Plugin VitePWA (manifest + service worker)

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Configurar o plugin**

Substituir o conteúdo de `vite.config.ts` por:

```ts
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'pwa-64x64.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'maskable-icon-512x512.png',
        'apple-touch-icon-180x180.png',
      ],
      manifest: {
        name: 'Loja de Doces',
        short_name: 'Doces',
        description:
          'Controle de estoque mobile para registrar doces, quantidades e preços de compra.',
        lang: 'pt-BR',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        background_color: '#000000',
        theme_color: '#2d160f',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    restoreMocks: true,
  },
})
```

Decisões embutidas: `registerType: 'autoUpdate'` (o plugin injeta `skipWaiting` + `clientsClaim` — atualização silenciosa na próxima visita); `devOptions.enabled: false` (SW não existe em `pnpm dev`/`pnpm dev:api` — modos mock e api preservados); sem `runtimeCaching` (requisições `/api` atravessam o SW sem interceptação; `navigateFallbackDenylist` é defesa extra).

- [ ] **Step 2: Buildar e verificar artefatos**

```bash
pnpm build && ls dist/manifest.webmanifest dist/sw.js
```

Expected: build conclui e ambos os arquivos existem. Se o build falhar com erro do Workbox do tipo `Can't precache ... file size ... maximumFileSizeToCacheInBytes`, adicionar `maximumFileSizeToCacheInBytes: 3 * 1024 * 1024` dentro de `workbox: { ... }` e rebuildar (bundle com firebase/jspdf pode passar de 2 MiB).

- [ ] **Step 3: Conferir conteúdo do manifest**

```bash
cat dist/manifest.webmanifest
```

Expected: JSON com `name: "Loja de Doces"`, `display: "standalone"`, `theme_color: "#2d160f"` e os 4 ícones.

- [ ] **Step 4: Suíte de testes continua verde**

```bash
pnpm test
```

Expected: todos os testes passam (SW não roda em jsdom).

- [ ] **Step 5: Commit**

```bash
git add vite.config.ts
git commit -m "feat: configure vite-plugin-pwa manifest and service worker"
```

---

### Task 3: Metas do iOS e theme-color no index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Adicionar as metas**

Substituir o `<head>` de `index.html` por (o `<body>` permanece igual):

```html
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#2d160f" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Doces" />
    <meta
      name="description"
      content="Controle de estoque mobile para registrar doces, quantidades e preços de compra."
    />
    <title>Loja de Doces | Controle de Estoque</title>
  </head>
```

Sem `<link rel="manifest">` manual: o plugin o injeta no build. As metas `apple-*` são o que habilita instalação em tela cheia no iOS/Safari.

- [ ] **Step 2: Buildar e conferir injeções no HTML final**

```bash
pnpm build && grep -oE '(manifest\.webmanifest|apple-touch-icon-180x180\.png|theme-color)' dist/index.html | sort -u
```

Expected: as três strings presentes no `dist/index.html`.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add ios and theme meta tags for pwa install"
```

---

### Task 4: Nginx — no-cache para arquivos de runtime do PWA

**Files:**
- Modify: `nginx.conf`

- [ ] **Step 1: Atualizar regras**

Substituir o conteúdo de `nginx.conf` por:

```nginx
server {
  listen 80;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  # ^~ garante que /api/ nunca caia nas regex abaixo
  location ^~ /api/ {
    proxy_pass http://host.docker.internal:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # Runtime do PWA: navegador precisa revalidar a cada load
  # para detectar novas versões do app (autoUpdate)
  location ~* (sw\.js|manifest\.webmanifest|workbox-.*\.js)$ {
    add_header Cache-Control "no-cache";
  }
}
```

Duas mudanças: (1) `^~` em `/api/` — sem isso, uma URL tipo `/api/sw.js` seria capturada pela regex e servida como arquivo estático em vez de proxied; (2) regex que serve `sw.js`, `manifest.webmanifest` e o chunk `workbox-*.js` com `Cache-Control: no-cache`.

- [ ] **Step 2: Subir o container e verificar headers**

```bash
docker compose up --build -d && sleep 3
curl -sI http://localhost:4173/sw.js | grep -i cache-control
curl -sI http://localhost:4173/manifest.webmanifest | grep -i cache-control
curl -s http://localhost:4173/ | grep -c 'manifest.webmanifest'
curl -sI http://localhost:4173/assets/$(ls dist/assets | grep '^index-.*\.js$' | head -1) | grep -i HTTP
```

Expected, respectivamente: `cache-control: no-cache`; `cache-control: no-cache`; `1` (manifest linkado no HTML); `HTTP/1.1 200 OK` (assets servidos).

- [ ] **Step 3: Derrubar o container**

```bash
docker compose down
```

- [ ] **Step 4: Commit**

```bash
git add nginx.conf
git commit -m "feat: serve pwa runtime files without cache in nginx"
```

---

### Task 5: Verificação final (checklist do AGENTS.md)

- [ ] **Step 1: Lint + testes + build**

```bash
pnpm lint && pnpm test && pnpm build
```

Expected: tudo passa sem erros.

- [ ] **Step 2: Smoke test com preview**

```bash
pnpm preview
```

Em outro terminal:

```bash
curl -s http://localhost:4173/manifest.webmanifest | head -5
curl -sI http://localhost:4173/sw.js | head -1
```

Expected: JSON do manifest; `HTTP/1.1 200 OK`. Encerrar o preview depois.

- [ ] **Step 3: Verificação manual em navegador desktop**

Abrir `http://localhost:4173/` no Chrome → DevTools → Application:
- Manifest: sem erros, ícones carregados
- Service Workers: `sw.js` "activated and running"
- Aba Network offline + reload: app abre (shell), chamadas `/api` falham (toasts de erro existentes) — venda continua exigindo online, conforme spec

- [ ] **Step 4: Teste em celular real**

- **Android/Chrome:** abrir a URL (precisa ser acessível na rede/HTTPS em prod) → banner/ menu ⋮ → "Instalar app" → ícone do logo na tela inicial, abertura em tela cheia.
- **iOS/Safari:** Compartilhar → "Adicionar à Tela de Início" → ícone correto, sem barra de navegador.
- Fluxo de venda completo contra o backend: login, abrir sessão, registrar pedido, deletar pedido, fechar sessão, PDF.

- [ ] **Step 5: Commit final (se houver ajustes pendentes) e resumo**

Se algum ajuste de última hora foi preciso, commitá-lo. Nada pendente = nenhum commit extra.
