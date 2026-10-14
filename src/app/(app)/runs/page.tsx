'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useWorkspace } from '@/components/provider';
import { Icon } from '@/components/icons';
import { RunResult } from '@/components/task-composer';
import type { Run } from '@/lib/types';
export default function Runs() {
  const { workspace, live, refresh, notify } = useWorkspace();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All runs');
  const [selected, setSelected] = useState<Run | null>(null);
  const visible = workspace.runs.filter(
    (r) =>
      r.title.toLowerCase().includes(query.toLowerCase()) &&
      (filter === 'All runs' || r.status === filter.toLowerCase()),
  );
  return (
    <>
      <div className="page-heading heading-with-action">
        <div>
          <div className="eyebrow">YOUR WORK, BROUGHT TOGETHER</div>
          <h1>
            Good things <em>get done.</em>
          </h1>
          <p>Every task, every team, every result. Right where you left them.</p>
        </div>
        <Link href="/workspace?new=1" className="button primary">
          <Icon name="plus" size={17} />
          New task
        </Link>
      </div>
      <div className="filter-toolbar">
        <label className="search-field">
          <Icon name="search" size={18} />
          <input
            aria-label="Search runs"
            placeholder="Find a task…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        {live && (
          <button
            className="button secondary"
            onClick={() => refresh().catch((e) => notify(e.message))}
          >
            Refresh runs
          </button>
        )}
      </div>
      <div className="tabs">
        {['All runs', 'Completed', 'Running', 'Failed'].map((f) => (
          <button
            className={filter === f ? 'active' : ''}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            key={f}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="history-list">
        {visible.map((r) => (
          <button key={r.id} className="history-item" onClick={() => setSelected(r)}>
            <span className="run-file">
              <Icon name="file" />
            </span>
            <div>
              <strong>{r.title}</strong>
              <p>
                {new Date(r.createdAt).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                  timeZone: 'UTC',
                })}{' '}
                · {r.agentIds.length} agents · {r.mode === 'demo' ? 'Demo' : 'Live'}
              </p>
            </div>
            <span className={`badge ${r.status}`}>
              <i />
              {r.status}
            </span>
            <span>{r.credits} cr</span>
            <Icon name="arrow" size={18} />
          </button>
        ))}
      </div>
      {!visible.length && (
        <div className="empty-state">
          <Icon name="workflow" size={30} />
          <h3>A little space for your next big thing.</h3>
          <p>
            {query
              ? 'No runs match your search.'
              : 'Start a task and your results will appear here.'}
          </p>
          <Link href="/workspace" className="button primary">
            Create a task
          </Link>
        </div>
      )}
      {selected && <RunResult run={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
