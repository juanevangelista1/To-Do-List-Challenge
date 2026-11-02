import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <h1>Página não encontrada</h1>
      <p>A tarefa ou página que você procura não existe.</p>
      <Link href="/">Voltar para a lista</Link>
    </>
  );
}
