import Link from "next/link";

export function Cabecalho() {
  return (
    <header className="app-header">
      <div className="app-header-content">
        <Link href="/" className="brand">
          To Do List App
        </Link>
        <Link href="/tarefas/nova" className="button primary">
          New task
        </Link>
      </div>
    </header>
  );
}
