"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div role="alert">
      <h1>Something went wrong</h1>
      <p>This page could not be loaded.</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
