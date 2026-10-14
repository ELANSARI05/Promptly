'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useWorkspace } from '@/components/provider';
import { initialWorkspace } from '@/lib/demo';
import { Icon } from '@/components/icons';
import { Modal } from '@/components/modal';
export default function Settings() {
  const { workspace, setWorkspace, user, live, api, notify } = useWorkspace();
  const [busy, setBusy] = useState(false);
  const [reset, setReset] = useState(false);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get('name')).trim();
    if (!name) return;
    setBusy(true);
    try {
      if (live) await api('/api/settings', { name });
      setWorkspace((w) => ({ ...w, name }));
      notify('Workspace details saved.');
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function exportData() {
    const a = document.createElement('a');
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(workspace, null, 2)], { type: 'application/json' }),
    );
    a.href = url;
    a.download = 'promptly-workspace.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">MAKE YOURSELF AT HOME</div>
        <h1>
          A workspace that’s <em>yours.</em>
        </h1>
        <p>A few details to make Promptly work for you.</p>
      </div>
      <section className="panel settings-panel">
        <h2>Workspace details</h2>
        <form onSubmit={save}>
          <label className="field">
            Workspace name
            <input
              name="name"
              key={workspace.name}
              defaultValue={workspace.name}
              minLength={2}
              maxLength={60}
              required
            />
          </label>
          <label className="field">
            Account
            <input value={user?.email || 'Demo workspace — no account required'} readOnly />
          </label>
          <button className="button primary" disabled={busy} type="submit">
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </section>
      <section className="panel settings-panel">
        <h2>Your data, in your hands.</h2>
        <p className="panel-subtitle">
          {live
            ? 'Your runs and credit activity are stored in your account. Export a copy for your records.'
            : 'Demo activity is saved in this browser. Sign in to a configured deployment for account-backed storage and live runs.'}
        </p>
        <button className="button secondary" onClick={exportData}>
          <Icon name="download" size={16} />
          Export workspace
        </button>
        {!live && (
          <Link className="button primary" style={{ marginLeft: 10 }} href="/login">
            Sign in <Icon name="forward" size={16} />
          </Link>
        )}
      </section>
      {!live && (
        <section className="panel settings-panel">
          <h2>A fresh start</h2>
          <p className="panel-subtitle">
            Reset this browser’s demo tasks, published agents, saved agents, and credit activity to
            the original sample workspace.
          </p>
          <button className="button secondary" onClick={() => setReset(true)}>
            Reset demo workspace
          </button>
        </section>
      )}
      {reset && (
        <Modal title="Start fresh?" onClose={() => setReset(false)}>
          <p className="muted">
            Your local demo activity will be replaced with the starting sample workspace. Export
            your data first if you want to keep a copy.
          </p>
          <div className="modal-actions">
            <button className="button secondary" onClick={() => setReset(false)}>
              Keep my workspace
            </button>
            <button
              className="button primary"
              onClick={() => {
                setWorkspace(initialWorkspace());
                setReset(false);
                notify('Demo workspace reset.');
              }}
            >
              Reset demo
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
