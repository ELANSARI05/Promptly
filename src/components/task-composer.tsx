'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Icon } from './icons';
import { Modal } from './modal';
import { useWorkspace } from './provider';
import { planTask, canAfford } from '@/lib/planner';
import { demoResult } from '@/lib/demo';
import type { Plan, Run } from '@/lib/types';
export function TaskComposer({ suggestion }: { suggestion?: string }) {
  const { agents, workspace, setWorkspace, live, api, notify, refresh, ready } = useWorkspace();
  const search = useSearchParams();
  const [prompt, setPrompt] = useState('');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState('');
  const [result, setResult] = useState<Run | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  const locked = useRef(false);
  const preferred = agents.find((a) => a.id === search.get('agent'));
  useEffect(() => {
    if (suggestion) {
      setPrompt(suggestion);
      ref.current?.focus();
    }
  }, [suggestion]);
  useEffect(() => {
    if (search.get('new')) {
      setPrompt('');
      ref.current?.focus();
    }
  }, [search]);
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (
        e.key === 'n' &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        e.preventDefault();
        ref.current?.focus();
      }
    }
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  async function prepare() {
    if (prompt.trim().length < 20) {
      notify('Add a little more detail — at least 20 characters.');
      ref.current?.focus();
      return;
    }
    setBusy(true);
    try {
      const p = live
        ? await api<Plan>('/api/plans', { prompt: prompt.trim(), agentId: preferred?.id })
        : planTask(prompt.trim(), agents, preferred?.id);
      setPlan(p);
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function execute() {
    if (!plan || locked.current || !canAfford(workspace.balance, plan.total)) return;
    locked.current = true;
    setBusy(true);
    setPhase('Your specialists are working');
    try {
      let run: Run;
      if (live) {
        run = await api<Run>('/api/runs/execute', { planId: plan.id });
        await refresh();
      } else {
        await new Promise((r) => setTimeout(r, 1200));
        setPhase('Bringing the sample result together');
        await new Promise((r) => setTimeout(r, 600));
        run = {
          id: crypto.randomUUID(),
          title: plan.title,
          prompt: plan.prompt,
          credits: plan.total,
          agentIds: plan.steps.map((s) => s.agentId),
          status: 'completed',
          createdAt: new Date().toISOString(),
          result: demoResult(plan),
          mode: 'demo',
        };
        setWorkspace((w) => ({
          ...w,
          balance: w.balance - plan.total,
          runs: [run, ...w.runs],
          transactions: [
            { id: run.id, description: run.title, amount: -plan.total, createdAt: run.createdAt },
            ...w.transactions,
          ],
        }));
      }
      setPlan(null);
      setResult(run);
      setPrompt('');
    } catch (e) {
      notify((e as Error).message);
      if (live) await refresh().catch(() => {});
    } finally {
      setBusy(false);
      setPhase('');
      locked.current = false;
    }
  }
  return (
    <>
      <div className="composer">
        <div className="composer-title">
          <span className="tiny-spark">
            <Icon name="sparkles" size={17} />
          </span>{' '}
          Big idea or small task. Start here.
        </div>
        <label className="sr-only" htmlFor="task">
          Describe your task
        </label>
        <textarea
          id="task"
          ref={ref}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          maxLength={12000}
          placeholder="What would you like to get done?"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !busy) prepare();
          }}
        />
        <div className="composer-bottom">
          <span className="routing-label">
            <Icon name="network" size={15} />
            {preferred ? preferred.name : 'Auto-select the best agents'}
            <span className="desktop-only">·</span>
            <span className="desktop-only">You approve the plan first</span>
          </span>
          <button
            className="button primary"
            onClick={prepare}
            disabled={busy || !ready || !prompt.trim()}
          >
            {busy && !plan ? <Icon name="loader" className="spin" size={16} /> : null}Build my team{' '}
            <Icon name="forward" size={17} />
          </button>
        </div>
      </div>
      {plan && (
        <Modal
          title={phase || 'A good plan comes first.'}
          onClose={() => {
            if (!busy) setPlan(null);
          }}
          wide
        >
          <p className="muted">
            {busy
              ? 'Keep this window open while your run completes.'
              : 'Your task, the right specialists, and one clear price.'}
          </p>
          <blockquote className="plan-prompt">{plan.prompt}</blockquote>
          <div className="plan-pipeline">
            <span className="pill">
              <Icon name="workflow" size={14} /> Orchestration
            </span>
            <Icon name="forward" size={16} />
            <span className="pill">Agent society</span>
            <Icon name="forward" size={16} />
            <span className="pill">Convergence</span>
          </div>
          <div className="plan-steps">
            {plan.steps.map((s, i) => (
              <div className="plan-step" key={s.agentId}>
                <span className="step-number">0{i + 1}</span>
                <span
                  className={`agent-icon small ${agents.find((a) => a.id === s.agentId)?.color || 'purple'}`}
                >
                  <Icon
                    name={agents.find((a) => a.id === s.agentId)?.icon || 'sparkles'}
                    size={19}
                  />
                </span>
                <div>
                  <strong>{s.title}</strong>
                  <p>{s.purpose}</p>
                </div>
                <span>{s.price} cr</span>
              </div>
            ))}
          </div>
          <div className="plan-total">
            <div>
              <span>Total cost</span>
              <small>Includes orchestration & convergence</small>
            </div>
            <strong>
              {plan.total} <small>credits</small>
            </strong>
          </div>
          <p className="fineprint">
            {live
              ? 'This quote is valid for 15 minutes. Failed runs are refunded automatically.'
              : 'Demo run · sample output · demo credits only. No money is charged.'}
          </p>
          {!canAfford(workspace.balance, plan.total) ? (
            <Link className="button primary full" href="/billing">
              Add credits to continue <Icon name="forward" size={16} />
            </Link>
          ) : (
            <button className="button primary full" disabled={busy} onClick={execute}>
              {busy ? (
                <>
                  <Icon name="loader" className="spin" size={17} />
                  {phase}
                </>
              ) : (
                <>
                  Approve & run · {plan.total} credits <Icon name="forward" size={17} />
                </>
              )}
            </button>
          )}
        </Modal>
      )}
      {result && <RunResult run={result} onClose={() => setResult(null)} />}
    </>
  );
}
export function RunResult({ run, onClose }: { run: Run; onClose: () => void }) {
  const { notify } = useWorkspace();
  function download() {
    const blob = new Blob([`# ${run.title}\n\n${run.result}`], {
      type: 'text/markdown;charset=utf-8',
    });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = `promptly-${run.id.slice(0, 8)}.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  }
  return (
    <Modal
      title={run.status === 'completed' ? 'Consider it brought together.' : 'Run details'}
      onClose={onClose}
      wide
    >
      <div className="result-meta">
        <span className={`badge ${run.status}`}>
          <i />
          {run.status}
        </span>
        <span>{run.agentIds.length} specialists</span>
        <span>{run.credits} credits</span>
        <span>{run.mode === 'demo' ? 'Sample output' : 'AI-generated output'}</span>
      </div>
      <div className="markdown">
        <ReactMarkdown>{run.result || 'This run has no result yet.'}</ReactMarkdown>
      </div>
      {run.outputs?.length ? (
        <details className="agent-outputs">
          <summary>Explore specialist contributions ({run.outputs.length})</summary>
          {run.outputs.map((o, i) => (
            <section key={i}>
              <h3>{o.agent}</h3>
              <div className="markdown">
                <ReactMarkdown>{o.text}</ReactMarkdown>
              </div>
            </section>
          ))}
        </details>
      ) : null}
      <div className="modal-actions">
        <button
          className="button secondary"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(run.result);
              notify('Result copied to clipboard.');
            } catch {
              notify('Clipboard unavailable. Use the download option.');
            }
          }}
        >
          <Icon name="copy" size={16} /> Copy result
        </button>
        <button className="button primary" onClick={download}>
          <Icon name="download" size={16} /> Download result
        </button>
      </div>
    </Modal>
  );
}
