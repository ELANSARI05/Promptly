'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="empty-state">
      <h1>Let’s try that again.</h1>
      <p>Something interrupted this page. Reload it to continue.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
