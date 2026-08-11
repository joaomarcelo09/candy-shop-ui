# Loja de Doces — Controle de Estoque

Painel mobile-first da loja de doces, com controle de estoque e um fluxo de venda em modo foco para uso rápido durante os cultos.

## Funcionalidades atuais

- Abertura manual de sessões aos domingos, nas janelas de 11:00–11:30 e 18:00–18:30
- Fechamento programado às 12:00 ou 22:00, com reconciliação ao reabrir o app
- Tela de sessão sem barra inferior ou sidebar, evitando saídas acidentais durante a venda
- Catálogo com controles táteis `+`/`−`, rascunho multilinha e total sempre visível
- Registro e exclusão de vendas com atualização do estoque somente após confirmação da API
- Foto opcional de comprovante PIX armazenada no Firebase Storage
- Histórico de sessões e vendas, com relatório PDF baixado sob demanda
- Aviso compacto para itens com estoque baixo ou zerado
- Busca de doces por nome
- Filtros para estoque baixo e sem estoque
- Seleção pesquisável de doces em ordem alfabética, com cadastro de novos nomes
- Registro de lotes com doce, quantidade e preço unitário de venda
- Atualização do estoque somente após a confirmação do lote
- Correção explícita da quantidade para resolver erros de contagem
- Histórico completo de lotes em drawer acessível pelo topo da lista
- Dados de estoque carregados e alterados exclusivamente através do contrato da API
- Login integrado a `POST /auth/login`, sessão persistida e rotas internas protegidas
- Logout e tratamento global de respostas `401`

No modo de desenvolvimento, o `axios-mock-adapter` simula a API diretamente no navegador. A aplicação usa os mesmos contratos e a mesma instância Axios nos ambientes mock e real.

## Interface

A interface usa componentes shadcn/ui adaptados à identidade existente:

- fonte `DM Sans` para textos
- fonte `Fraunces` para títulos e números de destaque
- paleta creme, cacau, morango, tangerina e menta
- folha inferior para formulários no telefone
- navegação inferior com áreas reservadas para Vendas, Estoque e Dados
- sidebar persistente, indicadores e grade de produtos em telas grandes
- painéis laterais para formulários e históricos no computador

## Ambiente mock e conta de teste

`pnpm dev` inicia o Vite em modo mock e disponibiliza a conta:

```text
E-mail: vendedora@doces.com
Senha:  doces123
```

A própria tela de login mostra essa conta e oferece um botão para preencher os campos. Sessões e pedidos do mock são persistidos no navegador para permitir testar a retomada depois de recarregar o app.
O modo mock libera a abertura da sessão em qualquer dia e horário; os horários de domingo continuam estritos nos modos conectados à API real.

Para desenvolver contra uma API real, use:

```bash
pnpm dev:api
```

`pnpm prod` também inicia o Vite em modo production, sem instalar o adaptador de mocks. O `pnpm build` gera a aplicação de produção com a mesma configuração.

## Login e API real

O login usa `POST /auth/login` e aceita respostas com `token` ou `accessToken`. A URL da API pode ser configurada em `.env`:

```bash
VITE_API_URL=http://localhost:3000
```

Sem essa variável, as chamadas usam `/api` e são encaminhadas pelo proxy do Vite para `http://localhost:3000` durante o desenvolvimento real. As credenciais fixas existem somente no bundle de mock carregado dinamicamente por `pnpm dev`.

Endpoints esperados pela implementação atual:

```text
POST  /auth/login
GET   /inventory/items
GET   /inventory/entries
POST  /inventory/entries
PATCH /inventory/items/:itemId/quantity
GET   /sessions/active
GET   /sessions
POST  /sessions
GET   /sessions/:id/orders
POST  /sessions/:id/orders
DELETE /sessions/:sessionId/orders/:orderId
POST  /sessions/:id/close
DELETE /sessions/:id
```

O backend é a autoridade para as janelas de abertura e para o fechamento automático. A interface também agenda o fechamento enquanto estiver aberta e reconcilia a sessão na próxima consulta, mas o encerramento no horário exato com o app totalmente fechado deve ser executado no servidor (por exemplo, com uma função agendada).

