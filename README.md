# To Do List App

Gerenciador simples de tarefas feito com Next.js 15 e tRPC. As tarefas ficam em memória no servidor, e a listagem é pré-carregada com Server-Side Rendering.

## Funcionalidades

- Listagem com SSR e infinite scroll
- Criação e edição de tarefas com validação no formulário e na API
- Exclusão direto na listagem, com confirmação e mensagem de sucesso ou erro
- Estados de carregamento, lista vazia, erro e página não encontrada

## Tecnologias

- **Next.js 15** (App Router), **React 19** e **TypeScript**
- **tRPC 11** com **TanStack Query 5**
- **Zod** para validação
- **Sonner** para as notificações
- **Vitest** para os testes

## Como executar

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). O projeto não usa variáveis de ambiente.

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o ambiente de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm start` | Executa o build de produção |
| `npm test` | Executa os testes |
| `npm run lint` | Executa o ESLint |

## API

Todos os procedimentos ficam em `src/server/router.ts` e são expostos em `/api/trpc`.

| Procedimento | Tipo | Entrada | Erros |
|---|---|---|---|
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

## Estrutura

```text
src/
├─ app/                 # páginas e rota da API
├─ components/          # listagem e formulário
├─ lib/                 # schema de validação e paginação
├─ server/              # store em memória, router e testes
└─ trpc/                # configuração do tRPC no cliente e no servidor
```

## Decisões técnicas

- **Sem camadas extras:** o router acessa o store diretamente, porque serviços e repositórios não trariam benefício a um CRUD em memória.
- **Store em `globalThis`:** mantém uma única lista entre as páginas, a API e os recarregamentos do ambiente de desenvolvimento.
- **Paginação por cursor:** usa o `id` autoincremental e busca as tarefas com `id < cursor`. Com offset, excluir uma tarefa durante a rolagem faria outra ser pulada.
- **SSR com hidratação:** o servidor busca a primeira página e a envia ao TanStack Query no navegador, que continua a partir desses dados sem repetir a requisição inicial. A página usa `force-dynamic` para não ser gerada de forma estática no build.
- **Schema único:** o formulário e a API usam o mesmo schema Zod. O formulário dá retorno imediato, e a API continua sendo a validação confiável.
- **Atualização completa:** `atualizar` sempre recebe o título e a descrição, o que elimina a dúvida entre "manter" e "limpar" a descrição.
- **Data como string ISO:** dispensa um transformer como o `superjson`. A exibição usa idioma e fuso fixos para evitar diferenças de hidratação entre servidor e navegador.
- **Infinite scroll acessível:** um `IntersectionObserver` observa o botão "Load more", que continua disponível para navegação por teclado e para tentar novamente após uma falha.
- **Sem comentários no código:** as decisões ficam registradas neste README e nas mensagens de commit.

## Limitações

- **Dados temporários:** as tarefas são perdidas quando o servidor reinicia, e a aplicação volta a exibir as 25 tarefas fictícias iniciais.
- **Uma única instância:** em plataformas serverless, cada instância teria a própria memória, então as tarefas poderiam divergir. Para esse uso, seria necessário um banco de dados.
- **Sem autenticação:** qualquer pessoa com acesso à aplicação pode alterar as tarefas, o que é adequado apenas ao escopo deste desafio.

## Testes

Os testes em `src/server/router.test.ts` cobrem as regras do backend:

- geração de `id` e `dataCriacao`
- rejeição de título vazio ou só com espaços
- erro `NOT_FOUND` ao atualizar ou excluir uma tarefa inexistente
- preservação de `id` e `dataCriacao` na atualização
- paginação sem pular nem repetir tarefas, inclusive quando a tarefa do cursor é excluída

Todos os dados do projeto são fictícios.
