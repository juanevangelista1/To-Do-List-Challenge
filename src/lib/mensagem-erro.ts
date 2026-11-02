export function obterMensagemErro(erro: { message: string; data?: unknown }) {
  return erro.data ? erro.message : "Could not connect. Please try again.";
}
