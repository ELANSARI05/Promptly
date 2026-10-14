'use client';
import { useState, type FormEvent } from 'react';
import { useWorkspace } from '@/components/provider';
import { Icon } from '@/components/icons';
import { Modal } from '@/components/modal';
import type { Agent, Category } from '@/lib/types';
export default function Developer() {
  const { workspace, setWorkspace, live, user, api, refresh, notify } = useWorkspace();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const mine = workspace.agents.filter((a) => !live || a.owner_id === user?.id);
  async function publish(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    const data = new FormData(e.currentTarget);
    const a: Agent = {
      id: crypto.randomUUID(),
      name: String(data.get('name')).trim(),
      tagline: String(data.get('tagline')).trim(),
      description: String(data.get('description')).trim(),
      category: data.get('category') as Category,
      price: Number(data.get('price')),
      systemPrompt: String(data.get('systemPrompt')).trim(),
      capabilities: String(data.get('capabilities'))
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 5),
      color: 'lavender',
      icon: 'sparkles',
      author: live ? String(user?.user_metadata?.name || 'Community builder') : 'You (demo)',
    };
    try {
      if (live) {
        await api('/api/agents', a);
        await refresh();
      } else {
        setWorkspace((w) => ({ ...w, agents: [...w.agents, a] }));
      }
      setShow(false);
      notify(
        live
          ? 'Your agent is published in the marketplace.'
          : 'Agent added to your demo marketplace.',
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-heading heading-with-action">
        <div>
          <div className="eyebrow">FOR THE PEOPLE WHO BUILD</div>
          <h1>
            Your expertise. <em>More possibility.</em>
          </h1>
          <p>Give your specialist a purpose, set a price, and let it join the society.</p>
        </div>
        <button className="button primary" onClick={() => setShow(true)}>
          <Icon name="plus" size={17} />
          Publish an agent
        </button>
      </div>
      <div className="studio-banner">
        <span className="agent-icon purple">
          <Icon name="code" size={33} />
        </span>
        <div>
          <h2>Small specialty. Meaningful impact.</h2>
          <p>
            The best agents do one thing well. Create a focused text specialist and make it
            available to the people who need it.
          </p>
        </div>
      </div>
      <div className="two-column">
        <section className="panel">
          <h2>Your agent collection</h2>
          <p className="panel-subtitle">
            {live
              ? 'Your published specialists, ready to be selected.'
              : 'Publishing here adds agents to this demo workspace only.'}
          </p>
          {mine.length ? (
            <div className="studio-list">
              {mine.map((a) => (
                <div className="studio-item" key={a.id}>
                  <span className="agent-icon lavender">
                    <Icon name="sparkles" size={20} />
                  </span>
                  <div>
                    <strong>{a.name}</strong>
                    <p>
                      {a.category} · {live ? 'Published' : 'Demo agent'}
                    </p>
                  </div>
                  <span>{a.price} cr / run</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Icon name="code" size={28} />
              <h3>A home for your first specialist.</h3>
              <p>Start with what you know best.</p>
              <button className="text-link" onClick={() => setShow(true)}>
                Create your first agent <Icon name="forward" size={15} />
              </button>
            </div>
          )}
        </section>
        <section className="panel">
          <h2>Built around your contribution.</h2>
          <div className="detail-facts">
            <div>
              <span>You set the price</span>
              <strong>1–100 credits / run</strong>
            </div>
            <div>
              <span>Your revenue share</span>
              <strong>80% of agent credits</strong>
            </div>
            <div>
              <span>Manual approval</span>
              <strong>Not required</strong>
            </div>
          </div>
          <p className="panel-subtitle">
            Live successful runs record your share in the developer earnings ledger. Cash
            withdrawals are not enabled in this release.
          </p>
          <div className="info-box">
            <strong>A focused first release.</strong>
            <br />
            Agents use a system prompt and run inside Promptly’s text generation pipeline. External
            API tools, arbitrary code execution, and autonomous actions are not enabled.
          </div>
        </section>
      </div>
      {show && (
        <Modal
          title="Give your specialist a purpose."
          onClose={() => {
            if (!busy) setShow(false);
          }}
          wide
        >
          <form onSubmit={publish}>
            <div className="form-grid">
              <label className="field">
                Agent name
                <input
                  name="name"
                  required
                  minLength={3}
                  maxLength={50}
                  placeholder="e.g. Proposal Partner"
                />
              </label>
              <label className="field">
                Category
                <select name="category">
                  {['Research', 'Writing', 'Engineering', 'Operations', 'Analysis'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="field">
              One-line introduction
              <input
                name="tagline"
                required
                minLength={10}
                maxLength={80}
                placeholder="What makes your specialist useful?"
              />
            </label>
            <label className="field">
              Description
              <textarea
                name="description"
                required
                minLength={30}
                maxLength={1000}
                placeholder="Describe the work your agent does, who it helps, and what it delivers."
              />
            </label>
            <label className="field">
              Specialist instructions
              <textarea
                name="systemPrompt"
                required
                minLength={50}
                maxLength={6000}
                placeholder="You are a specialist in… Define the agent’s role, approach, and expected output."
              />
              <small>
                These instructions guide a text model. Do not include passwords or credentials.
              </small>
            </label>
            <div className="form-grid">
              <label className="field">
                Capabilities
                <input
                  name="capabilities"
                  required
                  maxLength={200}
                  placeholder="Proposals, Editing, Research"
                />
                <small>Separate up to five skills with commas.</small>
              </label>
              <label className="field">
                Price per run (credits)
                <input
                  name="price"
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  defaultValue={5}
                  required
                />
              </label>
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="button primary full" type="submit" disabled={busy}>
              {busy ? (
                <Icon name="loader" className="spin" size={16} />
              ) : (
                <Icon name="plus" size={16} />
              )}{' '}
              {live ? 'Publish to marketplace' : 'Publish demo agent'}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
