'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/icons';
import { TaskComposer, RunResult } from '@/components/task-composer';
import { AgentCard } from '@/components/agent-card';
import { AgentDetail } from '@/components/agent-detail';
import { useWorkspace } from '@/components/provider';
import { templates } from '@/lib/catalog';
import type { Agent, Run } from '@/lib/types';
export default function WorkspacePage() {
  const { workspace, agents, live } = useWorkspace();
  const [suggestion, setSuggestion] = useState('');
  const [agent, setAgent] = useState<Agent | null>(null);
  const [run, setRun] = useState<Run | null>(null);
  const completed = workspace.runs.filter((r) => r.status === 'completed');
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">YOUR IDEAS. A LITTLE MORE POSSIBLE.</div>
        <h1>
          Good work starts with a <em>prompt.</em>
        </h1>
        <p>A whole team of specialists. One place to bring it all together.</p>
        <div className="heading-orbit" aria-hidden="true">
          <span />
          <span />
          <span />
          <Icon name="sparkles" size={24} />
        </div>
      </div>
      <Suspense fallback={<div className="composer">Loading your workspace…</div>}>
        <TaskComposer suggestion={suggestion} />
      </Suspense>
      <div className="templates-row">
        {templates.map((t) => (
          <button
            key={t.title}
            className="template"
            onClick={() => setSuggestion(t.prompt + (suggestion === t.prompt ? ' ' : ''))}
          >
            <span className="template-icon">
              <Icon name={t.icon} size={19} />
            </span>
            <span>
              <strong>{t.title}</strong>
              <small>{t.subtitle}</small>
            </span>
            <Icon name="arrow" size={16} />
          </button>
        ))}
      </div>
      <section className="overview-strip" aria-label="Workspace statistics">
        <div>
          <span className="stat-icon">
            <Icon name="check" size={20} />
          </span>
          <span>
            <strong>{completed.length}</strong>
            <small>Tasks completed</small>
          </span>
          <span className="stat-note">
            {live ? 'Your work, delivered' : 'In your demo workspace'}
          </span>
        </div>
        <div>
          <span className="stat-icon">
            <Icon name="network" size={20} />
          </span>
          <span>
            <strong>{new Set(completed.flatMap((r) => r.agentIds)).size}</strong>
            <small>Specialists at work</small>
          </span>
        </div>
        <div>
          <span className="stat-icon">
            <Icon name="zap" size={20} />
          </span>
          <span>
            <strong>{completed.reduce((s, r) => s + r.credits, 0)}</strong>
            <small>Credits put to work</small>
          </span>
          <Link href="/billing" aria-label="View credit usage">
            <Icon name="arrow" size={18} />
          </Link>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Pick up where you left off</h2>
            <p>Your recent work, all in one place.</p>
          </div>
          <Link className="text-link" href="/runs">
            View all runs <Icon name="forward" size={15} />
          </Link>
        </div>
        <div className="run-table">
          <div className="run-table-head">
            <span>TASK</span>
            <span>AGENT TEAM</span>
            <span>STATUS</span>
            <span>CREDITS</span>
            <span />
          </div>
          {workspace.runs.slice(0, 3).map((r) => (
            <button key={r.id} className="run-table-row" onClick={() => setRun(r)}>
              <div className="run-title">
                <span className="run-file">
                  <Icon name="file" size={19} />
                </span>
                <span>
                  <strong>{r.title}</strong>
                  <small>
                    {new Date(r.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      timeZone: 'UTC',
                    })}{' '}
                    <span>·</span> {r.mode === 'demo' ? 'Sample run' : 'Task run'}
                  </small>
                </span>
              </div>
              <div className="avatar-stack">
                {r.agentIds.slice(0, 3).map((id) => {
                  const a = agents.find((a) => a.id === id);
                  return (
                    <span
                      key={id}
                      title={a?.name}
                      className={`mini-avatar ${a?.color || 'purple'}`}
                    >
                      <Icon name={a?.icon || 'sparkles'} size={14} />
                    </span>
                  );
                })}
                <small>{r.agentIds.length} agents</small>
              </div>
              <span className={`badge ${r.status}`}>
                <i />
                {r.status === 'completed' ? 'Completed' : r.status}
              </span>
              <span className="run-credit">
                {r.credits} <small>cr</small>
              </span>
              <Icon name="right" size={17} />
            </button>
          ))}
          {!workspace.runs.length && (
            <div className="empty-state">
              <Icon name="workflow" size={28} />
              <h3>Your next great result starts above.</h3>
              <p>Describe a task to create your first run.</p>
            </div>
          )}
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <h2>A few good minds to get you started</h2>
            <p>Specialists with a purpose. Ready when you are.</p>
          </div>
          <Link className="text-link" href="/agents">
            Explore marketplace <Icon name="forward" size={15} />
          </Link>
        </div>
        <div className="agent-grid featured">
          {agents.slice(0, 4).map((a) => (
            <AgentCard key={a.id} agent={a} onSelect={setAgent} />
          ))}
        </div>
      </section>
      <div className="bottom-note">
        <span className="note-icon">
          <Icon name="shield" size={19} />
        </span>
        <div>
          <strong>You’re always in the loop.</strong>
          <span> Review your team and the full cost before a single credit is spent.</span>
        </div>
        <Link href="/guide">
          How Promptly works <Icon name="arrow" size={15} />
        </Link>
      </div>
      {agent && <AgentDetail agent={agent} onClose={() => setAgent(null)} />}{' '}
      {run && <RunResult run={run} onClose={() => setRun(null)} />}
    </>
  );
}
