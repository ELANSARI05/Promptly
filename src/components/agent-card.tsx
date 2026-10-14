'use client';
import type { Agent } from '@/lib/types';
import { Icon } from './icons';
import { useWorkspace } from './provider';
export function AgentCard({ agent, onSelect }: { agent: Agent; onSelect: (a: Agent) => void }) {
  const { workspace, setWorkspace, live, api, notify } = useWorkspace();
  const saved = workspace.favorites.includes(agent.id);
  async function toggle() {
    const favorites = saved
      ? workspace.favorites.filter((id) => id !== agent.id)
      : [...workspace.favorites, agent.id];
    try {
      if (live) await api('/api/settings', { favorites });
      setWorkspace((w) => ({ ...w, favorites }));
    } catch (e) {
      notify((e as Error).message);
    }
  }
  return (
    <article className="agent-card">
      <div className="agent-card-top">
        <span className={`agent-icon ${agent.color}`}>
          <Icon name={agent.icon} size={23} />
        </span>
        <button
          className={`save-agent ${saved ? 'saved' : ''}`}
          onClick={toggle}
          aria-label={`${saved ? 'Unsave' : 'Save'} ${agent.name}`}
          aria-pressed={saved}
        >
          <Icon name="star" size={17} />
        </button>
      </div>
      <button className="agent-title" onClick={() => onSelect(agent)}>
        {agent.name}
        <Icon name="arrow" size={17} />
      </button>
      <p>{agent.tagline}</p>
      <div className="agent-tags">
        <span>{agent.category}</span>
        <span>{agent.author === 'Promptly' ? 'By Promptly' : 'Community'}</span>
      </div>
      <div className="agent-card-bottom">
        <span>
          <Icon name="zap" size={13} />
          <strong>{agent.price}</strong> credits / run
        </span>
        <button onClick={() => onSelect(agent)}>
          Explore <Icon name="forward" size={14} />
        </button>
      </div>
    </article>
  );
}
