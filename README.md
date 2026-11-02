# To Do List App

[English](#english) | [Português](#português)

## English

A simple task manager built with Next.js 15 and tRPC. Tasks are kept in memory on the server, and the list is preloaded with Server-Side Rendering.

### Features

- Task list with SSR and infinite scroll
- Descriptions clamped to three lines on the task cards
- Task creation and editing, validated in the form and in the API
- Task deletion from the list, with confirmation and a success or error message
- Loading, empty, error and page-not-found states

### Tech stack

- **Next.js 15** (App Router), **React 19** and **TypeScript**
- **tRPC 11** with **TanStack Query 5**
- **Zod** for validation
- **Sonner** for notifications
- **Vitest** for tests

### Getting started

Requires Node.js 20 or later.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The project does not use environment variables.

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the development server |
| `npm run build` | Creates the production build |
| `npm start` | Runs the production build |
| `npm test` | Runs the tests |
| `npm run lint` | Runs ESLint |

### How it works

1. **First load:** the Home page runs on the server, fetches the first 10 tasks directly through the tRPC router and sends the HTML with the tasks already in it.
2. **Hydration:** the fetched data goes along with the page to TanStack Query, so the browser takes over without requesting those tasks again.
3. **Infinite scroll:** when the "Load more" button reaches the screen, the browser requests the next page with the cursor of the last task loaded.
4. **Create and edit:** the form validates the data with the Zod schema and sends it through a tRPC mutation. The API validates it again, updates the in-memory store, and the list is refreshed.
5. **Delete:** after the user confirms, the task is removed through a mutation, a success or error message is shown, and the list is refreshed.
6. **Errors:** validation errors appear next to each field, API errors such as "Task not found" are shown as returned, and connection failures show a message asking the user to try again.

### API

All procedures are defined in `src/server/router.ts` and exposed at `/api/trpc`. Their names and fields are in Portuguese, following the challenge specification.

| Procedure | Type | Input | Errors |
| --- | --- | --- | --- |
| `listar` | query | `limite?` (1 to 50, default 10), `cursor?` | `BAD_REQUEST` |
| `buscarPorId` | query | `id` | `BAD_REQUEST`, `NOT_FOUND` |
| `criar` | mutation | `titulo`, `descricao?` | `BAD_REQUEST` |
| `atualizar` | mutation | `id`, `titulo`, `descricao?` | `BAD_REQUEST`, `NOT_FOUND` |
| `deletar` | mutation | `id` | `BAD_REQUEST`, `NOT_FOUND` |

A task has the following shape:

```ts
type Tarefa = {
  id: number;
  titulo: string;
  descricao?: string;
  dataCriacao: string;
};
```

The title is required and has surrounding spaces removed. Titles accept up to 120 characters, and descriptions up to 1000.

### Project structure

```text
src/
├─ app/                 # pages and API route
├─ components/          # header, list and form
├─ lib/                 # validation schema and error messages
├─ server/              # in-memory store, sample tasks, router and tests
└─ trpc/                # tRPC setup for the client and the server
```

### Technical decisions

- **No extra layers:** the router accesses the store directly, because services and repositories would add nothing to an in-memory CRUD.
- **Store on `globalThis`:** keeps a single list across pages, the API and development reloads.
- **Cursor pagination:** uses the auto-incrementing `id` and fetches tasks with `id < cursor`. With offset pagination, deleting a task while scrolling would cause another one to be skipped.
- **SSR with hydration:** the server fetches the first page and hands it to TanStack Query in the browser, which continues from that data without repeating the initial request. The page uses `force-dynamic` so it is not generated statically at build time.
- **Single schema:** the form and the API share the same Zod schema. The form gives immediate feedback, and the API remains the trusted validation.
- **Full updates:** `atualizar` always receives the title and description, which removes any doubt between keeping and clearing the description.
- **Dates as ISO strings:** this avoids a transformer such as `superjson`. Dates are displayed with a fixed locale and time zone to prevent hydration differences between server and browser.
- **Accessible infinite scroll:** an `IntersectionObserver` watches the "Load more" button, which stays available for keyboard navigation and for retrying after a failure.
- **Loading state on the edit link:** a `loading.tsx` on the edit route would start streaming before the app knows whether the task exists, turning the 404 status into a 200. `useLinkStatus` shows the loading state on the link and keeps the correct status.
- **One automatic retry:** queries retry once, so a connection error appears in about two seconds instead of the longer default wait.
- **No code comments:** decisions are recorded in this README and in the commit messages.

### Limitations

- **Temporary data:** tasks are lost when the server restarts, and the app goes back to the 25 fictional sample tasks. Changes to the sample tasks only appear after a restart.
- **Single instance:** on serverless platforms, each instance would have its own memory, so tasks could diverge. That use case would require a database.
- **No authentication:** anyone with access to the app can change the tasks, which is acceptable only within the scope of this challenge.

### Tests

The tests in `src/server/router.test.ts` cover the backend rules:

- `id` and `dataCriacao` generation
- rejection of empty or whitespace-only titles
- `NOT_FOUND` error when updating or deleting a task that does not exist
- `id` and `dataCriacao` preserved on update
- pagination without skipped or repeated tasks, including when the cursor task is deleted

All data in this project is fictional.

---

## Português

Gerenciador simples de tarefas feito com Next.js 15 e tRPC. As tarefas ficam em memória no servidor, e a listagem é pré-carregada com Server-Side Rendering.

### Funcionalidades

- Listagem com SSR e infinite scroll
- Descrições limitadas a três linhas nos cards de tarefa
- Criação e edição de tarefas com validação no formulário e na API
- Exclusão direto na listagem, com confirmação e mensagem de sucesso ou erro
- Estados de carregamento, lista vazia, erro e página não encontrada

### Tecnologias

- **Next.js 15** (App Router), **React 19** e **TypeScript**
- **tRPC 11** com **TanStack Query 5**
- **Zod** para validação
- **Sonner** para as notificações
- **Vitest** para os testes

### Como executar

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). O projeto não usa variáveis de ambiente.

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o ambiente de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm start` | Executa o build de produção |
| `npm test` | Executa os testes |
| `npm run lint` | Executa o ESLint |

### Como funciona

1. **Primeiro carregamento:** a Home roda no servidor, busca as 10 primeiras tarefas diretamente pelo router tRPC e envia o HTML já com as tarefas.
2. **Hidratação:** os dados buscados seguem com a página para o TanStack Query, e o navegador assume sem pedir essas tarefas novamente.
3. **Infinite scroll:** quando o botão "Load more" chega à tela, o navegador pede a próxima página com o cursor da última tarefa carregada.
4. **Criação e edição:** o formulário valida os dados com o schema Zod e os envia por uma mutation do tRPC. A API valida de novo, atualiza o store em memória, e a lista é atualizada.
5. **Exclusão:** depois da confirmação, a tarefa é removida por uma mutation, uma mensagem de sucesso ou erro é exibida, e a lista é atualizada.
6. **Erros:** erros de validação aparecem junto a cada campo, erros da API como "Task not found" são exibidos como retornados, e falhas de conexão mostram uma mensagem pedindo para tentar novamente.

### Procedimentos da API

Todos os procedimentos ficam em `src/server/router.ts` e são expostos em `/api/trpc`. Os nomes e campos estão em português, seguindo a especificação do desafio.

| Procedimento | Tipo | Entrada | Erros |
| --- | --- | --- | --- |
| `listar` | query | `limite?` (1 a 50, padrão 10), `cursor?` | `BAD_REQUEST` |
| `buscarPorId` | query | `id` | `BAD_REQUEST`, `NOT_FOUND` |
| `criar` | mutation | `titulo`, `descricao?` | `BAD_REQUEST` |
| `atualizar` | mutation | `id`, `titulo`, `descricao?` | `BAD_REQUEST`, `NOT_FOUND` |
| `deletar` | mutation | `id` | `BAD_REQUEST`, `NOT_FOUND` |

Uma tarefa tem o seguinte formato:

```ts
type Tarefa = {
  id: number;
  titulo: string;
  descricao?: string;
  dataCriacao: string;
};
```

O título é obrigatório, e espaços nas extremidades são removidos. O título aceita até 120 caracteres, e a descrição, até 1000.

### Estrutura

```text
src/
├─ app/                 # páginas e rota da API
├─ components/          # header, listagem e formulário
├─ lib/                 # schema de validação e mensagens de erro
├─ server/              # store em memória, tarefas de exemplo, router e testes
└─ trpc/                # configuração do tRPC no cliente e no servidor
```

### Decisões técnicas

- **Sem camadas extras:** o router acessa o store diretamente, porque serviços e repositórios não trariam benefício a um CRUD em memória.
- **Store em `globalThis`:** mantém uma única lista entre as páginas, a API e os recarregamentos do ambiente de desenvolvimento.
- **Paginação por cursor:** usa o `id` autoincremental e busca as tarefas com `id < cursor`. Com offset, excluir uma tarefa durante a rolagem faria outra ser pulada.
- **SSR com hidratação:** o servidor busca a primeira página e a envia ao TanStack Query no navegador, que continua a partir desses dados sem repetir a requisição inicial. A página usa `force-dynamic` para não ser gerada de forma estática no build.
- **Schema único:** o formulário e a API usam o mesmo schema Zod. O formulário dá retorno imediato, e a API continua sendo a validação confiável.
- **Atualização completa:** `atualizar` sempre recebe o título e a descrição, o que elimina a dúvida entre "manter" e "limpar" a descrição.
- **Data como string ISO:** dispensa um transformer como o `superjson`. A exibição usa idioma e fuso fixos para evitar diferenças de hidratação entre servidor e navegador.
- **Infinite scroll acessível:** um `IntersectionObserver` observa o botão "Load more", que continua disponível para navegação por teclado e para tentar novamente após uma falha.
- **Carregamento no link de edição:** um `loading.tsx` na rota de edição começaria o streaming antes de o app saber se a tarefa existe, transformando o status 404 em 200. O `useLinkStatus` mostra o carregamento no link e mantém o status correto.
- **Uma repetição automática:** as consultas repetem uma vez, então um erro de conexão aparece em cerca de dois segundos, em vez da espera padrão mais longa.
- **Sem comentários no código:** as decisões ficam registradas neste README e nas mensagens de commit.

### Limitações

- **Dados temporários:** as tarefas são perdidas quando o servidor reinicia, e a aplicação volta a exibir as 25 tarefas fictícias iniciais. Alterações nessas tarefas só aparecem após reiniciar.
- **Uma única instância:** em plataformas serverless, cada instância teria a própria memória, então as tarefas poderiam divergir. Para esse uso, seria necessário um banco de dados.
- **Sem autenticação:** qualquer pessoa com acesso à aplicação pode alterar as tarefas, o que é adequado apenas ao escopo deste desafio.

### Testes

Os testes em `src/server/router.test.ts` cobrem as regras do backend:

- geração de `id` e `dataCriacao`
- rejeição de título vazio ou só com espaços
- erro `NOT_FOUND` ao atualizar ou excluir uma tarefa inexistente
- preservação de `id` e `dataCriacao` na atualização
- paginação sem pular nem repetir tarefas, inclusive quando a tarefa do cursor é excluída

Todos os dados do projeto são fictícios.
