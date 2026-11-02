import type { DadosTarefa } from "@/lib/tarefa-schema";

const titulos = [
  "Revisar proposta do projeto Aurora",
  "Atualizar planilha de custos",
  "Agendar reunião de alinhamento",
  "Preparar apresentação trimestral",
  "Responder dúvidas da equipe de suporte",
  "Organizar arquivos compartilhados",
  "Escrever relatório semanal",
  "Testar novo fluxo de cadastro",
  "Corrigir textos da página inicial",
  "Comprar material de escritório",
  "Renovar assinatura de ferramentas",
  "Mapear processos de atendimento",
  "Definir metas do próximo ciclo",
  "Revisar contrato de fornecedor fictício",
  "Enviar convite do workshop interno",
  "Documentar decisões da última reunião",
  "Priorizar itens do backlog",
  "Conferir agenda da semana",
  "Atualizar quadro de tarefas",
  "Coletar feedback dos usuários de teste",
  "Planejar treinamento da equipe",
  "Validar layout da tela de login",
  "Arquivar tarefas concluídas",
  "Revisar checklist de lançamento",
  "Fazer retrospectiva da sprint",
];

export const tarefasIniciais: DadosTarefa[] = titulos.map((titulo, indice) => ({
  titulo,
  descricao: indice % 3 === 0 ? `Tarefa de exemplo número ${indice + 1}.` : undefined,
}));
