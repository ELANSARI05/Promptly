import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="empty-state" style={{ margin: '12vh auto', maxWidth: 600 }}>
      <h1>A small detour.</h1>
      <p>We couldn’t find that page. Your workspace is right this way.</p>
      <Link href="/workspace" className="button primary">
        Back to workspace
      </Link>
    </main>
  );
}
