"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div role="alert">
      <h1>Algo deu errado</h1>
      <p>Não foi possível carregar esta página.</p>
      <button type="button" onClick={reset}>
        Tentar novamente
      </button>
    </div>
  );
}
