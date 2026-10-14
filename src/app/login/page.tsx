'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Brand, Icon } from '@/components/icons';
import { authConfigured, browserDb } from '@/lib/supabase';
export default function Login() {
  const [signup, setSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    const d = new FormData(e.currentTarget);
    try {
      const email = String(d.get('email'));
      const password = String(d.get('password'));
      const result = signup
        ? await browserDb().auth.signUp({
            email,
            password,
            options: {
              data: { name: String(d.get('name')) },
              emailRedirectTo: `${window.location.origin}/workspace`,
            },
          })
        : await browserDb().auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (result.data.session) router.push('/workspace');
      else setMessage('Check your email to confirm your account, then sign in.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <section className="auth-story">
        <Link href="/">
          <Brand light />
        </Link>
        <div>
          <h1>
            A little less busywork.
            <br />A lot more possibility.
          </h1>
          <p>
            Your ideas deserve a team. Bring them to Promptly and let the right specialists help you
            move them forward.
          </p>
        </div>
        <footer>THE AGENTIC WORKFORCE FOR EVERY TASK</footer>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-form">
          <div className="eyebrow">GOOD TO HAVE YOU HERE</div>
          <h2>{signup ? 'Make room for better work.' : 'Welcome back.'}</h2>
          <p>
            {signup
              ? 'Create an account to save your work and run your team.'
              : 'Sign in to your Promptly workspace.'}
          </p>
          {!authConfigured ? (
            <>
              <div className="info-box">
                Account access is not connected on this deployment yet. You can explore the complete
                demo workspace now.
              </div>
              <Link href="/workspace" className="button primary full">
                Explore the demo <Icon name="forward" size={16} />
              </Link>
            </>
          ) : (
            <form onSubmit={submit}>
              {signup && (
                <label className="field">
                  Your name
                  <input name="name" autoComplete="name" required minLength={2} maxLength={60} />
                </label>
              )}
              <label className="field">
                Email address
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  required
                />
              </label>
              <label className="field">
                Password
                <input
                  type="password"
                  name="password"
                  minLength={8}
                  maxLength={128}
                  autoComplete={signup ? 'new-password' : 'current-password'}
                  required
                />
              </label>
              {error && (
                <p role="alert" className="form-error">
                  {error}
                </p>
              )}
              {message && (
                <p role="status" className="info-box">
                  {message}
                </p>
              )}
              <button className="button primary full" disabled={busy}>
                {busy ? <Icon name="loader" className="spin" size={16} /> : null}
                {signup ? 'Create account' : 'Sign in'}
                <Icon name="forward" size={16} />
              </button>
              <button
                type="button"
                className="auth-toggle"
                onClick={() => {
                  setSignup(!signup);
                  setError('');
                  setMessage('');
                }}
              >
                {signup ? 'Already have an account? Sign in' : 'New to Promptly? Create an account'}
              </button>
            </form>
          )}
          <Link href="/" className="auth-back">
            <Icon name="back" size={14} />
            Back to Promptly
          </Link>
        </div>
      </section>
    </div>
  );
}