## Soft delete de sessões — contrato para a API

A exclusão disponível no histórico é obrigatoriamente um **soft delete**. O endpoint esperado é:

```text
DELETE /sessions/:id

200 OK
{
  "session": {
    "id": "sessao-123",
    "status": "closed",
    "deletedAt": "2026-08-10T22:30:00.000Z",
    "deletedBy": "user-123"
  }
}
```

Regras que a implementação da API deve respeitar:

- Adicionar `deleted_at TIMESTAMPTZ NULL` e `deleted_by` à tabela de sessões. Um campo opcional `deletion_reason` pode ser incluído para auditoria.
- Permitir exclusão somente de sessões encerradas. Uma sessão aberta deve retornar `409 Conflict` e permanecer inalterada.
- Fazer a operação em transação e registrar o usuário autenticado em `deleted_by` ou em uma tabela de auditoria.
- Tornar o endpoint idempotente: repetir a exclusão deve retornar sucesso sem alterar a data ou o autor originais.
- Nunca apagar pedidos, linhas, valores, referências de comprovantes PIX ou arquivos do Firebase Storage nesse endpoint.
- Não devolver sessões excluídas em `GET /sessions` nem em `GET /sessions/active`. O filtro padrão deve ser `deleted_at IS NULL`.
- Bloquear o acesso comum a `GET /sessions/:id/orders` quando a sessão estiver excluída. Uma consulta administrativa autenticada pode usar `includeDeleted=true` para recuperação/auditoria.
- Não devolver unidades ao estoque: excluir a sessão do histórico não desfaz vendas e não altera movimentações de estoque.
- Excluir essas sessões dos relatórios operacionais comuns, mantendo-as disponíveis para auditoria administrativa.
- Recomenda-se um endpoint autenticado `POST /sessions/:id/restore`, que limpe `deleted_at` e `deleted_by` e registre a restauração no log de auditoria.

O mock do frontend segue essas regras: marca `deletedAt`/`deletedBy`, preserva os pedidos e apenas remove a sessão das consultas normais.

## Firebase Storage para PIX

Copie `.env.example` para `.env` e preencha as variáveis `VITE_FIREBASE_*`. O upload usa o SDK modular do Firebase e só é carregado quando uma imagem é anexada. Em produção, configure Firebase Authentication/App Check e regras do Storage para que apenas usuários autorizados possam gravar em `pix-receipts/{sessionId}`. Imagens são limitadas a 5 MB no cliente; o mesmo limite deve ser validado nas regras ou no backend.

## Arquitetura

A separação segue a ideia de Views enxutas e responsabilidades bem delimitadas, sem reproduzir nomenclaturas de MVVM no código:

```text
React View → TanStack Query → contrato AuthApi/InventoryApi → Axios → API
         ↘ Zustand (somente estado local de interface e sessão)  ↘ Mock Adapter em dev
```

- `src/pages` e `src/components`: interface e dados derivados simples.
- `src/queries`: queries, mutations, cache e sincronização do estado de servidor.
- `src/stores`: estado global de autenticação, interface e operação da sessão; `sessionStore` concentra as ações de venda.
- `src/api/contracts.ts`: contratos dos adaptadores HTTP.
- `src/api`: adaptadores Axios usados em produção e no modo mock.
- `src/mocks`: adaptador Axios stateful, carregado apenas no modo mock.
- `src/queryClient.ts`: política global de cache, retry e tratamento de erros.
- `src/components/ErrorBoundary.tsx`: recuperação para erros inesperados de renderização.
- `localStorage`: guarda autenticação e o estado mínimo necessário para retomar a sessão/rascunho; a API continua sendo a fonte de verdade.

## Tecnologias

- React + Vite + TypeScript
- Zustand
- TanStack Query
- Zod
- React Hook Form
- shadcn/ui e Radix UI
- Tailwind CSS
- Vitest + Testing Library
- Axios Mock Adapter para API simulada em desenvolvimento

## Execução local

```bash
pnpm install
pnpm dev
```

## Validação

```bash
pnpm test
pnpm lint
pnpm build
```

## Docker

```bash
docker compose up --build
```
