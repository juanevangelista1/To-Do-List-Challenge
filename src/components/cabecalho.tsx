import Link from "next/link";

export function Cabecalho() {
  return (
    <header className="cabecalho">
      <div className="cabecalho-conteudo">
        <Link href="/" className="marca">
          To Do List App
        </Link>
        <Link href="/tarefas/nova" className="botao primario">
          Nova tarefa
        </Link>
      </div>
    </header>
  );
}
